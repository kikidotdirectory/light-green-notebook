// fires `callback` once a scroll on `el` settles. uses the native "scrollend"
// event where supported (fires the instant scrolling actually stops); Safari
// didn't support it until 26.2, so there this falls back to a debounced "scroll".
export function onScrollSettle(el: Element, callback: () => void, fallbackDelay = 50) {
	if ("onscrollend" in window) {
		el.addEventListener("scrollend", callback, { passive: true });
		return;
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	el.addEventListener("scroll", () => {
		clearTimeout(timer);
		timer = setTimeout(callback, fallbackDelay);
	}, { passive: true });
}
