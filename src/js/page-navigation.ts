import type { CurrPage } from "./page-store.ts";

declare const totalSpreads: number;

export function createNotebook(currPage: CurrPage) {
	const fileExt = "png";
	const notebookID = "lgn";

	const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
	const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
	const next = document.querySelector(".page-link.next") as HTMLButtonElement;
	const spreadImage = document.querySelector(".spread-image") as HTMLImageElement;

	const fileName = (pageNum: number) => String(pageNum).padStart(3, "0");
	const pageSrc = (pageNum: number) => "/assets/spreads/" + fileName(pageNum) + "." + fileExt;
	const hashFor = (pageNum: number) => "#" + fileName(pageNum);

	function getState(): number {
		try {
			const raw = Number(localStorage.getItem(notebookID));
			return raw < totalSpreads ? raw : 0;
		} catch {
			return 0;
		}
	}

	function setState(pageNum: number) {
		localStorage.setItem(notebookID, pageNum.toString());
	}

	// callers can fall back to the last-viewed page from localStorage.
	function parseHash(): number | null {
		const raw = location.hash.slice(1);
		if (!/^\d+$/.test(raw)) return null;
		const pageNum = Number(raw);
		if (pageNum < 0 || pageNum >= totalSpreads) return null;
		return pageNum;
	}

	function updateHash(pageNum: number) {
		const target = hashFor(pageNum);
		if (location.hash === target) return;
		history.replaceState(null, "", target);
	}

	function replaceSpreadImage(pageNum: number) {
		if (pageNum === 0) return;
		spreadImage.src = pageSrc(pageNum);
	}

	function renderSpread(pageNum: number) {
		notebookViewer.dataset.spread = pageNum.toString();
		replaceSpreadImage(pageNum);
		setState(pageNum);
		updateHash(pageNum);
		preloadPage(pageNum - 1);
		preloadPage(pageNum + 1);
	}

	function flipPage(delta: number) {
		const dest = currPage.get() + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		currPage.set(dest);
	}

	function preloadPage(pageNum: number) {
		if (pageNum < 0) return;
		if (pageNum > totalSpreads) return;
		const img = new Image();
		img.src = pageSrc(pageNum);
	}

	// On page load, render notebook.
	function init() {
		currPage.subscribe(renderSpread);

		prev?.addEventListener("click", () => flipPage(-1));
		next?.addEventListener("click", () => flipPage(1));

		const resolved = parseHash() ?? getState();
		currPage.set(resolved);

		window.addEventListener("hashchange", () => {
			const pageNum = parseHash();
			if (pageNum !== null) currPage.set(pageNum);
		});
	}

	return { flipPage, init };
}
