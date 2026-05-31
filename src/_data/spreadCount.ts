import { glob } from "node:fs/promises";
const IMAGES_DIR = `src/assets/lgn/`;
const spreads = await Array.fromAsync(glob(`${IMAGES_DIR}/*.png`));
export default spreads.length;
