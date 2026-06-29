function getPage() {
	let notebookPage;
	try {
		notebookPage = localStorage.getItem(notebookID);
	} catch (_error) {
		return;
	}

	if (notebookPage) {
		document.querySelector(".spread-image").src = notebookPage;
	}
}

document.addEventListener("DOMContentLoaded", getPage);
