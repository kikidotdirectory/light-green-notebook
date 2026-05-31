import { parse as parseYAML } from "jsr:@std/yaml";

interface Section {
	title?: string;
	desc?: string;
	pages: (number | [number, number])[];
}

interface SectionTitle {
	key: string;
	title: string;
	desc?: string;
}

const decoder = new TextDecoder("utf-8");
export const sections = parseYAML(
	decoder.decode(Deno.readFileSync("src/light-green-notebook.yaml")),
) as Record<string, Section>;

// Title to display, indexed by spread + page side. A title appears on the first
// page of every contiguous run listed in `pages`; sections without a `title`
// are skipped. Spread N is assumed to span pages (2N-1, 2N): odd page -> left,
// even -> right. Adjust the page->spread math here if the physical book follows
// a different convention.
export const sectionTitleBySpread: Record<
	number,
	{ left?: SectionTitle; right?: SectionTitle }
> = {};
for (const [key, section] of Object.entries(sections)) {
	if (!section.title) continue;
	const title: SectionTitle = { key, title: section.title, desc: section.desc };
	for (const entry of section.pages) {
		const startPage = Array.isArray(entry) ? entry[0] : entry;
		const spread = Math.floor(startPage / 2) + 1; // 1→1, 2→2, 3→2, 4→3...
		const side = startPage % 2 === 0 ? "left" : "right";
		(sectionTitleBySpread[spread] ??= {})[side] = title;
	}
}
