const fs = require("fs");
const path = require("path");
import {
  DateTimeRange,
  ComparisonSet,
  // GranularityComparisonCollection,
  ColoredSetWithinGranularity,
  DayRecord,
} from "@kannydennedy/dreams-2020-types";
import { monthIndexFromDate, weekIndexFromDate } from "./modules/time-helpers";
import { convertNewsRecordToComparisonSet } from "./modules/type-conversions";
const { isDotPath } = require("./modules/file-felpers");
const { getBroaderGranularity } = require("./modules/get-broader-granularity");

const NUM_CONCEPTS_PER_COMPARISON = 5;
const NUM_EXAMPLES_PER_COMPARISON = 1;
const VERY_LARGE_NUMBER = 999 * 999 * 999;
const SRC_FOLDER = "../source-data-all";
const NEWS_YEAR = 2020;

const fileYearMap: { [key: string]: number } = {
  "./all-dreams-final-2020.csv": 2020,
};

////////////////////////////////////////////////////
// CONFIGURATION
////////////////////////////////////////////////////

// We need to decide what the 'coloured collections' will be
// We decide this based on date ranges
export type CollectionKey = "dreams2020" | "controlSet";
export type CollectionFinder = {
  key: CollectionKey;
  range: DateTimeRange;
  label: string;
  color: string;
};
export const colouredCollections: { [key in CollectionKey]: CollectionFinder } = {
  dreams2020: {
    key: "dreams2020",
    label: "2020 Dreams vs 2020 News Items",
    color: "hsl(10, 90%, 60%)",
    range: { from: new Date("2020-01-01"), to: new Date("2020-12-31") },
  },
  controlSet: {
    key: "controlSet",
    label: "Non-2020 Dreams vs 2020 News Items",
    color: "hsl(200, 90%, 40%)",
    range: { from: new Date("2000-01-01"), to: new Date("2019-12-31") },
  },
};

////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////

// Return the coloured collection key for a given date
const getColouredCollectionKey = (
  date: Date,
  collections: CollectionFinder[]
): CollectionKey | null => {
  const dateTime = date.getTime();
  const found = collections.find(collection => {
    const { from, to } = collection.range;
    return dateTime >= from.getTime() && dateTime <= to.getTime();
  });

  return found ? found.key : null;
};

type ComparisonDictionary = {
  [key in CollectionKey]: ComparisonSet[];
};

// Merge two comparison dictionaries
const mergeComparisonDictionaries = (
  dict1: ComparisonDictionary,
  dict2: ComparisonDictionary
): ComparisonDictionary => {
  // If one of the dictionaries is empty (it's just been cast to ComparisonDictionary in a reducer)
  // Then return the other one
  if (!Object.keys(dict1).length) return dict2;
  if (!Object.keys(dict2).length) return dict1;

  // Else, merge
  const keys: CollectionKey[] = Object.keys(dict1) as CollectionKey[];
  const ret = keys.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: [...dict1[curr], ...dict2[curr]],
    };
  }, {} as ComparisonDictionary);
  return ret;
};

////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////

// Open all the files in "../source-data" one by one
// and combine them in memory
const files = fs.readdirSync(path.join(__dirname, SRC_FOLDER));

let maxSimilarity = 0;
let minSimilarity = 1;
let maxWordCount = 0;
let minWordCount = VERY_LARGE_NUMBER;

const colouredCollectionRanges = Object.values(colouredCollections);

const data: ComparisonDictionary = files.reduce(
  (dataAcc: ComparisonDictionary, file: any) => {
    // Read the file
    const filePath = path.join(__dirname, SRC_FOLDER, file);
    const fileData = fs.readFileSync(filePath, "utf8");

    if (isDotPath(filePath)) {
      return dataAcc;
    } else {
      const parsedFileData: DayRecord = JSON.parse(fileData);

      // Get the dream date from the file
      const dreamYear: number = fileYearMap[parsedFileData.dreamSetName] || 2000;
      const dreamDate = new Date(`${dreamYear}-${parsedFileData.dreamSetDate}`);

      const comparisonSets: ComparisonSet[] = parsedFileData.newsRecords.map(s => {
        return convertNewsRecordToComparisonSet(
          s,
          dreamDate,
          NEWS_YEAR,
          NUM_CONCEPTS_PER_COMPARISON,
          NUM_EXAMPLES_PER_COMPARISON
        );
      });

      // Add the comparison sets to the dictionary
      // For a given file, the records may belong to different "coloured collections"
      const comparisonDictionary: ComparisonDictionary = comparisonSets.reduce(
        (acc, set) => {
          // Not pretty, but let's update the max and min similarity/wordcount here
          if (set.score > maxSimilarity) maxSimilarity = set.score;
          if (set.score < minSimilarity) minSimilarity = set.score;
          if (set.wordCount > maxWordCount) maxWordCount = set.wordCount;
          if (set.wordCount < minWordCount) minWordCount = set.wordCount;

          const key = getColouredCollectionKey(
            set.collection2.timePeriod.start,
            colouredCollectionRanges
          );
          if (!key) {
            return acc;
          } else if (!acc[key]) {
            return { ...acc, [key]: [set] };
          } else {
            return { ...acc, [key]: [...acc[key], set] };
          }
        },
        {} as ComparisonDictionary
      );

      const mergedData = mergeComparisonDictionaries(dataAcc, comparisonDictionary);

      return mergedData;
    }
  },
  {} as ComparisonDictionary
);

// Turn comparison dictionary into array
const dayComparisonDictionaries: ColoredSetWithinGranularity[] = Object.entries(data).map(
  ([key, value], i) => {
    return {
      label: colouredCollections[key as CollectionKey].label,
      color: colouredCollections[key as CollectionKey].color,
      comparisons: value,
    };
  }
);

// // Convert our dictionary to a big fat GranularityComparisonCollection
// const dayComparisonsCollection: GranularityComparisonCollection = {
//   granularity: "day",
//   maxSimilarity: maxSimilarity,
//   minSimilarity: minSimilarity,
//   maxWordCount: maxWordCount,
//   minWordCount: minWordCount,
//   comparisonSets: dayComparisonDictionaries,
// };

const weekComparisonsCollection = getBroaderGranularity(
  "week",
  weekIndexFromDate,
  dayComparisonDictionaries,
  NUM_EXAMPLES_PER_COMPARISON
);

const monthComparisonsCollection = getBroaderGranularity(
  "month",
  monthIndexFromDate,
  dayComparisonDictionaries,
  NUM_EXAMPLES_PER_COMPARISON
);

// Now write all the week data to a big new file
fs.writeFileSync(
  path.join(__dirname, "../public/data/weekComparisons.json"),
  JSON.stringify(weekComparisonsCollection, null, 2),
  "utf8"
);

// Now write all the month data to a big new file
fs.writeFileSync(
  path.join(__dirname, "../public/data/monthComparisons.json"),
  JSON.stringify(monthComparisonsCollection, null, 2),
  "utf8"
);

export {};