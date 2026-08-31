import { type PageStore } from "./page-state.ts";

declare const totalSpreads: number;

export function initNotebook(pageStore: PageStore) {
	const fileExt = "png";

	const notebookViewer = document.querySelector(
		".notebook-viewer",
	) as HTMLElement;
	const spreadImage = document.querySelector(
		".spread-image",
	) as HTMLImageElement;

	const fileName = (pageNum: number) => String(pageNum).padStart(3, "0");
	const pageSrc = (pageNum: number) => "/assets/spreads/" + fileName(pageNum) + "." + fileExt;

	function replaceSpreadImage(pageNum: number) {
		if (pageNum === 0) return;
		spreadImage.src = pageSrc(pageNum);
	}

	function renderSpread(pageNum: number) {
		notebookViewer.dataset.spread = pageNum.toString();
		replaceSpreadImage(pageNum);
		preloadPage(pageNum - 1);
		preloadPage(pageNum + 1);
	}

	function flipPage(delta: number) {
		const dest = pageStore.get() + delta;
		if (dest < 0 || dest >= totalSpreads) return;
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

	pageStore.subscribe(renderSpread);
}
