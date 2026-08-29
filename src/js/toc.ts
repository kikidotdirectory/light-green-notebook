import type { CurrPage } from "./page-store.ts";

export class TocList {
	el: HTMLOListElement;
	items = new Map<number, HTMLDetailsElement>();
	currentSpread: number | null = null;

	// todo:
	// - implement scrollTop
	// - implement viewing toc mode, .current toc item
	// - implement eventListener for mouse leaving toc

	constructor(el: HTMLOListElement, currPage: CurrPage) {
		this.el = el;

		for (const child of this.el.children) {
			if (!(child instanceof HTMLLIElement) || !child.dataset.spread) continue;
			const spread = Number(child.dataset.spread);
			const details = child.querySelector("details") as HTMLDetailsElement;
			const summary = details.querySelector("summary");
			this.items.set(spread, details);
			summary?.addEventListener("click", this.createSummaryClickListener(spread, details, currPage));
		}

		currPage.subscribe((dest) => this.changeCurrent(dest));
	}

	private createSummaryClickListener(spread: number, details: HTMLDetailsElement, currPage: CurrPage) {
		return (e: Event) => {
			e.preventDefault();
			if (spread === this.currentSpread) {
				details.open = false;
				return;
			}
			this.changeCurrent(spread);
			currPage.set(spread);
		};
	}

	private changeCurrent(dest: number) {
		this.currentSpread = dest;
		for (const [spread, details] of this.items) {
			const isCurrent = spread === this.currentSpread;
			details.classList.toggle("current", isCurrent);
			details.open = isCurrent;
		}
	}
}
