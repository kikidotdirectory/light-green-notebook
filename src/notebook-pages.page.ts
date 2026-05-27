import { glob } from "node:fs/promises";

const IMAGES_DIR = `src/assets/light-green-notebook/`;

// Count the spread images. Rather than generating one page per spread, we emit a
// single viewer page and swap the image + annotations client-side (see spreadBase.vto).
const spreads = await Array.fromAsync(glob(`${IMAGES_DIR}/*.png`));

export default function*() {
	yield {
		url: `/`,
		layout: "layouts/spreadContent.vto",
		spreadCount: spreads.length,
	};
}
