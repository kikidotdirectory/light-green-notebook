import { parse } from "@std/yaml";
import { calcFontMetrics } from "../_data/fontMetrics.ts";

const leading = parse(
	await Deno.readTextFile("src/design-tokens/leading.yml"),
) as { "line-height": number };
const { "line-height": lineHeight } = leading;
const fontMetrics = calcFontMetrics(lineHeight);

export default {...leading, ...fontMetrics}
