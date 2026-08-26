declare const totalSpreads: number;

let currentPageNum: number;

const fileName = (page: number) => String(page).padStart(3, "0");
const pageSrc = (pageNum: number) => "/assets/spreads/" + fileName(pageNum) + "." + fileExt;
const hashFor = (page: number) => "#" + fileName(page);

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

// Keeps the URL in sync with the current spread without pushing history
// entries or firing "hashchange" (which is reserved for navigation the user
// initiates directly, e.g. editing the URL or following a link).
function updateHash(pageNum: number) {
	const target = hashFor(pageNum);
	if (location.hash !== target) {
		history.replaceState(null, "", target);
	}
}

function replaceSpreadImage(pageNum: number) {
	const newImage = document.createElement("img");
	newImage.className = spreadImage.className;
	newImage.alt = spreadImage.alt;
	newImage.src = pageSrc(pageNum);
	spreadImage.replaceWith(newImage);
	spreadImage = newImage;
}

function revealAnnotations(pageNum: number) {
	const target = pageNum.toString();
	for (const group of annotationGroups) {
		group.hidden = group.dataset.spread !== target;
	}
}

function goToSpread(pageNum: number) {
	currentPageNum = pageNum;
	notebookViewer.dataset.spread = currentPageNum.toString();
	replaceSpreadImage(currentPageNum);
	revealAnnotations(currentPageNum);
	setState(currentPageNum);
	updateHash(currentPageNum);
}

function flipPage(delta: number) {
	const dest = currentPageNum + delta;
	if (dest < 0 || dest >= totalSpreads) return;
	goToSpread(dest);
	preloadPage(dest + delta);
	return;
}

function preloadPage(pageNum: number) {
	if (pageNum < 0) return;
	if (pageNum > totalSpreads) return;
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
const annotationGroups = document.querySelectorAll<HTMLElement>(".annotation-group");

prev?.addEventListener("click", () => flipPage(-1));
next?.addEventListener("click", () => flipPage(1));

currentPageNum = parseHash() ?? getState();
if (currentPageNum) {
	notebookViewer.dataset.spread = currentPageNum.toString();
	replaceSpreadImage(currentPageNum);
}
revealAnnotations(currentPageNum);
setState(currentPageNum);
updateHash(currentPageNum);

window.addEventListener("hashchange", () => {
	const pageNum = parseHash();
	if (pageNum !== null) goToSpread(pageNum);
});

preloadPage(currentPageNum - 1);
preloadPage(currentPageNum + 1);
