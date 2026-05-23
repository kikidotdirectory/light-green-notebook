// annotations from annotations.json
interface InputAnnotation {
	"content": {
		"project": string;
		"desc": string;
		"date": string;
		"seeAlso"?: string;
	};
	"shape": {
		"columns": ("l1" | "l2" | "l3" | "l4" | "r1" | "r2" | "r3" | "r4")[];
		"rows": (1 | 2 | 3 | 4)[];
	};
}

// passed to page generation to lookup Annotations
class AnnotationKey {
	k1: number;
	k2: number[] | undefined;
	shape: {
		columns: ("l1" | "l2" | "l3" | "l4" | "r1" | "r2" | "r3" | "r4")[];
		rows: (1 | 2 | 3 | 4)[];
	};
	constructor(input: InputAnnotation, key: number, key2?: number[]) {
		this.shape = input.shape;
		this.k1 = key;
		this.k2 = key2;
	}
}

// content of annotations, to be accessed from the keys in AnnotationKey
class AnnotationItem {
	desc: string;
	date: string;
	seeAlso: string | undefined;

	constructor(content: InputAnnotation["content"]) {
		this.desc = content.desc;
		this.date = content.date;
		this.seeAlso = content.seeAlso ?? undefined;
	}
}

// lookup values for building annotations, not used to build pages
class GroupLookupKey {
	name: string;
	key: number;

	constructor(name: string, key: number) {
		this.name = name;
		this.key = key;
	}
}

// identifier for a GroupKey, to be passed in alongside and containing AnnotationKeys
class GroupKey {
	name: string;
	key: number;
	annotations: number[];

	constructor(name: string, index: number) {
		this.name = name;
		this.key = index;
		this.annotations = [];
	}
}

// content of Group containing metadata and associated annotations
class GroupItem {
	name: string;
	annotations: AnnotationItem[];

	constructor(projectName: string) {
		this.name = projectName;
		this.annotations = [];
	}
}

const decoder = new TextDecoder("utf-8");
const annotations = JSON.parse(decoder.decode(Deno.readFileSync("src/annotations.json")));

export const annotationsBySpread = annotations;
export const annotationsList: (GroupItem | Annotation["content"])[] = [];

const projectsList: GroupKey[] = [];

for (const spread in annotationsBySpread) {
	for (const annotation of annotationsBySpread[spread]) {
		const annotationProject = annotation.content.project;
		const index = [];

		// if the annotation does not have a 'project', push it directly to annotationsList.
		if (!annotationProject) {
			annotationsList.push(annotation.content);
			index.push(annotationsList.length - 1);
		} else {
			// if the annotation does have a `project`, first check if the project is already in annotationsList
			// by checking if it's been added to the projectsList
			const isIndexed = (project: GroupKey) => project.name === annotationProject;
			const keyIndex = projectsList.findIndex(isIndexed);
			let projectIndex;

			// if the project is not in the projectsList, add it to the annotationsList and store its key in the projectsList
			if (keyIndex === -1) {
				annotationsList.push(new GroupItem(annotationProject));
				projectIndex = annotationsList.length - 1;
				projectsList.push(new GroupKey(annotationProject, projectIndex));
			} else {
				projectIndex = projectsList[keyIndex].key;
			}

			(annotationsList[projectIndex] as GroupItem).annotations.push(
				new ProjectAnnotation(annotation.content.desc, annotation.content.date),
			);

			// store the index of Project and the annotation's index within it.
			index.push(projectIndex);
			index.push((annotationsList[projectIndex] as GroupItem).annotations.length - 1);
		}

		// store the index within the annotation for use in annotationsByPage
		annotation.index = index;
	}
}
