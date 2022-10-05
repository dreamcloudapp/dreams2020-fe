const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import {
  DayRecord,
  DifferenceDisplayRecordWithExamples,
  DifferenceRecordSetWithExamples,
  DifferenceRecordWithExamples,
  ExampleDreamNewsComparison,
  NewsRecord,
  OptionalConceptScore,
} from "@kannydennedy/dreams-2020-types";
import { HIGH_SIMILARITY, MEDIUM_SIMILARITY, SET2020, SRC_FOLDER } from "./config";
import { getSimilarityLevel } from "./modules/similarity";
import { ColorTheme, SIMILARITY_COLORS } from "./modules/theme";
import { getDifferenceInDays } from "./modules/time-helpers";
import {
  consolidateDreamNewsComparisonExampleList,
  exampleListToTopConceptList,
} from "./modules/mergers";

type NewsRecordWithDates = NewsRecord & { dreamDate: Date; newsDate: Date };

const COLORS = {
  low: ColorTheme.BLUE,
  medium: ColorTheme.GRAY,
  high: ColorTheme.RED,
};

console.log("Generating bar data...");

// Open all the files in source data one by one
const files = fs.readdirSync(path.join(__dirname, SRC_FOLDER));

// Get all the files that have to do with 2020
const dataArr2020: NewsRecordWithDates[] = files
  .filter((file: any) => !isDotFile(file))
  .map((file: any) => {
    // Read the file
    const filePath = path.join(__dirname, SRC_FOLDER, file);
    const fileData = fs.readFileSync(filePath, "utf8");
    // Each file represents a day of dreams
    const dayRecord: DayRecord = JSON.parse(fileData);
    return dayRecord;
  })
  // We're only interested in 2020 dreams for this chart
  .filter((dayRecord: DayRecord) => dayRecord.dreamSetName === SET2020)
  .map((dayRecord: DayRecord) => {
    // Get the dream date based on dreamSetDate
    const dreamDate = new Date(`2020-${dayRecord.dreamSetDate}`);
    return dayRecord.newsRecords.map((newsRecord: NewsRecord) => {
      const newsDate = new Date(`2020-${newsRecord.date}`);
      return { ...newsRecord, dreamDate, newsDate };
    });
  })
  .flat()
  // For this chart, we only care about dreams & news within 6 months of each other
  // But really this doesn't matter
  // Because that's all that's in the data for now
  .filter((record: NewsRecordWithDates) => {
    const { dreamDate, newsDate } = record;
    const diff = Math.abs(getDifferenceInDays(newsDate, dreamDate));
    return diff <= 180;
  });

// We're going to loop through dataArr2020: NewsRecordWithDates[]
// We're just going to do it by weeks, keep it simple
type IntermediaryDifferenceRecord = {
  difference: number;
  recordCount: number;
  totalSimilarity: number;
  totalWordCount: number;
  totalLowSimilarity: number;
  totalMediumSimilarity: number;
  totalHighSimilarity: number;
  wikipediaConceptDict: { [key: string]: number };
  examples: ExampleDreamNewsComparison[];
};

const weekDict: { [key: string]: IntermediaryDifferenceRecord } = {};

// Keep a running dictionary of concepts, keyed by title
// With score accumulating
// i.e. {title: score}
// It's a mess but someone's got to do it
const updateConceptDict = (
  prevConceptDict: { [key: string]: number } | undefined,
  newConcepts: OptionalConceptScore[]
): { [key: string]: number } => {
  if (prevConceptDict === undefined) {
    return newConcepts.reduce((acc, curr) => {
      if (!curr) {
        return acc;
      } else {
        return {
          ...acc,
          [curr.concept]: curr.score,
        };
      }
    }, {});
  } else {
    return newConcepts.reduce((acc, curr) => {
      if (!curr) {
        return acc;
      } else if (acc[curr.concept]) {
        return {
          ...acc,
          [curr.concept]: acc[curr.concept] + curr.score,
        };
      } else {
        return {
          ...acc,
          [curr.concept]: curr.score,
        };
      }
    }, prevConceptDict);
  }
};

