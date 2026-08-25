import { parse } from "@std/yaml";
import { glob } from "node:fs/promises";

const IMAGES_DIR = `src/assets/spreads/`;
const spreads = await Array.fromAsync(glob(`${IMAGES_DIR}/*.png`));

interface Section {
	title?: string;
	desc?: string;
	pages: (number | [number, number])[];
}

interface Notebook {
	uid: string; // not currently used
	title: string; // not currently used
	dimensions: {
		width: number;
		height: number;
	};
	fileExt: string; // not currently used
	sections: Record<string, Section>;
	numbered_start: {
		spread: number;
		side: "left" | "right";
	};
}
interface Annotation {
	title: string;
	label: string;
}
type PageAnnotations = Record<string, Annotation>;

const { dimensions, sections, numbered_start } = parse(
	await Deno.readTextFile("src/_data/_notebooks/lgn.yaml"),
) as Notebook;

function range([min, max]: [number, number]): number[] {
	return Array.from({ length: max - min + 1 }, (_, k) => k + min);
}

function normalizePages() {
	const pageAnnotations: Record<number, PageAnnotations> = {};

	for (const [key, value] of Object.entries(sections)) {
		const title = value.title ?? key;
		const assign = (page: number, key: string, label: string) => {
			(pageAnnotations[page] ??= {})[key] = { title, label };
		};
		// Iterate over the 'pages' property of each section of the notebook
		// If the page is an array (representing an array), expand it and
		// assign the values to all of the pages.
		for (const page of value.pages) {
			if (Array.isArray(page)) {
				const label = `${page[0]}–${page[1]}`;
				for (const p of range(page)) assign(p, key, label);
			} else {
				assign(page, key, String(page));
			}
		}
	}
	return pageAnnotations;
}

function buildSpreadAnnotations(pageAnnotations: Record<number, PageAnnotations>) {
	const spreadAnnotations: Record<number, PageAnnotations> = {};
	const pagesStart = numbered_start.spread;
	// Page numbering may begin on either side of the starting spread (e.g. the
	// left page of that spread is unnumbered front matter when side is "right").
	let nextPage = 1;

	for (let i = 0; i < spreads.length; i++) {
		if (i < pagesStart) continue;
		const pageLeft = i === pagesStart && numbered_start.side === "right" ? null : nextPage++;
		const pageRight = nextPage++;

		const merged: PageAnnotations = {};
		for (const page of [pageLeft, pageRight]) {
			if (page === null) continue;
			const annotations = pageAnnotations[page];
			if (!annotations) continue;
			for (const [key, annotation] of Object.entries(annotations)) {
				merged[key] = annotation;
			}
		}

		if (Object.keys(merged).length > 0) spreadAnnotations[i] = merged;
	}
	return spreadAnnotations;
}

export default {
	lgn: {
		dimensions,
		annotations: buildSpreadAnnotations(normalizePages()),
		spreads,
		get totalSpreads() {
			return spreads.length;
		},
	},
};
