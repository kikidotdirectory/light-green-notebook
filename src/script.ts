import "./js/page-navigation.ts";
import { Accordion } from "./js/nav.ts";

const navDetails = document.querySelectorAll("nav details") as NodeListOf<HTMLDetailsElement>;
navDetails.forEach((d) => new Accordion(d));
