const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import { ColumnGraphData, DayRecord, NewsRecord } from "@kannydennedy/dreams-2020-types";
import { SET2020, SRC_FOLDER, SIMILARITY_CUTOFFS } from "./config";
import { SIMILARITY_COLORS } from "./modules/theme";
import { consolidateDreamNewsComparisonExampleList } from "./modules/mergers";

type NewsRecordWithDates = NewsRecord & {
  dreamDate: Date;
  newsDate: Date;
  numComparisons: number;
};

console.log("Generating month column data...");

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
    return dayRecord.newsRecords.map((newsRecord: NewsRecord) => {
      const newsDate = new Date(`2020-${newsRecord.date}`);
      const record: NewsRecordWithDates = {
        ...newsRecord,
        dreamDate,
        newsDate,
        numComparisons: dreamSetSize * newsRecord.recordSize,
      };
      return record;
    });
  })
  .flat()
  // For this chart, we only care about dreams & news in the same month
  .filter((record: NewsRecordWithDates) => {
    const newsMonth = record.newsDate.getMonth();
    const dreamMonth = record.dreamDate.getMonth();
    if (isNaN(newsMonth) || isNaN(dreamMonth)) {
      throw new Error(`Invalid date: ${record.newsDate}`);
    }
    return newsMonth === dreamMonth;
  });

// Hacky, we keep track of the highest and lowest similarity
// For each month
const highestSimilarities: { [key: string]: number } = {};

// Now we have all the data for 2020
// We need to group it by month
// We're only interested in the data where dreams and news are in the same month
const monthData = dataArr2020.reduce((acc: any, record: NewsRecordWithDates) => {
  const dreamNewsMonth = record.newsDate.getMonth();

  const recordIndicativeScores = record.indicativeScores || record.moderateScores || 0;
  const recordIndiscernibleScores = record.indiscernibleScores || 0;

  // If the month is not in the accumulator, we add it
  if (!acc[dreamNewsMonth]) {
    return {
      ...acc,
      [dreamNewsMonth]: {
        month: dreamNewsMonth,
        totalSimilarity: record.similarity,
        count: 1,
        totalWordCount: record.wordCount,
        highSimilarityCount: record.highScores,
        mediumSimilarityCount: recordIndicativeScores,
        lowSimilarityCount: record.lowScores,
        indiscernibleSimilarityCount: recordIndiscernibleScores,
        exampleDreamNewsComparisons: record.examples,
        numComparisons: record.numComparisons,
      },
    };
    // If the month is in the accumulator, we add to it
  } else {
    return {
      ...acc,
      [dreamNewsMonth]: {
        ...acc[dreamNewsMonth],
        totalSimilarity: acc[dreamNewsMonth].totalSimilarity + record.similarity,
        count: acc[dreamNewsMonth].count + 1,
        numComparisons: acc[dreamNewsMonth].numComparisons + record.numComparisons,
        totalWordCount: acc[dreamNewsMonth].totalWordCount + record.wordCount,
        highSimilarityCount: acc[dreamNewsMonth].highSimilarityCount + record.highScores,
        mediumSimilarityCount:
          acc[dreamNewsMonth].mediumSimilarityCount + recordIndicativeScores,
        lowSimilarityCount: acc[dreamNewsMonth].lowSimilarityCount + record.lowScores,
        indiscernibleSimilarityCount:
          acc[dreamNewsMonth].indiscernibleSimilarityCount + recordIndiscernibleScores,
        exampleDreamNewsComparisons: [
          ...acc[dreamNewsMonth].exampleDreamNewsComparisons,
          ...record.examples,
        ],
      },
    };
  }
}, {});

// Now we just need to clean up the data
const monthDataCleaned: ColumnGraphData[] = Object.values(monthData)
  .map((monthRecord: any) => {
    const {
      totalSimilarity,
      count,
      totalWordCount,
      highSimilarityCount,
      mediumSimilarityCount,
      lowSimilarityCount,
      indiscernibleSimilarityCount,
      exampleDreamNewsComparisons,
      numComparisons,
    } = monthRecord;

    const examplesWithSimilarityLevel = consolidateDreamNewsComparisonExampleList(
      exampleDreamNewsComparisons
    );

    const ret: ColumnGraphData = {
      month: monthRecord.month,
      count: count,
      totalWordCount: totalWordCount,
      numComparisons: numComparisons,
      avgSimilarity: totalSimilarity / count,
      maxSimilarity: highestSimilarities[monthRecord.month],
      // These are secretly SimilarityLevelSections
      examples: examplesWithSimilarityLevel,
      similarityLevels: [
        {
          similarityLevel: "indiscernible",
          color: SIMILARITY_COLORS.indiscernible,
          percent: (100 / numComparisons) * indiscernibleSimilarityCount,
          threshold: SIMILARITY_CUTOFFS.indiscernible,
          count: lowSimilarityCount,
        },
        {
          similarityLevel: "low",
          color: SIMILARITY_COLORS.low,
          percent: (100 / numComparisons) * lowSimilarityCount,
          threshold: SIMILARITY_CUTOFFS.low,
          count: lowSimilarityCount,
        },
        {
          similarityLevel: "medium",
          color: SIMILARITY_COLORS.medium,
          percent: (100 / numComparisons) * mediumSimilarityCount,
          threshold: SIMILARITY_CUTOFFS.medium,
          count: mediumSimilarityCount,
        },
        {
          similarityLevel: "high",
          color: SIMILARITY_COLORS.high,
          percent: (100 / numComparisons) * highSimilarityCount,
          threshold: SIMILARITY_CUTOFFS.high,
          count: lowSimilarityCount,
        },
      ],
    };

    return ret;
  })
  .sort((a: any, b: any) => a.month - b.month);

//   Write the data to a file
const outputFile = path.join(__dirname, "../public/data/month-columns.json");
fs.writeFileSync(outputFile, JSON.stringify(monthDataCleaned, null, 2));
console.log(`Month column data written to ${outputFile}`);

export {};
