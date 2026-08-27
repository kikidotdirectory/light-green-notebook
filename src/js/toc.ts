import { notebook } from "./page-navigation.ts";

export class TocItem {
	li: HTMLLIElement;
	summary: HTMLElement;

	constructor(el: HTMLDetailsElement, li: HTMLLIElement, spread: number) {
		this.li = li;
		this.summary = el.querySelector("summary") as HTMLElement;
		this.summary.addEventListener("click", () => notebook.jumpToSpread(spread, true));
	}
}

export class TocList {
	el: HTMLOListElement;
	items = new Map();

	constructor(el: HTMLOListElement) {
		this.el = el;

		for (const child of this.el.children) {
			if (!(child instanceof HTMLLIElement)) continue;
			const spread = child.dataset.spread;
			const details = child.querySelector("details") as HTMLDetailsElement;
			const tocItem = new TocItem(details, child, Number(spread));
		}
	}
}
