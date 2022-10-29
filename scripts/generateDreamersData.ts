const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import { ColumnGraphData, DayRecord, NewsRecord } from "@kannydennedy/dreams-2020-types";
import { SET2020, DREAMERS_SRC_FOLDER, SIMILARITY_CUTOFFS } from "./config";
import { SIMILARITY_COLORS } from "./modules/theme";
import { consolidateDreamNewsComparisonExampleList } from "./modules/mergers";
import { isEmptyFile } from "./modules/file-helpers";

type NewsRecordWithDates = NewsRecord & {
  dreamDate: Date;
  newsDate: Date;
  numComparisons: number;
};

console.log("Generating dreamers data...");

// Open all the files in source data one by one
const files = fs.readdirSync(path.join(__dirname, DREAMERS_SRC_FOLDER));

// Get all the files that have to do with 2020
const dataArr2020: NewsRecordWithDates[] = files
  .filter((file: any) => {
    const filePath = path.join(__dirname, DREAMERS_SRC_FOLDER, file);
    return !isDotFile(file) && !isEmptyFile(filePath);
  })
  .map((file: any) => {
    // Read the file
    const filePath = path.join(__dirname, DREAMERS_SRC_FOLDER, file);
    const fileData = fs.readFileSync(filePath, "utf8");
    // Each file represents a day of dreams
    const dayRecord: DayRecord = JSON.parse(fileData);
    return dayRecord;
  })
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
  .flat();

//   Write the data to a file
const outputFile = path.join(__dirname, "../public/data/newsy-dreamers.json");
fs.writeFileSync(outputFile, JSON.stringify(dataArr2020, null, 2));
console.log(`Month column data written to ${outputFile}`);

export {};
