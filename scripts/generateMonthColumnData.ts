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
  // If they dream and news are not in the same month, we don't care about them
  .filter((record: NewsRecordWithDates) => {
    const newsMonth = record.newsDate.getMonth();
    const dreamMonth = record.dreamDate.getMonth();
    if (isNaN(newsMonth) || isNaN(dreamMonth)) {
      throw new Error(`Invalid date: ${record.newsDate}`);
    }
    return newsMonth === dreamMonth;
  });

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
  const highSimilarity = isHigh ? 1 : 0;
  const mediumSimilarity = isMedium ? 1 : 0;
  const lowSimilarity = isLow ? 1 : 0;

  if (!acc[dreamNewsMonth]) {
    return {
      ...acc,
      [dreamNewsMonth]: {
        month: dreamNewsMonth,
        similarity: record.similarity,
        count: 1,
        highSimilarity,
        mediumSimilarity,
        lowSimilarity,
      },
    };
  } else {
    return {
      ...acc,
      [dreamNewsMonth]: {
        ...acc[dreamNewsMonth],
        similarity: acc[dreamNewsMonth].similarity + record.similarity,
        count: acc[dreamNewsMonth].count + 1,
        highSimilarity: acc[dreamNewsMonth].highSimilarity + highSimilarity,
        mediumSimilarity: acc[dreamNewsMonth].mediumSimilarity + mediumSimilarity,
        lowSimilarity: acc[dreamNewsMonth].lowSimilarity + lowSimilarity,
      },
    };
  }
}, {});

// Now we just need to clean up the data
const monthDataCleaned = Object.values(monthData)
  .map((monthRecord: any) => {
    const { similarity, count, highSimilarity, mediumSimilarity, lowSimilarity } =
      monthRecord;
    return {
      month: monthRecord.month,
      count: count,
      avgSimilarity: similarity / count,
      highSimilarity: {
        percent: (100 / count) * highSimilarity,
        count: highSimilarity,
        threshold: HIGH_SIMILARITY,
        color: COLORS.high,
      },
      mediumSimilarity: {
        percent: (100 / count) * mediumSimilarity,
        count: mediumSimilarity,
        threshold: MEDIUM_SIMILARITY,
        color: COLORS.medium,
      },
      lowSimilarity: {
        percent: (100 / count) * lowSimilarity,
        count: lowSimilarity,
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
