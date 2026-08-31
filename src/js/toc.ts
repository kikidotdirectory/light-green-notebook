import type { PageStore } from "./page-state.ts";

export function initToc(pageStore: PageStore) {
	const tocBody = document.querySelector(".toc") as HTMLElement;
	const tocList = document.querySelector(".toc ol") as HTMLOListElement;
	const items = new Map<number, HTMLDetailsElement>();
	let currentSpread = pageStore.get();
	// true while toc itself just called pageStore.set
	// let ToC distinguish when pageStore.set was called from notebook or self
	let selfInitiated = false;
	// capture the height of a closed details element
	const closedItem = tocList.querySelector("li:has(details):not(:has(details[open]))") as HTMLElement | null;

	// marks `dest` current, then scrolls it fully into view if needed.
	// alignToTop flag is used to init current item at top of el
	function updateCurrent(dest: number, alignToTop = false) {
		currentSpread = dest;

		for (const [spread, details] of items) {
			const isCurrent = spread === currentSpread;
			details.classList.toggle("current", isCurrent);
			details.open = isCurrent;
		}

		// ensure that the whole item is visible
		const padding = 20; // hardcoded value to compensate for mask-image on tocList
	 	const destItem = items.get(dest)?.parentElement as HTMLElement | undefined;
		const destRect = destItem?.getBoundingClientRect();
		const tocBodyRect = tocBody.getBoundingClientRect();
		const itemTopOffset = destRect!.top - tocBodyRect.top;
		const itemBottomOffset = itemTopOffset + destItem!.offsetHeight;
		const overflowPastTop = itemTopOffset;
		const overflowPastBottom = itemBottomOffset - tocBodyRect.height;

		if (overflowPastTop < 0) {
			tocBody.scrollTop += overflowPastTop - padding;
		} else if (overflowPastBottom > 0) {
			tocBody.scrollTop += alignToTop ? overflowPastTop - padding : overflowPastBottom + padding;
		}
	}

	function selectSpread(dest: number) {
		if (dest === currentSpread) return;

		const curr = currentSpread;
		const currItem = items.get(curr)?.parentElement as HTMLElement | undefined;

		// if the dest is after the current item, scroll up so the cursor remains
		// on the <summary> the visitor clicks on.
		if (curr < dest) {
			const scrollDelta = currItem!.offsetHeight - closedItem!.offsetHeight;
			tocBody.scrollTop -= scrollDelta;
		}

		updateCurrent(dest);
	}

	function createSummaryClickListener(
		spread: number,
	) {
		return (e: Event) => {
			e.preventDefault();
			if (spread === currentSpread) {
				return;
			}
			selectSpread(spread);
			selfInitiated = true;
			pageStore.set(spread);
		};
	}

	function syncCurrent(spread: number) {
		if (selfInitiated) {
			selfInitiated = false;
			return;
		}
		if (spread === currentSpread) return;

		const curr = currentSpread;

		// flipping the page increments the scroll equal to closedRect.height
		if (curr < spread) {
			tocBody.scrollTop += closedItem!.offsetHeight;
		} else {
			tocBody.scrollTop -= closedItem!.offsetHeight;
		}

		updateCurrent(spread);
	}

	for (const child of tocList.children) {
		if (!(child instanceof HTMLLIElement) || !child.dataset.spread) continue;
		const spread = Number(child.dataset.spread);
		const details = child.querySelector("details") as HTMLDetailsElement;
		const summary = details.querySelector("summary");
		items.set(spread, details);
		summary?.addEventListener(
			"click",
			createSummaryClickListener(spread),
		);
	}

	// scroll toc to the current el set in tocList
	updateCurrent(currentSpread, true);

	pageStore.subscribe(syncCurrent);
}