dataArr2020.forEach((record: NewsRecordWithDates, index) => {
  const { dreamDate, newsDate } = record;

  // If the news comes before the dream, the difference is positive
  // If the dream comes before the news, the difference is negative
  // Zero is the same day
  const diff = getDifferenceInDays(newsDate, dreamDate);

  // In this case, zero means that the dream came after the news
  // But within one week
  // -1 means that the dream came before the news, but within one week
  const weekDiff = Math.floor(diff / 7);

  // Work out the similarity level
  const s = getSimilarityLevel(record.similarity);

  const key = `${weekDiff}`;
  const currWk = weekDict[key] ? { ...weekDict[key] } : undefined;
  if (!currWk) {
    weekDict[key] = {
      difference: weekDiff,
      recordCount: 1,
      totalSimilarity: record.similarity,
      totalWordCount: record.wordCount,
      totalHighSimilarity: s === "high" ? 1 : 0,
      totalMediumSimilarity: s === "medium" ? 1 : 0,
      totalLowSimilarity: s == "low" ? 1 : 0,
      wikipediaConceptDict: updateConceptDict(undefined, record.topConcepts),
      examples: [...record.examples],
    };
  } else {
    weekDict[key] = {
      ...currWk,
      recordCount: currWk.recordCount + 1,
      totalSimilarity: currWk.totalSimilarity + record.similarity,
      totalWordCount: currWk.totalWordCount + record.wordCount,
      totalHighSimilarity:
        s === "high" ? currWk.totalHighSimilarity + 1 : currWk.totalHighSimilarity,
      totalMediumSimilarity:
        s === "medium" ? currWk.totalMediumSimilarity + 1 : currWk.totalMediumSimilarity,
      totalLowSimilarity:
        s == "low" ? currWk.totalLowSimilarity + 1 : currWk.totalLowSimilarity,
      wikipediaConceptDict: updateConceptDict(
        currWk.wikipediaConceptDict,
        record.topConcepts
      ),
      examples: [...currWk.examples, ...record.examples],
    };
  }
});

// Now we loop through again, and get the averages
const weekData: DifferenceRecordWithExamples[] = Object.keys(weekDict).map(key => {
  const {
    difference,
    recordCount,
    totalSimilarity,
    totalHighSimilarity,
    totalMediumSimilarity,
    totalLowSimilarity,
    // wikipediaConceptDict,
    examples,
  } = weekDict[key];

  // // Turn the wikipediaConceptDict into a shortlist of top concepts
  // const allConcepts: WikipediaConcept[] = Object.entries(wikipediaConceptDict).map(
  //   ([title, score]) => ({
  //     title: title,
  //     score: score,
  //   })
  // );
  // const topConcepts = consolidateWikipediaConceptList(allConcepts, 5);
  const topConcepts = exampleListToTopConceptList(examples);
  const exampleDict = consolidateDreamNewsComparisonExampleList(examples);

  return {
    difference,
    recordCount,
    topConcepts,
    averageSimilarity: totalSimilarity / recordCount,
    examples: exampleDict,
    similarityLevels: [
      {
        similarityLevel: "low",
        color: SIMILARITY_COLORS.low,
        percent: (100 / recordCount) * totalLowSimilarity,
        threshold: 0,
        count: totalLowSimilarity,
      },
      {
        similarityLevel: "medium",
        color: SIMILARITY_COLORS.medium,
        percent: (100 / recordCount) * totalMediumSimilarity,
        threshold: MEDIUM_SIMILARITY,
        count: totalMediumSimilarity,
      },
      {
        similarityLevel: "high",
        color: SIMILARITY_COLORS.high,
        percent: (100 / recordCount) * totalHighSimilarity,
        threshold: HIGH_SIMILARITY,
        count: totalHighSimilarity,
      },
    ],
  };
});

// Get the min/max
const maxAverageSimilarity = Math.max(
  ...weekData.map(record => record.averageSimilarity)
);
const minAverageSimilarity = Math.min(
  ...weekData.map(record => record.averageSimilarity)
);

// Sort week data by difference
weekData.sort((a, b) => a.difference - b.difference);

// Make a DifferenceRecordSet
const weekDataWithMinMax: DifferenceRecordSetWithExamples = {
  differences: weekData,
  maxAverageSimilarity,
  minSimilarity: minAverageSimilarity,
  maxSimilarity: maxAverageSimilarity, // Don't remember why I have both of these
};

// Make a DifferenceDisplayRecord
const weekDataDisplay: DifferenceDisplayRecordWithExamples = {
  key: "2020",
  color: ColorTheme.RED,
  comparisons: weekDataWithMinMax,
};

//   Write the data to a file
const outputFile = path.join(__dirname, "../public/data/bar-data.json");
fs.writeFileSync(outputFile, JSON.stringify(weekDataDisplay, null, 2));
console.log(`Bar data written to ${outputFile}`);

export {};
