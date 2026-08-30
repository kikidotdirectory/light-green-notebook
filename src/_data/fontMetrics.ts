// Font metrics for computing line-height to baseline relationships
// All values derived from standard TrueType/OpenType font metrics

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
	timesNewRoman: {
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

// Create metric objects with computed values
const fonts: Record<string, FontMetric> = {};

for (const [key, metrics] of Object.entries(METRICS)) {
	fonts[key] = {
		name: metrics.name,
		upm: metrics.upm,
		ascender: metrics.ascender,
		descender: metrics.descender,
		lineGap: metrics.lineGap,
		lineHeightToBaseline: (lineHeight: number) => {
			return computeLineHeightToBaseline(
				1, // 1rem = 16px by default
				lineHeight,
				metrics.upm,
				metrics.ascender,
				metrics.descender,
			);
		},
	};
}

// Pre-compute common line-height values
const COMMON_LINE_HEIGHTS = [1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.75, 2];

const fontBaselines: Record<
	string,
	{
		name: string;
		rawMetrics: {
			upm: number;
			ascender: number;
			descender: number;
			lineGap: number;
		};
		lineHeightValues: Record<
			number,
			{
				topToAscender: number;
				baselineToBottom: number;
			}
		>;
	}
> = {};

for (const [key, font] of Object.entries(fonts)) {
	const lineHeightValues: Record<
		number,
		{
			topToAscender: number;
			baselineToBottom: number;
		}
	> = {};

	for (const lh of COMMON_LINE_HEIGHTS) {
		lineHeightValues[lh] = font.lineHeightToBaseline(lh);
	}

	fontBaselines[key] = {
		name: font.name,
		rawMetrics: {
			upm: font.upm,
			ascender: font.ascender,
			descender: font.descender,
			lineGap: font.lineGap,
		},
		lineHeightValues,
	};
}

export default fontBaselines;
