import type { PageStore } from "./page-state.ts";

// todo:
// - implement scrollTop
// - implement viewing toc mode, .current toc item
// - implement eventListener for mouse leaving toc

export function initToc(pageStore: PageStore) {
	const tocList = document.querySelector(".toc ol") as HTMLOListElement;
	const items = new Map<number, HTMLDetailsElement>();
	let currentSpread: number | null = null;

	function changeCurrent(dest: number) {
		if (dest === currentSpread) return;
		currentSpread = dest;
		for (const [spread, details] of items) {
			const isCurrent = spread === currentSpread;
			details.classList.toggle("current", isCurrent);
			details.open = isCurrent;
		}
	}

	function createSummaryClickListener(
		spread: number,
		details: HTMLDetailsElement,
	) {
		return (e: Event) => {
			e.preventDefault();
			if (spread === currentSpread) {
				details.open = false;
				return;
			}
			changeCurrent(spread);
			pageStore.set(spread);
		};
	}

	for (const child of tocList.children) {
		if (!(child instanceof HTMLLIElement) || !child.dataset.spread) continue;
		const spread = Number(child.dataset.spread);
		const details = child.querySelector("details") as HTMLDetailsElement;
		const summary = details.querySelector("summary");
		items.set(spread, details);
		summary?.addEventListener(
			"click",
			createSummaryClickListener(spread, details),
		);
	}

	pageStore.subscribe(changeCurrent);
}
