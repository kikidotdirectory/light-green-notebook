interface FontMetric {
	name: string;
	// Font metrics in units per em (UPM)
	upm: number;
	ascender: number;
	descender: number;
	lineGap: number;
	// Computed ratios for line-height calculations
	lineHeightToBaseline: (lineHeight: number) => {
		topToAscender: number; // rem units from line-top to ascender
		baselineToBottom: number; // rem units from baseline to line-bottom
	};
}

// Standard web font metrics (sourced from font files)
const METRICS = {
	arial: {
		name: "Arial",
		upm: 2048,
		ascender: 1468,
		descender: -452,
		lineGap: 0,
	},
	times: {
		name: "Times New Roman",
		upm: 2048,
		ascender: 1468,
		descender: -452,
		lineGap: 0,
	},
} as const;

// Calculate line-height to baseline relationship
function computeLineHeightToBaseline(
	fontSize: number,
	lineHeight: number,
	upm: number,
	ascender: number,
	descender: number,
): {
	topToAscender: number;
	baselineToBottom: number;
} {
	// Scale metrics to font size
	const scaledAscender = (ascender / upm) * fontSize;
	const scaledDescender = (descender / upm) * fontSize;
	const scaledLineHeight = lineHeight * fontSize;

	// Center the content vertically within the line-height
	const totalContent = scaledAscender - scaledDescender;
	const whitespace = scaledLineHeight - totalContent;
	const topPadding = whitespace / 2;

	// Distance from line-top to ascender (in rem)
	const topToAscender = topPadding / fontSize;
	// Distance from baseline to line-bottom (in rem)
	const baselineToBottom = (whitespace / 2 - scaledDescender) / fontSize;

	return {
		topToAscender,
		baselineToBottom,
	};
}

export function calcFontMetrics(lineHeight: number) {
	const fontBaselines: Record<
		string,
		{
			topToAscender: number;
			baselineToBottom: number;
		}
	> = {};

	for (const [key, metric] of Object.entries(METRICS)) {
		fontBaselines[key] = {
			...computeLineHeightToBaseline(1, lineHeight, metric.upm, metric.ascender, metric.descender),
		};
	}

	return fontBaselines;
}
