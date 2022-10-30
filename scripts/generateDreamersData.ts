const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import { ColumnGraphData, DayRecord, NewsRecord } from "@kannydennedy/dreams-2020-types";
import { SET2020, DREAMERS_SRC_FOLDER, SIMILARITY_CUTOFFS } from "./config";
import { SIMILARITY_COLORS } from "./modules/theme";
import { consolidateDreamNewsComparisonExampleList } from "./modules/mergers";
import { isEmptyFile } from "./modules/file-helpers";
import { truncateString } from "./modules/string-helpers";
const csv = require("csv-parser");

type NewsRecordWithDates = NewsRecord & {
  dreamDate: Date;
  newsDate: Date;
  numComparisons: number;
};

const DREAM_MAX_LEN = 2000;

//////////////////////////////////////////
// Read CSV files and convert to JSON
//////////////////////////////////////////

// We need to parse the Dreamers CSV first
// So we know which dreams belong to which dreamers
const DREAMS_FILE_PATH = "../source-dreams-news/newsy-dreams.csv";
const dreamsFile = path.join(__dirname, DREAMS_FILE_PATH);
type DreamerCsvRow = {
  ID: string;
  Title: string;
  Date: string;
  Dream: string;
  Dreamer: string;
  "Dreamer alias": string;
  "2020 reference": string;
  "Real Date": string;
};
type DreamerCsvRowWithRealId = DreamerCsvRow & {
  realId: string;
};

// Read the all-dreams-final.json file to get the real ids
const DREAMS_JSON_PATH = "../public/data/all-dreams-final.json";
const dreamsJsonPath = path.join(__dirname, DREAMS_JSON_PATH);
const allDreams = require(dreamsJsonPath);

const results: DreamerCsvRowWithRealId[] = [];

fs.createReadStream(dreamsFile)
  .pipe(csv())
  .on("data", (data: DreamerCsvRow) => {
    const truncatedData = {
      ...data,
      realId: findRealId(data.Dream, allDreams),
      Dream: truncateString(data.Dream, DREAM_MAX_LEN),
    };
    // For now, we're only interested in 2020 dreams.
    // We can deal with the rest later
    if (truncatedData.ID) {
      results.push(truncatedData);
    }
  })
  .on("end", () => {
    console.log("Parsed CSV file");

    // Group the results by dreamer alias
    const dreamers = results.reduce((acc: any, dream: DreamerCsvRow) => {
      const dreamerAlias = dream["Dreamer alias"];
      if (!acc[dreamerAlias]) {
        acc[dreamerAlias] = [];
      }
      acc[dreamerAlias].push(dream);
      return acc;
    }, {});

    //   Write the data to a file
    const outputFile = path.join(__dirname, "../public/data/newsy-dreamers.json");
    fs.writeFileSync(outputFile, JSON.stringify(dreamers, null, 2));
    console.log(`Month column data written to ${outputFile}`);
  });

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

// What we eventually want to return is a 'GranularityComparisonCollection'.
// Everything needed for a given granularity
// export type GranularityComparisonCollection = {
//     granularity: Granularity;
//     maxSimilarity: number;
//     minSimilarity: number;
//     maxWordCount: number;
//     minWordCount: number;
//     comparisonSets: ColoredSetWithinGranularity[];
//  };

// // The coloured sets within a granularity
// export type ColoredSetWithinGranularity = {
//     label: string;
//     color: string;
//     comparisons: ComparisonSet[];
//   };

// All the comparisons within a given "coloured set" in a granularity
// I.e. in the case of a bubble chart, the bubbles
// export type ComparisonSet = {
//     id: string;
//     granularity: Granularity; // "day", "week", "month", "year"
//     label: string; // E.g. "March 2020 Dreams vs. April 2020 News"
//     dreamCollection: CollectionParams;
//     newsCollection: CollectionParams;
//     score: number;
//     wordCount: number;
//     examples: ExampleRecordComparison[];
//     similarityExamples?: ExamplesWithSimilarityLevel;
//     concepts: WikipediaConcept[];
//     numComparisons: number; // Number of individual comparisons used. We can actually calculate this by multiplying dreamSetSize * recordSize
//     numDayComparisons: number; // The basic unit of comparison is a day, so this is the number of days that were compared
//   };

//////////////////////////////////////////
// Helper functions
//////////////////////////////////////////

function findRealId(dreamText: string, allDreams: any): string {
  const allDreamsArr = Object.values(allDreams);
  const dream = allDreamsArr.find(dream => {
    // To reduce errors, let's take a substring from 20 to 50
    // (dream as any).text === dreamText
    return (dream as any).text.substring(20, 50) === dreamText.substring(20, 50);
  });
  if (dream) {
    return (dream as any).id as string;
  } else {
    console.log("Missing dream: ", truncateString(dreamText, 100));
    return "";
    // Generate a random integer between 1 and 100000000
    // return (Math.floor(Math.random() * 100000000) * -1).toString();
  }
}

export {};
