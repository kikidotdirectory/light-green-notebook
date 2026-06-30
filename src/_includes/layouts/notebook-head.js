function getState() {
	try {
		const raw = localStorage.getItem(notebookID);
		return raw ? JSON.parse(raw) : { pageNum: 0 };
	} catch {
		return { pageNum: 0 };
	}
}

function setState(partial) {
	const updated = { ...getState(), ...partial };
	localStorage.setItem(notebookID, JSON.stringify(updated));
}

function getPage() {
	currentPageNum = getState().pageNum;
	spreadImage.src = imgSrc(currentPageNum);
	spreadImage.dataset.spread = currentPageNum;
}

function imgSrc(pageNum) {
	return assetsDir + fileName(pageNum) + "." + fileExt;
}

let spreadImage;
document.addEventListener("DOMContentLoaded", () => {
	spreadImage = document.querySelector(".spread-image");
	getPage();
});
