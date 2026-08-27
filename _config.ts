import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import nav from "lume/plugins/nav.ts";

import { buildCss } from "./src/_scripts/buildCss.ts";

const site = lume({
	src: "./src",
	dest: "./dist",
	watcher: {
		dependencies: {
			"_data/buildAnnotations.ts": ["annotations.json"],
		},
	},
});

site
	.use(esbuild())
	.use(nav());

site.addEventListener("beforeBuild", async () => {
	await buildCss("src/css/global.css", "src/style.css");
});

site.addEventListener("beforeUpdate", async (event) => {
	if ([...event.files].some((f) => f.startsWith("/css/"))) {
		await buildCss("src/css/global.css", "src/style.css");
	}
});

site.filter("inlinecss", (css) => {
	return `<style>\n${css}</style>`;
});

site.filter("padNum", (number, count) => {
	return String(number).padStart(count, "0");
});

site.add([".png"]);
site.add("style.css");
site.add("script.ts");

export default site;
