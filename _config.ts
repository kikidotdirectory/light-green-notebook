import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import nav from "lume/plugins/nav.ts";
import postcss from "lume/plugins/postcss.ts";

import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssImportExtGlob from "postcss-import-ext-glob";
import postcssMap from "postcss-map";

import fontMetrics from "./src/_data/fontMetrics.ts";

const site = lume({
	src: "./src",
	dest: "./dist",
});

site.ignore("css/maps");

site
	.use(esbuild())
	.use(nav())
	.use(postcss({
		includes: false,
		useDefaultPlugins: false,
		plugins: [
			postcssImportExtGlob,
			postcssImport,
			postcssMap({ basePath: "src/css/maps", maps: ["design-tokens.yml", { fontMetrics }] }),
			autoprefixer,
		],
	}));

site.addEventListener("beforeUpdate", (event) => {
	if ([...event.files].some((f) => f.startsWith("/css/"))) {
		event.files.add("/css/global.css");
	}
});

site.filter("inlinecss", (css) => {
	return `<style>\n${css}</style>`;
});

site.filter("padNum", (number, count) => {
	return String(number).padStart(count, "0");
});

site.add([".png"]);
site.add("css/global.css", "/style.css");
site.add("script.ts");

export default site;
