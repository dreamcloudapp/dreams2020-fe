const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import { DayRecord, NewsRecord } from "@kannydennedy/dreams-2020-types";
import { SET2020, SRC_FOLDER } from "./config";
import { ColorTheme } from "./modules/theme";

type NewsRecordWithDates = NewsRecord & { dreamDate: Date; newsDate: Date };
const COLORS = {
  low: ColorTheme.BLUE,
  medium: ColorTheme.GRAY,
  high: ColorTheme.RED,
};

console.log("Generating month column data...");

// We're going to choose some arbitrary figures here
const HIGH_SIMILARITY = 0.04;
const MEDIUM_SIMILARITY = 0.02;

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
        totalWordCount: acc[dreamNewsMonth].totalWordCount + record.wordCount,
        highSimilarityCount:
          acc[dreamNewsMonth].highSimilarityCount + highSimilarityAddCount,
        mediumSimilarityCount:
          acc[dreamNewsMonth].mediumSimilarityCount + mediumSimilarityAddCount,
        lowSimilarityCount:
          acc[dreamNewsMonth].lowSimilarityCount + lowSimilarityAddCount,
      },
    };
  }
}, {});

// Now we just need to clean up the data
const monthDataCleaned = Object.values(monthData)
  .map((monthRecord: any) => {
    const {
      totalSimilarity,
      count,
      totalWordCount,
      highSimilarityCount,
      mediumSimilarityCount,
      lowSimilarityCount,
    } = monthRecord;
    return {
      month: monthRecord.month,
      count: count,
      totalWordCount: totalWordCount,
      avgSimilarity: totalSimilarity / count,
      maxSimilarity: highestSimilarities[monthRecord.month],
      highSimilarity: {
        percent: (100 / count) * highSimilarityCount,
        count: highSimilarityCount,
        threshold: HIGH_SIMILARITY,
        color: COLORS.high,
      },
      mediumSimilarity: {
        percent: (100 / count) * mediumSimilarityCount,
        count: mediumSimilarityCount,
        threshold: MEDIUM_SIMILARITY,
        color: COLORS.medium,
      },
      lowSimilarity: {
        percent: (100 / count) * lowSimilarityCount,
        count: lowSimilarityCount,
        threshold: 0,
        color: COLORS.low,
      },
    };
  })
  .sort((a: any, b: any) => a.month - b.month);

//   Write the data to a file
const outputFile = path.join(__dirname, "../public/data/month-columns.json");
fs.writeFileSync(outputFile, JSON.stringify(monthDataCleaned, null, 2));
console.log(`Month column data written to ${outputFile}`);

export {};
