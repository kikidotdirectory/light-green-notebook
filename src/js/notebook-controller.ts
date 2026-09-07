import { checkMode } from "./mode.ts";
import { type PageStore } from "./page-state.ts";
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
	// when in single-page mode, the notebook-viewer needs to know when a scroll is switching in between pages so it can update the toc.
	// to do this, it gets all the spreads and creates a new array containing pairings of the last page of one spread and the first of the next.
	let ticking = false;
	let ranges: { min: number; max: number; apply: (progress: number) => void }[] = [];

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

		const wrapperSnaps = Array.from(notebookContainer.querySelectorAll<HTMLElement>(".spread-wrapper"))
			.map((wrapper) => {
				const snaps = Array.from(wrapper.querySelectorAll(".page-snap"));
				const spans = snaps.map((snap) => toContentSpace(snap.getBoundingClientRect()));
				return {
					spread: Number(wrapper.dataset.spread),
					first: restLeft(snaps[0], spans[0]),
					last: restLeft(snaps[snaps.length - 1], spans[spans.length - 1]),
				};
			});

		ranges = wrapperSnaps
			.slice(0, -1)
			.map(({ last, spread }, i) => {
				const next = wrapperSnaps[i + 1];
				return {
					min: last,
					max: next.first,
					apply: (progress: number) => {
						toc.setScrollProgress(spread, progress);
					},
				};
			})
			.filter((r) => r.max > r.min);
	}

	notebookContainer.addEventListener("scroll", () => {
		if (mode.get() !== "single") return;
		if (ticking) return;

		ticking = true;
		requestAnimationFrame(() => {
			const x = notebookContainer.scrollLeft;
			for (const r of ranges) {
				if (x >= r.min && x <= r.max) {
					r.apply((x - r.min) / (r.max - r.min));
				}
			}
			ticking = false;
		});
	}, { passive: true });

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
