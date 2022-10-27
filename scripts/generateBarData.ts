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
import { SIMILARITY_CUTOFFS, SET2020, SRC_FOLDER } from "./config";
import { ColorTheme, SIMILARITY_COLORS } from "./modules/theme";
import { getDifferenceInDays } from "./modules/time-helpers";
import { consolidateDreamNewsComparisonExampleList } from "./modules/mergers";

type NewsRecordWithDates = NewsRecord & {
  dreamDate: Date;
  newsDate: Date;
  numComparisons: number;
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
    const dreamSetSize = dayRecord.dreamSetSize;
    const records: NewsRecordWithDates[] = dayRecord.newsRecords.map(
      (newsRecord: NewsRecord) => {
        const newsDate = new Date(`2020-${newsRecord.date}`);
        return {
          ...newsRecord,
          dreamDate,
          newsDate,
          numComparisons: dreamSetSize * newsRecord.recordSize,
        };
      }
    );
    return records;
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
  totalIndiscernibleSimilarity: number;
  wikipediaConceptDict: { [key: string]: number };
  examples: ExampleDreamNewsComparison[];
  numComparisons: number;
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

console.log("Start basic bar processing");

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

  const recordIndicativeScores = record.indicativeScores || record.moderateScores || 0;
  const recordIndiscernibleScores = record.indiscernibleScores || 0;

  const key = `${weekDiff}`;
  const currWk = weekDict[key] ? { ...weekDict[key] } : undefined;
  if (!currWk) {
    weekDict[key] = {
      difference: weekDiff,
      recordCount: 1,
      totalSimilarity: record.similarity,
      totalWordCount: record.wordCount,
      totalHighSimilarity: record.highScores,
      totalMediumSimilarity: recordIndicativeScores,
      totalLowSimilarity: record.lowScores,
      totalIndiscernibleSimilarity: recordIndiscernibleScores,
      wikipediaConceptDict: updateConceptDict(undefined, record.topConcepts),
      examples: [...record.examples],
      numComparisons: record.numComparisons,
    };
  } else {
    weekDict[key] = {
      ...currWk,
      recordCount: currWk.recordCount + 1,
      totalSimilarity: currWk.totalSimilarity + record.similarity,
      totalWordCount: currWk.totalWordCount + record.wordCount,
      numComparisons: currWk.numComparisons + record.numComparisons,
      totalHighSimilarity: currWk.totalHighSimilarity + record.highScores,
      totalMediumSimilarity: currWk.totalMediumSimilarity + recordIndicativeScores,
      totalLowSimilarity: currWk.totalLowSimilarity + record.lowScores,
      totalIndiscernibleSimilarity:
        currWk.totalIndiscernibleSimilarity + recordIndiscernibleScores,
      wikipediaConceptDict: updateConceptDict(
        currWk.wikipediaConceptDict,
        record.topConcepts
      ),
      examples: [...currWk.examples, ...record.examples],
    };
  }
});

console.log("Done basic bar processing");

// Now we loop through again, and get the averages
const weekData: DifferenceRecordWithExamples[] = Object.keys(weekDict).map(key => {
  const {
    difference,
    recordCount,
    totalSimilarity,
    totalHighSimilarity,
    totalMediumSimilarity,
    totalLowSimilarity,
    totalIndiscernibleSimilarity,
    numComparisons,
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

  // We don't need to do this for now
  // We're only showing the concepts for examples
  // const topConcepts = exampleListToTopConceptList(examples);

  const exampleDict = consolidateDreamNewsComparisonExampleList(examples);

  const diff: DifferenceRecordWithExamples = {
    difference,
    recordCount,
    topConcepts: [],
    averageSimilarity: totalSimilarity / recordCount,
    examples: exampleDict,
    numComparisons: numComparisons,
    similarityLevels: [
      {
        similarityLevel: "indiscernible",
        color: SIMILARITY_COLORS.indiscernible,
        percent: (100 / numComparisons) * totalIndiscernibleSimilarity,
        threshold: SIMILARITY_CUTOFFS.indiscernible,
        count: totalIndiscernibleSimilarity,
      },
      {
        similarityLevel: "low",
        color: SIMILARITY_COLORS.low,
        percent: (100 / numComparisons) * totalLowSimilarity,
        threshold: SIMILARITY_CUTOFFS.low,
        count: totalLowSimilarity,
      },
      {
        similarityLevel: "medium",
        color: SIMILARITY_COLORS.medium,
        percent: (100 / numComparisons) * totalMediumSimilarity,
        threshold: SIMILARITY_CUTOFFS.medium,
        count: totalMediumSimilarity,
      },
      {
        similarityLevel: "high",
        color: SIMILARITY_COLORS.high,
        percent: (100 / numComparisons) * totalHighSimilarity,
        threshold: SIMILARITY_CUTOFFS.high,
        count: totalHighSimilarity,
      },
    ],
  };
  return diff;
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
