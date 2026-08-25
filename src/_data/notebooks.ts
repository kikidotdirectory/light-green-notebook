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
type PageAnnotations = Record<string, string>;

const { dimensions, sections, numbered_start } = parse(
	await Deno.readTextFile("src/_data/_notebooks/lgn.yaml"),
) as Notebook;

function range([min, max]: [number, number]): number[] {
	return Array.from({ length: max - min + 1 }, (_, k) => k + min);
}

function normalizePages() {
	const pageAnnotations: Record<number, PageAnnotations> = {};

	for (const [key, value] of Object.entries(sections)) {
		const assign = (page: number, key: string, label: string) => {
			(pageAnnotations[page] ??= {})[key] = label;
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

	for (let i = 0; i < spreads.length; i++) {
		if (i < pagesStart) continue;
		const spreadOffset = i - pagesStart;
		const pageLeft = spreadOffset * 2 + 1;
		const pageRight = pageLeft + 1;

		const merged: PageAnnotations = {};
		for (const page of [pageLeft, pageRight]) {
			const annotations = pageAnnotations[page];
			if (!annotations) continue;
			for (const [key, label] of Object.entries(annotations)) {
				merged[key] = label;
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
