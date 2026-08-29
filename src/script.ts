import { currPage as createCurrPage } from "./js/page-store.ts";
import { createNotebook } from "./js/page-navigation.ts";
import { TocList } from "./js/toc.ts";

const currPage = createCurrPage(0);
const notebook = createNotebook(currPage);

new TocList(document.querySelector(".toc ol") as HTMLOListElement, currPage);

notebook.init();
