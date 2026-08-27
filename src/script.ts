import "./js/page-navigation.ts";
import { TocList } from "./js/toc.ts";

const tocList = document.querySelector(".toc ol") as HTMLOListElement;
new TocList(tocList);
