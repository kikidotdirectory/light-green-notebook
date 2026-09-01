import { type PageStore } from "./page-state.ts";

declare const totalSpreads: number;

type Mode = "single" | "double";

export function initNotebook(pageStore: PageStore) {
	const fileExt = "png";

	const notebookViewer = document.querySelector(
		".notebook-viewer",
	) as HTMLElement;
	const spreadImage = document.querySelector(
		".spread-image",
	) as HTMLImageElement;
	const scrollContainer = document.querySelector(
		".notebook-scroll",
	) as HTMLElement;
	// one entry per spread, holding its .page-snap targets in left-to-right
	// order (the cover spread has just one; every other spread has two, one
	// per physical page)
	const pageSnaps = Array.from(
		scrollContainer.querySelectorAll(".spread-wrapper"),
	).map((wrapper) => Array.from(wrapper.querySelectorAll(".page-snap"))) as HTMLElement[][];

	const fileName = (pageNum: number) => String(pageNum).padStart(3, "0");
	const pageSrc = (pageNum: number) => "/assets/spreads/" + fileName(pageNum) + "." + fileExt;

	function replaceSpreadImage(pageNum: number) {
		if (pageNum === 0) return;
		spreadImage.src = pageSrc(pageNum);
	}

	function renderSpread(pageNum: number) {
		notebookViewer.dataset.spread = pageNum.toString();
		replaceSpreadImage(pageNum);
		// in single mode the scroll-image list is doing its own (lazy)
		// loading, so eagerly preloading neighbors here would be redundant
		if (mode.get() === "double") {
			preloadPage(pageNum - 1);
			preloadPage(pageNum + 1);
		}
	}

	// which page-snap to land on when a spread change lands in single mode:
	// moving forward should show that spread's left page, moving backward
	// should show its right page
	let pendingEdge: "start" | "end" = "start";

	function flipPage(delta: number) {
		const dest = pageStore.get() + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		pendingEdge = delta < 0 ? "end" : "start";
		pageStore.set(dest);
	}

	function preloadPage(pageNum: number) {
		if (pageNum < 0) return;
		if (pageNum > totalSpreads) return;
		const img = new Image();
		img.src = pageSrc(pageNum);
	}

	const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
	const next = document.querySelector(".page-link.next") as HTMLButtonElement;
	prev?.addEventListener("click", () => flipPage(-1));
	next?.addEventListener("click", () => flipPage(1));

	function scrollToSpread(pageNum: number, behavior: ScrollBehavior, edge: "start" | "end" = "start") {
		const snaps = pageSnaps[pageNum];
		if (!snaps || snaps.length === 0) return;
		const target = edge === "end" ? snaps[snaps.length - 1] : snaps[0];
		const inline = pageNum === 0 ? "start" : "center";
		target.scrollIntoView({ behavior, inline, block: "nearest" });
	}

	// fires once the container settles after a user swipe. A programmatic
	// scrollToSpread call also settles into a scrollend, but by then
	// pageStore already matches the scrolled-to spread, so the equality
	// check below makes that case a no-op instead of feeding back into
	// another pageStore.set.
	function onScrollEnd() {
		const containerRect = scrollContainer.getBoundingClientRect();
		const center = containerRect.left + containerRect.width / 2;
		let closest = pageStore.get();
		let closestEdge: "start" | "end" = "start";
		let closestDist = Infinity;
		pageSnaps.forEach((snaps, pageNum) => {
			snaps.forEach((snap, i) => {
				const rect = snap.getBoundingClientRect();
				const dist = Math.abs(rect.left + rect.width / 2 - center);
				if (dist < closestDist) {
					closestDist = dist;
					closest = pageNum;
					closestEdge = i === snaps.length - 1 ? "end" : "start";
				}
			});
		});
		if (closest !== pageStore.get()) {
			// resync to the edge the swipe actually landed on, so the
			// resulting pageStore update's re-scroll below is a no-op
			// instead of fighting the swipe by jumping to the other page
			pendingEdge = closestEdge;
			pageStore.set(closest);
		}
	}

	scrollContainer.addEventListener("scrollend", onScrollEnd);

	const mode = checkMode();

	pageStore.subscribe((pageNum) => {
		renderSpread(pageNum);
		if (mode.get() === "single") {
			scrollToSpread(pageNum, "smooth", pendingEdge);
			pendingEdge = "start";
		}
	});

	mode.subscribe((current) => {
		// re-sync scroll position on every entry: a hidden (display:none)
		// scroll container can lose its scrollLeft, and the user may have
		// navigated pages while in double mode. pendingEdge carries over
		// from any flip that happened while in double mode, so this lands
		// on the same side the user was last reading from.
		if (current === "single") {
			scrollToSpread(pageStore.get(), "instant", pendingEdge);
			pendingEdge = "start";
		}
	});
}

function checkMode() {
	const rootStyle = getComputedStyle(document.documentElement);
	const layoutCol = rootStyle.getPropertyValue("--layout-col").trim();
	const layoutRow = rootStyle.getPropertyValue("--layout-row").trim();

	const shiftQuery = matchMedia(
		`(max-width: ${layoutCol}), (max-height: ${layoutRow})`,
	);

	const listeners = new Set<(mode: Mode) => void>();

	function applyMode(isShifted: boolean) {
		const mode: Mode = isShifted ? "single" : "double";
		document.documentElement.dataset.mode = mode;
		listeners.forEach((listener) => listener(mode));
	}

	applyMode(shiftQuery.matches);
	shiftQuery.addEventListener("change", (e) => applyMode(e.matches));

	return {
		get: (): Mode => document.documentElement.dataset.mode as Mode,
		subscribe: (listener: (mode: Mode) => void) => {
			listeners.add(listener);
			listener(document.documentElement.dataset.mode as Mode);
		},
	};
}
