import { type FlipPageEvent, notebook } from "./page-navigation.ts";

export class TocList {
	el: HTMLOListElement;
	items = new Map<number, HTMLDetailsElement>();
	currentSpread: number | null = null;

	// todo:
	// - implement scrollTop
	// - implement viewing toc mode, .current toc item
	// - implement eventListener for mouse leaving toc

	constructor(el: HTMLOListElement) {
		this.el = el;

		for (const child of this.el.children) {
			if (!(child instanceof HTMLLIElement)) continue;
			const spread = child.dataset.spread;
			const details = child.querySelector("details") as HTMLDetailsElement;
			this.items.set(Number(spread), details);
		}

		this.el.addEventListener("click", (e) => {
			const summary = (e.target as HTMLElement).closest("summary");
			if (!summary) return;
			const li = summary.closest("li");
			if (!(li instanceof HTMLLIElement) || !li.dataset.spread) return;
			const spread = Number(li.dataset.spread);
			if (spread === this.currentSpread) return;
			this.changeCurrent(spread);
			notebook.jumpToSpread(spread, true);
		});

		window.addEventListener("notebook:flipPage", (e) => {
			const dest = (e as FlipPageEvent).detail;
			this.changeCurrent(dest);
		});
	}

	changeCurrent(dest: number) {
		this.currentSpread = dest;
		for (const [spread, details] of this.items) {
			const isCurrent = spread === this.currentSpread;
			details.classList.toggle("current", isCurrent);
			details.open = isCurrent;
		}
	}
}
