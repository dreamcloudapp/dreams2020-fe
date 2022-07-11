const fs = require("fs");
const path = require("path");
const { isDotPath } = require("./modules/file-felpers");
const { getDifferenceInDays } = require("./modules/time-helpers");
import {
  DifferenceDictionary,
  DayRecord,
  NewsRecord,
  DifferenceRecord,
  DifferenceByGranularity,
} from "@kannydennedy/dreams-2020-types";

const YEAR = 2020;
const SRC_FOLDER = "../source-data-all";

////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////
const differenceDictToArray = (
  dict: DifferenceDictionary
): { differences: DifferenceRecord[] } => {
  // Convert the day dictionary to an array
  const arr: DifferenceRecord[] = Object.keys(dict).map((key: string) => {
    return {
      difference: parseInt(key),
      averageSimilarity: dayDictionary[key].average,
      recordCount: dayDictionary[key].recordCount,
    };
  });

  // Sort the array by difference
  const sortedArr = arr.sort((a: DifferenceRecord, b: DifferenceRecord) => {
    return a.difference - b.difference;
  });

  return { differences: sortedArr };
};

////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////

const dayDictionary: DifferenceDictionary = {};

// Open all the files in source data one by one
const files = fs.readdirSync(path.join(__dirname, SRC_FOLDER));

let maxSimilarity = 0;
let minSimilarity = 1;

files.forEach((file: any) => {
  const filePath = path.join(__dirname, SRC_FOLDER, file);
  const fileData = fs.readFileSync(filePath, "utf8");

  // Check if the file is empty, and if so, skip it
  if (fileData.length === 0) {
    return;
  }
  // Check if the file is a dot file, and if so, skip it
  if (isDotPath(filePath)) {
    return;
  }

  const parsedFileData: DayRecord = JSON.parse(fileData);

  const dreamSetDate = new Date(`${YEAR}-${parsedFileData.dreamSetDate}`);

  // Loop over the news records in the file
  parsedFileData.newsRecords.forEach((newsRecord: NewsRecord) => {
    const { similarity, date: newsDateString } = newsRecord;

    // Update max and min similarity
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
    if (similarity < minSimilarity) {
      minSimilarity = similarity;
    }

    const newsDate = new Date(`${YEAR}-${newsDateString}`);

    // Get the difference, in days, between the news date and the dream set date
    const daysDifference = getDifferenceInDays(newsDate, dreamSetDate);
    // const weekDifference = Math.floor(daysDifference / 7);
    // const monthDifference = Math.floor(daysDifference / 30);

    const key = `${daysDifference}`;

    // Add to day dictionary
    if (!dayDictionary[key]) {
      dayDictionary[key] = {
        average: similarity,
        recordCount: 1,
      };
    } else {
      const { average: oldAverage, recordCount: oldRecordCount } = dayDictionary[key];
      const newRecordCount = oldRecordCount + 1;
      const newAverage = (oldAverage * oldRecordCount + similarity) / newRecordCount;

      dayDictionary[key] = {
        average: newAverage,
        recordCount: newRecordCount,
      };
    }
  });
});

console.log(maxSimilarity, minSimilarity);

const data: DifferenceByGranularity = {
  day: {
    differences: differenceDictToArray(dayDictionary).differences,
    maxSimilarity: maxSimilarity,
    minSimilarity: minSimilarity,
  },
  week: {
    differences: [],
    maxSimilarity: 1,
    minSimilarity: 0,
  },
  month: {
    differences: [],
    maxSimilarity: 1,
    minSimilarity: 0,
  },
  year: {
    differences: [],
    maxSimilarity: 1,
    minSimilarity: 0,
  },
};

// Print the dicitonary to JSON
const json = JSON.stringify(data, null, 2);
fs.writeFileSync(path.join(__dirname, "../public/data/differences.json"), json);

export {};
