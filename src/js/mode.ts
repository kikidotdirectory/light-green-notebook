export type Mode = "single" | "double";
export type ModeStore = ReturnType<typeof checkMode>;

export function checkMode() {
	const root = document.documentElement;
	// pages that only care about a single fixed mode (e.g. the snap-point
	// debug page) set data-force-mode to skip the responsive matchMedia
	// check entirely, rather than fighting a resize listener that would
	// otherwise flip them back to "double".
	const forced = root.dataset.forceMode as Mode | undefined;

	const listeners = new Set<(mode: Mode) => void>();

	function applyMode(isShifted: boolean) {
		const mode: Mode = forced ?? (isShifted ? "single" : "double");
		root.dataset.mode = mode;
		listeners.forEach((listener) => listener(mode));
	}

	if (forced) {
		applyMode(false);
	} else {
		const rootStyle = getComputedStyle(root);
		const layoutCol = rootStyle.getPropertyValue("--layout-col").trim();
		const layoutRow = rootStyle.getPropertyValue("--layout-row").trim();

		const shiftQuery = matchMedia(
			`(max-width: ${layoutCol}), (max-height: ${layoutRow})`,
		);

		applyMode(shiftQuery.matches);
		shiftQuery.addEventListener("change", (e) => applyMode(e.matches));
	}

	return {
		get: (): Mode => root.dataset.mode as Mode,
		subscribe: (listener: (mode: Mode) => void) => {
			listeners.add(listener);
			listener(root.dataset.mode as Mode);
		},
	};
}
