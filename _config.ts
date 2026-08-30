import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import nav from "lume/plugins/nav.ts";
import postcss from "lume/plugins/postcss.ts";

import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssImportExtGlob from "postcss-import-ext-glob";
import postcssMap from "postcss-map";

import designTokens from "./src/_config/design-tokens.ts";

const site = lume({
	src: "./src",
	dest: "./dist",
});

site.ignore("design-tokens");

const isDev = Deno.env.get("LUME_LIVE_RELOAD") === "true";

site
	.use(esbuild({ options: { minify: !isDev } }))
	.use(nav())
	.use(postcss({
		includes: false,
		useDefaultPlugins: false,
		plugins: [
			postcssImportExtGlob,
			postcssImport,
			postcssMap({
				maps: [{ designTokens }],
			}),
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
