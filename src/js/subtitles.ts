import { PageStore } from "./page-state.ts";

export function initSubtitles(pageStore: PageStore, el: HTMLElement) {
	const subtitleContainer = el;
	const delay = 4000; // 4s

	const subtitles: Record<number, string[]> = {
		0: [
			"this website uses subtitles",
			"you can click here to read them again if you miss them",
			"the idea of website subtitles comes entirely from joseph pleass",
			"thank you, joseph",
		],
	};

	let index = 0;
	let subtitleSetter: ReturnType<typeof setInterval> | undefined;

	function showSubtitle(page: number) {
		const subtitleContent = subtitles[page]?.[index];
		if (!subtitleContent) {
			if (subtitleSetter) clearInterval(subtitleSetter);
			subtitleContainer.innerText = "";
			return;
		}
		subtitleContainer.innerText = subtitleContent;
		index++;
	}

	pageStore.subscribe((page) => {
		if (subtitleSetter) clearInterval(subtitleSetter);
		index = 0;
		showSubtitle(page);
		subtitleSetter = setInterval(() => showSubtitle(page), delay);
	});
}
