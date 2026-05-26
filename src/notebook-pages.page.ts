import { glob } from "node:fs/promises";

const IMAGES_DIR = `src/assets/light-green-notebook/`;

// Await all file paths
const spreads = await Array.fromAsync(glob(`${IMAGES_DIR}/*.png`));

export default function*() {
	for (let spread = 1; spread <= spreads.length; spread++) {
		yield {
			url: `/page-${spread}/`,
			layout: "layouts/spreadContent.vto",
			spread: spread,
		};
	}
}
