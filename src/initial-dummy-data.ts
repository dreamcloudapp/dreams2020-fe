import {
  GranularityComparisonCollection,
  DifferenceByGranularity,
  DifferenceDisplayRecordWithExamples,
  ColumnGraphData,
  ExamplesWithSimilarityLevel,
  RadarPersonData,
} from "@kannydennedy/dreams-2020-types";

// Dummy data for bubbles
// For when allComparisons hasn't loaded yet
export const defaultBubbleData: GranularityComparisonCollection = {
  comparisonSets: [],
  maxSimilarity: 1,
  minSimilarity: 0,
  maxWordCount: 100,
  minWordCount: 1,
  granularity: "month",
};

// Dummy data for columns
export const defaultDifferencesData: DifferenceByGranularity = {
  day: [
    {
      key: "2020",
      color: "hsl(24, 84%, 56%)",
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
  week: [
    {
      key: "2020",
      color: "hsl(24, 84%, 56%)",
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
  month: [
    {
      key: "2020",
      color: "hsl(24, 84%, 56%)",
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
  year: [
    {
      key: "2020",
      color: "hsl(24, 84%, 56%)",
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
};

export const defaultBarData: DifferenceDisplayRecordWithExamples = {
  key: "2020",
  color: "hsl(24, 84%, 56%)",
  comparisons: {
    differences: [],
    maxSimilarity: 1,
    minSimilarity: 0,
    maxAverageSimilarity: 1,
  },
};

const blankSimilarityExample: ExamplesWithSimilarityLevel = {
  high: { dreamId: "", newsId: "", score: 0, concepts: [] },
  medium: { dreamId: "", newsId: "", score: 0, concepts: [] },
  low: { dreamId: "", newsId: "", score: 0, concepts: [] },
  indiscernible: { dreamId: "", newsId: "", score: 0, concepts: [] },
};

export const defaultColumnGraphData: ColumnGraphData[] = [
  {
    month: 0,
    count: 961,
    totalWordCount: 0,
    avgSimilarity: 0,
    maxSimilarity: 0,
    similarityLevels: [],
    examples: blankSimilarityExample,
    numComparisons: 0,
  },
];

export const defaultRadarData: RadarPersonData[] = [];
