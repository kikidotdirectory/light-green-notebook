export type Mode = "single" | "double";
export type ModeStore = ReturnType<typeof checkMode>;

export function checkMode() {
	const rootStyle = getComputedStyle(document.documentElement);
	const layoutCol = rootStyle.getPropertyValue("--layout-col").trim();
	const layoutRow = rootStyle.getPropertyValue("--layout-row").trim();

	const shiftQuery = matchMedia(
		`(max-width: ${layoutCol}), (max-height: ${layoutRow})`,
	);

	const listeners = new Set<(mode: Mode) => void>();

	function applyMode(isShifted: boolean) {
		const mode: Mode = isShifted ? "single" : "double";
		document.documentElement.dataset.mode = mode;
		listeners.forEach((listener) => listener(mode));
	}

	applyMode(shiftQuery.matches);
	shiftQuery.addEventListener("change", (e) => applyMode(e.matches));

	return {
		get: (): Mode => document.documentElement.dataset.mode as Mode,
		subscribe: (listener: (mode: Mode) => void) => {
			listeners.add(listener);
			listener(document.documentElement.dataset.mode as Mode);
		},
	};
}
