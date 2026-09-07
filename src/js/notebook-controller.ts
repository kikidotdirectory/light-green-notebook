import { checkMode } from "./mode.ts";
import { type PageStore } from "./page-state.ts";

declare const totalSpreads: number;

export function initNotebook(pageStore: PageStore) {
	const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
	const spreads = document.querySelectorAll(".spread-wrapper") as NodeListOf<HTMLElement>;
	const images = new Map(Array.from(
		spreads,
		(spread) => [
			Number(spread.dataset.spread),
			spread.querySelector(".scroll-image") as HTMLImageElement,
		],
	));

	let pendingEdge: "start" | "end" = "start";

	/* Helpers -------------------------------------------------- */

	/* [data-mode="double"] only:
	 * images have loading="lazy" by default so the browser does not download them while
	 * they aren't visible (which none of them are in data-mode="double"). to preload them, set
	 * loading="eager", prompting the browser to download them immediately */
	function preloadSpread(spreadNum: number) {
		if (spreadNum < 0) return;
		if (spreadNum > totalSpreads) return;
		const image = images.get(spreadNum);
		if (image) image.loading = "eager";
	}

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

	function flipPage(delta: number) {
		const dest = pageStore.get() + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		// pendingEdge = delta < 0 ? "end" : "start";
		pageStore.set(dest);
	}

	const prev = document.querySelectorAll(".page-link.prev") as NodeListOf<HTMLButtonElement>;
	const next = document.querySelectorAll(".page-link.next") as NodeListOf<HTMLButtonElement>;
	prev.forEach((prev) => {
		prev.addEventListener("click", () => flipPage(-1));
	});
	next.forEach((next) => {
		next.addEventListener("click", () => flipPage(1));
	});

	const mode = checkMode();

	notebookViewer.addEventListener("scroll", () => {
		if (mode.get() !== "single") return;
		const maxScroll = notebookViewer.scrollWidth - notebookViewer.clientWidth;
		console.log(maxScroll);
	});

	pageStore.subscribe((pageNum) => {
		renderSpread(pageNum);
	});

	mode.subscribe((current) => {
	});
}
