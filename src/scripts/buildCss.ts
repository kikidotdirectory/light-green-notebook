import * as path from "@std/path";
import autoprefixer from "npm:autoprefixer";
import postcss from "npm:postcss";
import postcssImport from "npm:postcss-import";
import postcssImportExtGlob from "npm:postcss-import-ext-glob";

export async function buildCss(inputPath: string, outputPath: string) {
	const decoder = new TextDecoder("utf-8");
	const encoder = new TextEncoder();
	const inputContent = await Deno.readFile(inputPath);

	const result = await postcss([
		postcssImportExtGlob,
		postcssImport,
		autoprefixer,
	]).process(decoder.decode(inputContent), { from: inputPath });

	Deno.mkdir(path.dirname(outputPath), { recursive: true });
	Deno.writeFile(outputPath, encoder.encode(result.css));
}
