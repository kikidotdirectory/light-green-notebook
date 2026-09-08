import { initNotebook } from "./js/notebook-controller.ts";
import { pageStore as storePageState } from "./js/page-state.ts";
import { initSubitles } from "./js/subtitles.ts";
import { initToc } from "./js/toc.ts";

const pageState = storePageState();
const toc = initToc(pageState);
initNotebook(pageState, toc);
initSubitles(pageState);
