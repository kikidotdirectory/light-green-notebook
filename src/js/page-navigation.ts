declare const totalSpreads: number;

type Side = "left" | "right";

let currentPageNum: number;
let currentSide: Side = "left";
let pageMode = false;

const fileName = (page: number) => String(page + 1).padStart(4, "0");
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

function goToSpread(pageNum: number, side: Side) {
	currentPageNum = pageNum;
	currentSide = side;
	notebookViewer.dataset.spread = currentPageNum.toString();
	applySideAttr();
	replaceSpreadImage(currentPageNum);
	setState(currentPageNum);
}

// In spread mode, flipPage moves by a whole spread. In page mode, it moves by
// a single page: first revealing the other half of the current spread image,
// then advancing to the neighboring spread once both of its halves are shown.
function flipPage(delta: number) {
	if (!pageMode) {
		const dest = currentPageNum + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		goToSpread(dest, currentSide);
		preloadPage(dest + delta);
		return;
	}

	if (delta > 0) {
		if (currentSide === "left" && currentPageNum !== 0) {
			currentSide = "right";
			applySideAttr();
			preloadPage(currentPageNum + 1);
			return;
		}
		const dest = currentPageNum + 1;
		if (dest >= totalSpreads) return;
		goToSpread(dest, "left");
		preloadPage(dest + 1);
	} else {
		if (currentSide === "right") {
			currentSide = "left";
			applySideAttr();
			preloadPage(currentPageNum - 1);
			return;
		}
		const dest = currentPageNum - 1;
		if (dest < 0) return;
		goToSpread(dest, "right");
		preloadPage(dest - 1);
	}
}

function preloadPage(pageNum: number) {
	if (pageNum < 0) return;
	if (pageNum >= totalSpreads) return;
	const img = new Image();
	img.src = pageSrc(pageNum);
}

function applySideAttr() {
	if (pageMode) {
		notebookViewer.dataset.side = currentSide;
	} else {
		delete notebookViewer.dataset.side;
	}
}

// The natural width of a full two-page spread, resolved to real pixels via
// the --spread-width custom property (which itself derives from the
// notebook's physical dimensions), so the breakpoint tracks the notebook's
// own size instead of a hardcoded value. Measured fresh each call (not
// cached) so it stays correct across root font-size / zoom changes.
function measureSpreadWidthPx(): number {
	const probe = document.createElement("div");
	probe.style.cssText = "position:absolute; visibility:hidden; pointer-events:none; width:var(--spread-width);";
	notebookViewer.appendChild(probe);
	const width = probe.getBoundingClientRect().width;
	probe.remove();
	return width;
}

function applyMode(matches: boolean) {
	pageMode = matches;
	notebookViewer.dataset.mode = pageMode ? "page" : "spread";
	applySideAttr();
	prev.setAttribute("aria-label", pageMode ? "Previous page" : "Previous spread");
	next.setAttribute("aria-label", pageMode ? "Next page" : "Next spread");
}

function updateMode() {
	// Measured against <main>, not the notebook viewer itself: the viewer's
	// own width already reflects the current mode's layout, so comparing
	// against it would make page mode "sticky" once entered.
	const viewerStyle = getComputedStyle(notebookViewer);
	const available = mainEl.clientWidth - parseFloat(viewerStyle.paddingLeft) - parseFloat(viewerStyle.paddingRight);
	const matches = measureSpreadWidthPx() > available;
	if (matches === pageMode) return;
	if (matches) currentSide = "left";
	applyMode(matches);
}

// On page load, render notebook.
const fileExt = "png";
const notebookID = "lgn";

const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
const mainEl = document.querySelector("main") as HTMLElement;
const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
const next = document.querySelector(".page-link.next") as HTMLButtonElement;
let spreadImage = document.querySelector(".spread-image") as HTMLImageElement;

prev?.addEventListener("click", () => flipPage(-1));
next?.addEventListener("click", () => flipPage(1));

currentPageNum = getState();
if (currentPageNum) {
	notebookViewer.dataset.spread = currentPageNum.toString();
	replaceSpreadImage(currentPageNum);
}

updateMode();
window.addEventListener("resize", updateMode);

preloadPage(currentPageNum - 1);
preloadPage(currentPageNum + 1);
