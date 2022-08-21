const fs = require("fs");
const path = require("path");
import {
  DateTimeRange,
  ComparisonSet,
  ColoredSetWithinGranularity,
  DayRecord,
} from "@kannydennedy/dreams-2020-types";
import {
  CONTROL_SET_NAME,
  NEWS_YEAR,
  NUM_CONCEPTS_PER_COMPARISON,
  NUM_EXAMPLES_PER_COMPARISON,
  SET2020,
  SET_2020_NAME,
  SRC_FOLDER,
  VERY_LARGE_NUMBER,
  CONTROL_SET,
} from "./config";
import { ColorTheme } from "./modules/theme";
import { monthIndexFromDate, weekIndexFromDate } from "./modules/time-helpers";
import { convertNewsRecordToDayComparisonSet } from "./modules/type-conversions";
const { isDotFile } = require("./modules/file-felpers");
const { getBroaderGranularity } = require("./modules/get-broader-granularity");

const fileYearMap: { [key: string]: number } = {
  [SET2020]: 2020,
  [CONTROL_SET]: 2019,
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
    label: SET_2020_NAME,
    color: ColorTheme.RED,
    range: { from: new Date("2020-01-01"), to: new Date("2020-12-31") },
  },
  controlSet: {
    key: "controlSet",
    label: CONTROL_SET_NAME,
    color: ColorTheme.BLUE,
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

  if (!Object.keys(dict1) || !Object.keys(dict1).length) return dict2;
  if (!Object.keys(dict2) || !Object.keys(dict2).length) return dict1;

  // Else, merge
  const keys: CollectionKey[] = Object.keys(dict1) as CollectionKey[];

  // if (Math.random() > 0.99) {
  //   console.log(dict1, dict2);
  // }

  const ret = keys.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: [...dict1[curr], ...dict2[curr]],
    };
  }, {} as ComparisonDictionary);

  // console.log("merged", ret);

  return ret;
};

////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////

let maxSimilarity = 0;
let minSimilarity = 1;
let maxWordCount = 0;
let minWordCount = VERY_LARGE_NUMBER;

const colouredCollectionRanges = Object.values(colouredCollections);

// Open all the files in "../source-data" one by one
// and combine them in memory
const files = fs.readdirSync(path.join(__dirname, SRC_FOLDER));

const dataArr: ComparisonDictionary[] = files
  .filter((file: any) => !isDotFile(file))
  .map((file: any) => {
    // Read the file
    const filePath = path.join(__dirname, SRC_FOLDER, file);
    const fileData = fs.readFileSync(filePath, "utf8");

    // Each file represents a day of dreams,
    // Compared to multiple days of news
    const parsedFileData: DayRecord = JSON.parse(fileData);

    // Get the dream date from the file
    // The year isn't included in the file, only the month and day
    // We have to infer the year from the dreamSetName, and
    // We just give an arbitrary year to pre-2020 dreams
    const dreamYear: number = fileYearMap[parsedFileData.dreamSetName];
    if (!dreamYear) throw new Error("No year found for file");
    const dreamDate = new Date(`${dreamYear}-${parsedFileData.dreamSetDate}`);
    if (isNaN(dreamDate.getTime())) throw new Error("Invalid date");

    // ComparisonSet is all the comparisons within a given "coloured set" in a granularity
    // In this case, we're making 'day comparisons'
    // i.e. One day of dreams compared to one day of news
    const comparisonSets: ComparisonSet[] = parsedFileData.newsRecords.map(newsRecord => {
      const ret = convertNewsRecordToDayComparisonSet(
        newsRecord,
        dreamDate,
        NEWS_YEAR,
        NUM_CONCEPTS_PER_COMPARISON,
        NUM_EXAMPLES_PER_COMPARISON
      );
      return ret;
    });

    // Update max/min similarity
    comparisonSets.forEach(set => {
      // Not pretty, but let's update the max and min similarity/wordcount here
      if (set.score > maxSimilarity) maxSimilarity = set.score;
      if (set.score < minSimilarity) minSimilarity = set.score;
      if (set.wordCount > maxWordCount) maxWordCount = set.wordCount;
      if (set.wordCount < minWordCount) minWordCount = set.wordCount;
    });

    // Add the comparison sets to the dictionary
    // For a given file, the records may belong to different "coloured collections"
    const comparisonDictionary: ComparisonDictionary = comparisonSets.reduce(
      (acc, set) => {
        const key = getColouredCollectionKey(
          set.newsCollection.timePeriod.start,
          colouredCollectionRanges
        );
        if (!key) throw new Error("No key found for set");

        if (!acc[key]) {
          return { ...acc, [key]: [set] };
        } else {
          return { ...acc, [key]: [...acc[key], set] };
        }
      },
      {} as ComparisonDictionary
    );

    return comparisonDictionary;
  });

// Merge the data arrays
const data: ComparisonDictionary = dataArr.reduce(
  mergeComparisonDictionaries,
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

const weekComparisonsCollection = getBroaderGranularity(
  "week",
  weekIndexFromDate,
  dayComparisonDictionaries,
  NUM_EXAMPLES_PER_COMPARISON
);

console.log(weekComparisonsCollection.comparisonSets.length, "comparisons");

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
