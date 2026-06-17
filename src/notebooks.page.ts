interface Notebook extends Lume.Data {
	uid: string;
}

export const layout = "layouts/spread.vto";

export default function*({ notebooks }: Lume.Data) {
	const entries = Object.values(notebooks) as Notebook[];
	for (const notebook of entries) {
		yield {
			url: `/${notebook.uid}/`,
			notebookData: notebook,
		};
	}
}
