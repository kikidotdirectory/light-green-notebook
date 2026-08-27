declare const totalSpreads: number;

function createNotebook() {
	const fileExt = "png";
	const notebookID = "lgn";
	let currentPageNum = 0;

	const notebookViewer = document.querySelector(".notebook-viewer") as HTMLElement;
	const prev = document.querySelector(".page-link.prev") as HTMLButtonElement;
	const next = document.querySelector(".page-link.next") as HTMLButtonElement;
	const spreadImage = document.querySelector(".spread-image") as HTMLImageElement;

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

	function updateHash(pageNum: number, push?: boolean) {
		const target = hashFor(pageNum);
		if (location.hash === target) return;

		if (push) {
			history.pushState(null, "", target);
		} else {
			history.replaceState(null, "", target);
		}
	}

	function replaceSpreadImage(pageNum: number) {
		if (pageNum === 0) return;
		spreadImage.src = pageSrc(pageNum);
	}

	function goToSpread(pageNum: number, push?: boolean) {
		currentPageNum = pageNum;
		notebookViewer.dataset.spread = currentPageNum.toString();
		replaceSpreadImage(currentPageNum);
		setState(currentPageNum);
		updateHash(currentPageNum, push);
	}

	function flipPage(delta: number) {
		const dest = currentPageNum + delta;
		if (dest < 0 || dest >= totalSpreads) return;
		goToSpread(dest);
		preloadPage(dest + delta);
	}

	function jumpToSpread(pageNum: number, push?: boolean) {
		if (pageNum < 0 || pageNum >= totalSpreads) return;
		goToSpread(pageNum, push)
		preloadPage(currentPageNum + 1)
		preloadPage(currentPageNum - 1)
	}

	function preloadPage(pageNum: number) {
		if (pageNum < 0) return;
		if (pageNum > totalSpreads) return;
		const img = new Image();
		img.src = pageSrc(pageNum);
	}

	// On page load, render notebook.
	function init() {
		prev?.addEventListener("click", () => flipPage(-1));
		next?.addEventListener("click", () => flipPage(1));

		currentPageNum = parseHash() ?? getState();
		if (currentPageNum) {
			notebookViewer.dataset.spread = currentPageNum.toString();
			replaceSpreadImage(currentPageNum);
		}
		setState(currentPageNum);
		updateHash(currentPageNum);

		window.addEventListener("hashchange", () => {
			const pageNum = parseHash();
			if (pageNum !== null) goToSpread(pageNum);
		});

		preloadPage(currentPageNum - 1);
		preloadPage(currentPageNum + 1);
	}

	init();

	return { flipPage, jumpToSpread };
}

export const notebook = createNotebook();
