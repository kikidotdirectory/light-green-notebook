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
		let index;

		// if the annotation does not have a 'project', push it directly to annotationsList.
		if (!annotationProject) {
			annotationsList.push(annotation.content);
		} else {
			// if the annotation does have a `project`, first check if the project is already in annotationsList
			// by checking if it's been added to the projectsList
			const isIndexed = (project: ProjectKey) => project.name === annotationProject;
			let projectIndex = projectsList.findIndex(isIndexed);

			// if the project is not in the projectsList, add it to the annotationsList and store its key in the projectsList
			if (projectIndex === -1) {
				annotationsList.push(new ProjectItem(annotationProject));
				projectIndex = annotationsList.length - 1;
				projectsList.push(new ProjectKey(annotationProject, projectIndex));
			}
			// annotationsList[projectIndex].annotations.push()
		}
	}
}

console.log(annotationsList);

// annotationsByPage.json
// annotationsList.json
