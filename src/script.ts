import { initNotebook } from "./js/notebook.ts";
import { pageStore as storePageState } from "./js/page-state.ts";
import { initToc } from "./js/toc.ts";

const pageState = storePageState();
initNotebook(pageState);
initToc(pageState);
