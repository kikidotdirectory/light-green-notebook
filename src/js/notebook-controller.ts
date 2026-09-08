import { checkMode } from "./mode.ts";
import { type PageStore } from "./page-state.ts";
import { onScrollSettle } from "./scroll-settle.ts";
import { type TocApi } from "./toc.ts";

declare const totalSpreads: number;

export function initNotebook(pageStore: PageStore, toc: TocApi) {
	const notebookViewer = document.querySelector<HTMLElement>(".notebook-viewer")!;
	const notebookContainer = document.querySelector<HTMLElement>(".notebook-container")!;
	const spreads = document.querySelectorAll<HTMLElement>(".spread-wrapper");
	const images = new Map(Array.from(
		spreads,
		(spread) => [
			Number(spread.dataset.spread),
			spread.querySelector<HTMLImageElement>(".scroll-image")!,
		],
	));

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

	const prev = document.querySelectorAll<HTMLButtonElement>(".page-link.prev");
	const next = document.querySelectorAll<HTMLButtonElement>(".page-link.next");
	prev.forEach((prev) => {
		prev.addEventListener("click", () => flipPage(-1));
	});
	next.forEach((next) => {
		next.addEventListener("click", () => flipPage(1));
	});

	const mode = checkMode();

	/* scroll syncing */
	// when in single-page mode, the notebook-viewer needs to know when a scroll settles on a
	// different spread so it can update the toc (and vice versa, when the toc is dragged).
	// true while notebookContainer itself just scrolled programmatically (from a toc drag),
	// so its own settle handler can ignore the resulting event
	let notebookSelfScroll = false;
	let spreadStarts = new Map<number, number>();

	function buildRanges() {
		const containerRect = notebookContainer.getBoundingClientRect();
		const scrollLeft = notebookContainer.scrollLeft;

		function toContentSpace(rect: DOMRect) {
			const left = rect.left - containerRect.left + scrollLeft;
			return { left, right: left + rect.width };
		}

		// the cover element has scroll-snap-align: left, this handles that
		function restLeft(el: Element, span: { left: number; right: number }) {
			if (getComputedStyle(el).scrollSnapAlign === "center") {
				return (span.left + span.right) / 2 - containerRect.width / 2;
			}
			return span.left;
		}

		spreadStarts = new Map(
			Array.from(notebookContainer.querySelectorAll<HTMLElement>(".spread-wrapper"))
				.map((wrapper) => {
					const snaps = Array.from(wrapper.querySelectorAll(".page-snap"));
					const spans = snaps.map((snap) => toContentSpace(snap.getBoundingClientRect()));
					snaps.map((snap) => console.log(snap, snap.getBoundingClientRect()));
					return [Number(wrapper.dataset.spread), restLeft(snaps[0], spans[0])] as const;
				}),
		);
		console.log(spreadStarts);
	}

	// finds the spread whose rest position is nearest to the notebook's current scroll
	function nearestSpreadToScroll(x: number): number | undefined {
		let closest: number | undefined;
		let closestDist = Infinity;
		for (const [spread, start] of spreadStarts) {
			const dist = Math.abs(start - x);
			if (dist < closestDist) {
				closestDist = dist;
				closest = spread;
			}
		}
		return closest;
	}

	// dragging the toc (mobile) calls this to scrub the notebook to match
	function scrollNotebookToSpread(spread: number) {
		if (mode.get() !== "single") return;
		const x = spreadStarts.get(spread);
		if (x === undefined) return;
		if (Math.abs(notebookContainer.scrollLeft - x) < 1) return;
		notebookSelfScroll = true;
		notebookContainer.scrollLeft = x;
	}
	toc.onScrub(scrollNotebookToSpread);

	onScrollSettle(notebookContainer, () => {
		if (notebookSelfScroll) {
			notebookSelfScroll = false;
			return;
		}
		if (mode.get() !== "single") return;

		const dest = nearestSpreadToScroll(notebookContainer.scrollLeft);
		if (dest === undefined) return;
		toc.scrollToSpread(dest);
		if (dest !== pageStore.get()) pageStore.set(dest);
	});

	// page rendering responds to pageStore updates
	pageStore.subscribe((pageNum) => {
		renderSpread(pageNum);
	});

	mode.subscribe((current) => {
		// rects are only meaningful once .notebook-container is actually the
		// active, laid-out scroller, which only happens in single mode
		if (current === "single") buildRanges();
	});
}
