import lume from "lume/mod.ts";

import { buildCss } from "./src/scripts/buildCss.ts";

const site = lume({
	src: "./src",
	dest: "./dist",
	watcher: {
		dependencies: {
			"_data/buildAnnotations.ts": ["annotations.json"],
		},
	},
});

site.addEventListener("beforeBuild", async () => {
	await buildCss("src/css/global.css", "src/style.css");
});

site.addEventListener("beforeUpdate", async (event) => {
	if ([...event.files].some((f) => f.startsWith("/css/"))) {
		await buildCss("src/css/global.css", "src/style.css");
	}
});

site.filter("padStart", (num) => {
	const size = 4;
	return String(num).padStart(size, "0");
});

site.filter("inlinecss", (css) => {
	return `<style>\n${css}\n</style>\n`
})

site.add([".png"]);
site.add("style.css");
site.add("script.js");

export default site;
