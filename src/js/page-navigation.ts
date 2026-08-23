declare const totalSpreads: number;
let currentPageNum: number;

const fileName = (page: number) => String(page).padStart(4, "0");
const pageSrc = (pageNum: number) => "/assets/spreads/" + fileName(pageNum) + "." + fileExt;

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

function replaceSpreadImage(pageNum: number) {
	const newImage = document.createElement("img");
	newImage.className = spreadImage.className;
	newImage.alt = spreadImage.alt;
	newImage.src = pageSrc(pageNum);
	spreadImage.replaceWith(newImage);
	spreadImage = newImage;
}

function flipPage(delta: number) {
	const dest = currentPageNum + delta;
	// prevent navigation from going outside bounds of notebook
	if (dest < 0 || dest >= totalSpreads) return;

	// change the page
	currentPageNum = dest;
	notebookViewer.dataset.spread = currentPageNum.toString();
	replaceSpreadImage(currentPageNum);
	setState(currentPageNum);

	// preload the next page in the current direction
	preloadPage(currentPageNum + delta);
}

function preloadPage(pageNum: number) {
	if (pageNum < 0) return;
	if (pageNum >= totalSpreads) return;
	const img = new Image();
	img.src = pageSrc(pageNum);
}

// On page load, render notebook.
const fileExt = "png";
const notebookID = "lgn";

const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
const next = document.querySelector(".page-link.next") as HTMLButtonElement;
let spreadImage = document.querySelector(".spread-image") as HTMLImageElement;

prev?.addEventListener("click", () => flipPage(-1));
next?.addEventListener("click", () => flipPage(1));

currentPageNum = getState();
if (currentPageNum) {
	replaceSpreadImage(currentPageNum);
}
preloadPage(currentPageNum - 1);
preloadPage(currentPageNum + 1);
