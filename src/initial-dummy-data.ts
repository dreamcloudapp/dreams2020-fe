import {
  GranularityComparisonCollection,
  DifferenceByGranularity,
} from "@kannydennedy/dreams-2020-types";
import { ColumnGraphData } from "./App";

// Dummy data for bubbles
// For when allComparisons hasn't loaded yet
export const defaultData: GranularityComparisonCollection = {
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

export const defaultColumnGraphData: ColumnGraphData[] = [
  {
    month: 0,
    count: 961,
    totalWordCount: 0,
    avgSimilarity: 0,
    maxSimilarity: 0,
    highSimilarity: { percent: 0, count: 0, threshold: 0.05, color: "red" },
    mediumSimilarity: { percent: 0, count: 0, threshold: 0.025, color: "orange" },
    lowSimilarity: { percent: 100, count: 961, threshold: 0, color: "green" },
  },
];
