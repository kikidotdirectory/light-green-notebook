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
	annotations: Annotation[];

	constructor(projectName: string) {
		this.name = projectName;
		this.annotations = [];
	}
}

const decoder = new TextDecoder("utf-8");
const annotations = JSON.parse(decoder.decode(Deno.readFileSync("src/annotations.json")));

const annotationsByPage = annotations;
let annotationsList = [];

let projectsList: ProjectKey[] = [];

for (const page in annotationsByPage) {
	for (const annotation of annotationsByPage[page]) {
		const annotationProject = annotation.content.project;
		console.log(annotationProject)
		let index;

		// if the annotation does not have a 'project', push it directly to annotationsList.
		if (!annotationProject) {
			annotationsList.push(annotation.content);
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
				projectIndex = projectsList[keyIndex].index
			}

			// annotationsList[projectIndex].annotations.push(annotation.content)
		}
	}
}

console.log(annotationsList);

// annotationsByPage.json
// annotationsList.json
