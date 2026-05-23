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

const COL_MAP: Record<string, number> = {
	l1: 1, l2: 2, l3: 3, l4: 4,
	r1: 6, r2: 7, r3: 8, r4: 9,
};

interface GridCoords {
	gridColStart: number;
	gridColEnd: number;
	gridRowStart: number;
	gridRowEnd: number;
}

function toGridCoords(shape: InputAnnotation["shape"]): GridCoords {
	const cols = shape.columns.map((c) => COL_MAP[c]);
	const rows = shape.rows;
	return {
		gridColStart: Math.min(...cols),
		gridColEnd: Math.max(...cols) + 1,
		gridRowStart: Math.min(...rows),
		gridRowEnd: Math.max(...rows) + 1,
	};
}

// reference from annotationsBySpread to a grouped sub-annotation, with its own shape
interface SubAnnotationRef extends GridCoords {
	subKey: number;
}

// passed to page generation to lookup annotations
class AnnotationKey {
	k1: number;
	// undefined = standalone; array = grouped, one entry per sub-annotation on this spread
	k2: SubAnnotationRef[] | undefined;
	// only set for standalone annotations
	gridColStart: number | undefined;
	gridColEnd: number | undefined;
	gridRowStart: number | undefined;
	gridRowEnd: number | undefined;

	constructor(key: number, coords?: GridCoords) {
		this.k1 = key;
		if (coords) {
			this.gridColStart = coords.gridColStart;
			this.gridColEnd = coords.gridColEnd;
			this.gridRowStart = coords.gridRowStart;
			this.gridRowEnd = coords.gridRowEnd;
		}
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
		const coords = toGridCoords(annotation.shape);

		if (!project) {
			// standalone annotation: push directly to annotationsList
			annotationsList.push(new AnnotationItem(annotation.content));
			const key = annotationsList.length - 1;
			annotationsBySpread[spreadNum].push(new AnnotationKey(key, coords));
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
			const subRef: SubAnnotationRef = { subKey, ...coords };

			// if this group already has a key on this spread, append the subRef; otherwise create a new key
			const existing = annotationsBySpread[spreadNum].find((k) => k.k1 === key);
			if (existing) {
				existing.k2!.push(subRef);
			} else {
				const ak = new AnnotationKey(key);
				ak.k2 = [subRef];
				annotationsBySpread[spreadNum].push(ak);
			}
		}
	}
}
