class ProjectKey {
	name: string;
	index: number;

	constructor(name: string, index: number) {
		this.name = name;
		this.index = index;
	}
}

interface Annotation {
	"content": {
		"project": string;
		"desc": string;
		"date": string;
	};
	"shape": {
		"columns": ("l1" | "l2" | "l3" | "l4" | "r1" | "r2" | "r3" | "r4")[];
		"rows": (1 | 2 | 3 | 4)[];
	};
	index: number[];
}

class ProjectItem {
	name: string;
	annotations: ProjectAnnotation[];

	constructor(projectName: string) {
		this.name = projectName;
		this.annotations = [];
	}
}
class ProjectAnnotation {
	desc: string;
	date: string;

	constructor(desc: string, date: string) {
		this.desc = desc;
		this.date = date;
	}
}

const decoder = new TextDecoder("utf-8");
const annotations = JSON.parse(decoder.decode(Deno.readFileSync("src/annotations.json")));

export const annotationsBySpread = annotations;
export const annotationsList: (ProjectItem | Annotation["content"])[] = [];

const projectsList: ProjectKey[] = [];

for (const page in annotationsBySpread) {
	for (const annotation of annotationsBySpread[page]) {
		const annotationProject = annotation.content.project;
		const index = [];

		// if the annotation does not have a 'project', push it directly to annotationsList.
		if (!annotationProject) {
			annotationsList.push(annotation.content);
			index.push(annotationsList.length - 1);
		} else {
			// if the annotation does have a `project`, first check if the project is already in annotationsList
			// by checking if it's been added to the projectsList
			const isIndexed = (project: ProjectKey) => project.name === annotationProject;
			const keyIndex = projectsList.findIndex(isIndexed);
			let projectIndex;

			// if the project is not in the projectsList, add it to the annotationsList and store its key in the projectsList
			if (keyIndex === -1) {
				annotationsList.push(new ProjectItem(annotationProject));
				projectIndex = annotationsList.length - 1;
				projectsList.push(new ProjectKey(annotationProject, projectIndex));
			} else {
				projectIndex = projectsList[keyIndex].index;
			}

			(annotationsList[projectIndex] as ProjectItem).annotations.push(
				new ProjectAnnotation(annotation.content.desc, annotation.content.date),
			);

			// store the index of Project and the annotation's index within it.
			index.push(projectIndex);
			index.push((annotationsList[projectIndex] as ProjectItem).annotations.length - 1);
		}

		// store the index within the annotation for use in annotationsByPage
		annotation.index = index;
	}
}

