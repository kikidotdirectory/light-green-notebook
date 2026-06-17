const numPages = 110;
const pad = (n) => String(n).padStart(3, "0");
const src = (n) => `/assets/{{ notebookData.uid }}/${pad(n)}.png`;
