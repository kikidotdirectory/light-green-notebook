import lume from "lume/mod.ts";

import { buildCss } from "./src/scripts/buildCss.ts";

const site = lume({
	src: "./src",
	dest: "./dist",
});

site.addEventListener("beforeBuild", async () => {
	await buildCss("src/css/global.css", "src/style.css");
});

site.addEventListener("beforeUpdate", async (event) => {
	if ([...event.files].some((f) => f.startsWith("/css/"))) {
		await buildCss("src/css/global.css", "src/style.css");
	}
});

site.add([".png"])
site.add("style.css")

export default site;
