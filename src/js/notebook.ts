import { checkMode } from "./mode.ts";
import { type PageStore } from "./page-state.ts";

declare const totalSpreads: number;

export function initNotebook(pageStore: PageStore) {
	const notebookViewer = document.querySelector(
		".notebook-viewer",
	) as HTMLElement;
	const spreads = document.querySelectorAll(
		".spread-wrapper",
	) as NodeListOf<HTMLElement>;
	const images = new Map(
		Array.from(spreads, (spread) => [
			Number(spread.dataset.spread),
			spread.querySelector(".scroll-image") as HTMLImageElement,
		]),
	);
	// one entry per spread, holding its .page-snap targets in left-to-right
	// order (the cover spread has just one; every other spread has two, one
	// per physical page)
	// const pageSnaps = Array.from(
	// 	scrollContainer.querySelectorAll(".spread-wrapper"),
	// ).map((wrapper) => Array.from(wrapper.querySelectorAll(".page-snap"))) as HTMLElement[][];

	function renderSpread(pageNum: number) {
		notebookViewer.dataset.activeSpread = pageNum.toString();
		for (const spread of spreads) {
			const isCurrent = Number(spread.dataset.spread) === pageStore.get();
			spread.dataset.active = String(isCurrent);
		}
		// in single mode the scroll-image list is doing its own (lazy)
		// loading, so eagerly preloading neighbors here would be redundant
		if (mode.get() === "double") {
			preloadSpread(pageNum - 1);
			preloadSpread(pageNum + 1);
		}
	}

	// which page-snap to land on when a spread change lands in single mode:
	// moving forward should show that spread's left page, moving backward
	// should show its right page
	let pendingEdge: "start" | "end" = "start";

	function flipPage(delta: number) {
		const dest = pageStore.get() + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		// pendingEdge = delta < 0 ? "end" : "start";
		pageStore.set(dest);
	}

	function preloadSpread(spreadNum: number) {
		if (spreadNum < 0) return;
		if (spreadNum > totalSpreads) return;
		const image = images.get(spreadNum);
		if (image) image.loading = "eager";
	}

	const prev = document.querySelectorAll(".page-link.prev") as NodeListOf<HTMLButtonElement>;
	const next = document.querySelectorAll(".page-link.next") as NodeListOf<HTMLButtonElement>;
	prev.forEach((prev) => {
		prev.addEventListener("click", () => flipPage(-1));
	});
	next.forEach((next) => {
		next.addEventListener("click", () => flipPage(1));
	});

	// function scrollToSpread(pageNum: number, behavior: ScrollBehavior, edge: "start" | "end" = "start") {
	// 	const snaps = pageSnaps[pageNum];
	// 	if (!snaps || snaps.length === 0) return;
	// 	const target = edge === "end" ? snaps[snaps.length - 1] : snaps[0];
	// 	const inline = pageNum === 0 ? "start" : "center";
	// 	target.scrollIntoView({ behavior, inline, block: "nearest" });
	// }

	const mode = checkMode();

	pageStore.subscribe((pageNum) => {
		renderSpread(pageNum);
		// if (mode.get() === "single") {
		// 	scrollToSpread(pageNum, "smooth", pendingEdge);
		// 	pendingEdge = "start";
		// }
	});

	mode.subscribe((current) => {
		// re-sync scroll position on every entry: a hidden (display:none)
		// scroll container can lose its scrollLeft, and the user may have
		// navigated pages while in double mode. pendingEdge carries over
		// from any flip that happened while in double mode, so this lands
		// on the same side the user was last reading from.

		// if (current === "single") {
		// 	scrollToSpread(pageStore.get(), "instant", pendingEdge);
		// 	pendingEdge = "start";
		// }
	});
}
