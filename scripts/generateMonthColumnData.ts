const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import { ColumnGraphData, DayRecord, NewsRecord } from "@kannydennedy/dreams-2020-types";
import { HIGH_SIMILARITY, MEDIUM_SIMILARITY, SET2020, SRC_FOLDER } from "./config";
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

  // We check if a particular dream day / news day combination
  // Is 'high', 'medium', or 'low' similarity
  const { similarity } = record;
  const isHigh = similarity >= HIGH_SIMILARITY;
  const isMedium = similarity >= MEDIUM_SIMILARITY && similarity < HIGH_SIMILARITY;
  const isLow = similarity < MEDIUM_SIMILARITY;
  const highSimilarityAddCount = isHigh ? 1 : 0;
  const mediumSimilarityAddCount = isMedium ? 1 : 0;
  const lowSimilarityAddCount = isLow ? 1 : 0;

  // Update the highestSimilarity for this month
  if (!highestSimilarities[dreamNewsMonth]) {
    highestSimilarities[dreamNewsMonth] = similarity;
  } else {
    highestSimilarities[dreamNewsMonth] = Math.max(
      highestSimilarities[dreamNewsMonth],
      similarity
    );
  }

  // If the month is not in the accumulator, we add it
  if (!acc[dreamNewsMonth]) {
    return {
      ...acc,
      [dreamNewsMonth]: {
        month: dreamNewsMonth,
        totalSimilarity: record.similarity,
        count: 1,
        totalWordCount: record.wordCount,
        highSimilarityCount: highSimilarityAddCount,
        mediumSimilarityCount: mediumSimilarityAddCount,
        lowSimilarityCount: lowSimilarityAddCount,
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
        highSimilarityCount:
          acc[dreamNewsMonth].highSimilarityCount + highSimilarityAddCount,
        mediumSimilarityCount:
          acc[dreamNewsMonth].mediumSimilarityCount + mediumSimilarityAddCount,
        lowSimilarityCount:
          acc[dreamNewsMonth].lowSimilarityCount + lowSimilarityAddCount,
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
          similarityLevel: "low",
          color: SIMILARITY_COLORS.low,
          percent: (100 / count) * lowSimilarityCount,
          threshold: 0,
          count: lowSimilarityCount,
        },
        {
          similarityLevel: "medium",
          color: SIMILARITY_COLORS.medium,
          percent: (100 / count) * mediumSimilarityCount,
          threshold: MEDIUM_SIMILARITY,
          count: mediumSimilarityCount,
        },
        {
          similarityLevel: "high",
          color: SIMILARITY_COLORS.high,
          percent: (100 / count) * highSimilarityCount,
          threshold: HIGH_SIMILARITY,
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
