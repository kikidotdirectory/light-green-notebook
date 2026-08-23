declare const totalSpreads: number;

let currentPageNum: number;

const fileName = (page: number) => String(page).padStart(4, "0");

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

function getPage() {
	currentPageNum = getState();
	replaceSpreadImage(currentPageNum);
	notebookViewer.dataset.spread = currentPageNum.toString();
}

function numToPageSrc(pageNum: number) {
	return "/assets/spreads/" + fileName(pageNum) + "." + fileExt;
}

function replaceSpreadImage(pageNum: number) {
	const newImage = document.createElement("img");
	newImage.className = spreadImage.className;
	newImage.alt = spreadImage.alt;
	newImage.src = numToPageSrc(pageNum);
	spreadImage.replaceWith(newImage);
	spreadImage = newImage;
}

function incrementPage(delta: number) {
	const dest = currentPageNum + delta;
	// prevent navigation from going outside bounds of notebook
	if (dest < 0 || dest >= totalSpreads) return;

	// change the page
	currentPageNum = dest;
	notebookViewer.dataset.spread = currentPageNum.toString();
	replaceSpreadImage(currentPageNum);
	setState(currentPageNum);

	// preload the next page in the current direction
	if (currentPageNum !== 0 && currentPageNum !== totalSpreads) {
		preloadPage(currentPageNum + delta);
	}
}

function preloadPage(pageNum: number) {
	const img = new Image();
	img.src = numToPageSrc(pageNum);
}

// On page load, render notebook.
const fileExt = "png";
const notebookID = "lgn";

const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
const next = document.querySelector(".page-link.next") as HTMLButtonElement;
let spreadImage = document.querySelector(".spread-image") as HTMLImageElement;

prev?.addEventListener("click", () => incrementPage(-1));
next?.addEventListener("click", () => incrementPage(1));
getPage()
