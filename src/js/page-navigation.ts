declare const assetsDir: string;
declare const fileExt: string;
declare const notebookID: string;
declare const totalSpreads: number;
declare function fileName(pageNum: number): string;

interface NotebookState {
	pageNum: number;
}

let currentPageNum: number;
const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
const nextButtons = document.querySelectorAll(".page-link.next") as NodeListOf<HTMLButtonElement>;
const spreadImage = document.querySelector(".spread-image") as HTMLImageElement;
const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;

prev?.addEventListener("click", () => toPage(-1));
nextButtons.forEach((next) => next.addEventListener("click", () => toPage(1)));

function getState() {
	try {
		const raw = localStorage.getItem(notebookID);
		return raw ? JSON.parse(raw) : { pageNum: 0 };
	} catch {
		return { pageNum: 0 };
	}
}

function setState(partial: NotebookState) {
	const updated = { ...getState(), ...partial };
	localStorage.setItem(notebookID, JSON.stringify(updated));
}

function getPage() {
	currentPageNum = getState().pageNum;
	spreadImage.src = imgSrc(currentPageNum);
	notebookViewer.dataset.spread = currentPageNum.toString();
}

function imgSrc(pageNum: number) {
	return assetsDir + fileName(pageNum) + "." + fileExt;
}

function toPage(delta: number) {
	const dest = currentPageNum + delta;
	// prevent navigation from going outside bounds of notebook
	if (dest < 0 || dest > totalSpreads) return;

	// change the page
	currentPageNum = dest;
	notebookViewer.dataset.spread = currentPageNum.toString();
	spreadImage.src = imgSrc(currentPageNum);
	setState({ pageNum: currentPageNum });

	// preload the next page in the current direction
	if (currentPageNum !== 0 && currentPageNum !== totalSpreads) {
		preloadPage(currentPageNum + delta);
	}
}

function preloadPage(pageNum: number) {
	const img = new Image();
	img.src = imgSrc(pageNum);
}

// On page load, render notebook.
getPage();
