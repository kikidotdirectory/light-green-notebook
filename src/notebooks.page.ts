interface Notebook extends Lume.Data {
	uid: string;
}

import { glob } from "node:fs/promises";
export const layout = "layouts/spread.vto";

export default async function*({ notebooks }: Lume.Data) {
	const entries = Object.values(notebooks) as Notebook[];
	for (const notebook of entries) {
		const IMAGES_DIR = `src/assets/${notebook.uid}/`;
		const spreads = await Array.fromAsync(glob(`${IMAGES_DIR}/*.png`));

		// Skip the notebook if it doesn't have files in src/assets/
		if (!spreads.length) {
			console.warn(
				`\x1b[33mWARN\x1b[0m [notebooks.page.ts] \x1b[36mSkipped id\x1b[0m ${notebook.uid} (No .png files found in "${IMAGES_DIR}")`,
			);
			continue;
		}
		yield {
			url: `/${notebook.uid}/`,
			notebookData: notebook,
		};
	}
}
