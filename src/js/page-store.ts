export type CurrPage = ReturnType<typeof currPage>;

export function currPage(initial: number) {
	let page = initial;
	const listeners = new Set<(value: number) => void>();

	return {
		get: () => page,
		set: (newPage: number) => {
			page = newPage;
			listeners.forEach((listener) => listener(page));
		},
		subscribe: (listener: (value: number) => void) => {
			listeners.add(listener);
		},
	};
}
