// annotations from annotations.json
interface InputAnnotation {
	content: {
		project?: string;
		desc: string;
		date: string;
		seeAlso?: string;
	};
	shape: {
		columns: ("l1" | "l2" | "l3" | "l4" | "r1" | "r2" | "r3" | "r4")[];
		rows: (1 | 2 | 3 | 4)[];
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
const parsedAnnotations = JSON.parse(decoder.decode(Deno.readFileSync("src/annotations.json")));

export const annotationsList: (GroupItem | AnnotationItem)[] = [];
export const annotationsBySpread: Record<number, AnnotationKey[]> = {};

// tracks where each group lives in annotationsList so subsequent annotations from the same project can find it
const groupIndex = new Map<string, number>();

for (const spread in parsedAnnotations) {
	const spreadNum = Number(spread);
	annotationsBySpread[spreadNum] = [];

	for (const annotation of parsedAnnotations[spread] as InputAnnotation[]) {
		const project = annotation.content.project;

		if (!project) {
			// standalone annotation: push directly to annotationsList
			annotationsList.push(new AnnotationItem(annotation.content));
			const key = annotationsList.length - 1;
			annotationsBySpread[spreadNum].push(new AnnotationKey(annotation, key));
		} else {
			// grouped annotation: find or create the GroupItem in annotationsList
			let key = groupIndex.get(project);
			if (key === undefined) {
				annotationsList.push(new GroupItem(project));
				key = annotationsList.length - 1;
				groupIndex.set(project, key);
			}

			const group = annotationsList[key] as GroupItem;
			group.annotations.push(new AnnotationItem(annotation.content));
			const subKey = group.annotations.length - 1;

			// if this group already has a key on this spread, append the subindex; otherwise create a new key
			const existing = annotationsBySpread[spreadNum].find((k) => k.k1 === key);
			if (existing) {
				existing.k2!.push(subKey);
			} else {
				annotationsBySpread[spreadNum].push(new AnnotationKey(annotation, key, [subKey]));
			}
		}
	}
}
