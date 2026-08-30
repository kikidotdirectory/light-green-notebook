declare const totalSpreads: number;
export type PageStore = ReturnType<typeof pageStore>;

const pad = (pageNum: number) => String(pageNum).padStart(3, "0");
const hashFor = (pageNum: number) => "#" + pad(pageNum);

function parseHash(): number | null {
	const raw = location.hash.slice(1);
	if (!/^\d+$/.test(raw)) return null;
	const pageNum = Number(raw);
	if (pageNum < 0 || pageNum >= totalSpreads) return null;
	return pageNum;
}

function updateHash(pageNum: number) {
	const target = hashFor(pageNum);
	if (location.hash === target) return;
	history.replaceState(null, "", target);
}

function watchHash(onChange: (pageNum: number) => void) {
	window.addEventListener("hashchange", () => {
		const pageNum = parseHash();
		if (pageNum !== null) onChange(pageNum);
	});
}

export function pageStore() {
	let page = parseHash() ?? 0;
	const listeners = new Set<(value: number) => void>();

	function set(newPage: number) {
		page = newPage;
		updateHash(newPage);
		listeners.forEach((listener) => listener(page));
	}

	watchHash(set);

	return {
		get: () => page,
		set,
		subscribe: (listener: (value: number) => void) => {
			listeners.add(listener);
			listener(page);
		},
	};
}
