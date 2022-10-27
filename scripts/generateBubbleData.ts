const fs = require("fs");
const path = require("path");
import {
  DateTimeRange,
  ComparisonSet,
  ColoredSetWithinGranularity,
  DayRecord,
  GranularityComparisonCollection,
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
const { isDotFile } = require("./modules/file-helpers");
const { getBroaderGranularity } = require("./modules/get-broader-granularity");

// Each of the input data files (from Sheldon) has a field 'dreamSetName'
// This field indicates the CSV file that the data came from
// From the name of this file, we determine the 'year' of the dreams
// Since the year isn't in the file.
// We've decided that the exact year isn't important for the control set
// So we put it all together in 2019
const fileYearMap: { [key: string]: number } = {
  [SET2020]: 2020,
  [CONTROL_SET]: 2019,
};

////////////////////////////////////////////////////
// CONFIGURATION
////////////////////////////////////////////////////

// We need to decide what the 'coloured collections' will be
// E.g. Dreams 2020 and Control Set
// We will decide the members of these collections (comparisons) based on date ranges

// export type CollectionKey = "dreams2020" | "controlSet";
export type CollectionKey = "dreams2020" | "controlSet";
export type CollectionFinder = {
  key: CollectionKey;
  range: DateTimeRange;
  label: string;
  color: string;
};
type ComparisonDictionary = {
  [key in CollectionKey]: ComparisonSet[];
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
// MAIN
////////////////////////////////////////////////////

let maxSimilarity = 0;
let minSimilarity = 1;
let maxWordCount = 0;
let minWordCount = VERY_LARGE_NUMBER;

const colouredCollectionRanges = Object.values(colouredCollections);

// Open all the files in "../source-data" one by one
// and then combine them in memory
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
    // We have to infer the year from the dreamSetName
    const dreamYear: number = fileYearMap[parsedFileData.dreamSetName];
    if (!dreamYear) throw new Error("No year found for file");
    const dreamDate = new Date(`${dreamYear}-${parsedFileData.dreamSetDate}`);
    if (isNaN(dreamDate.getTime())) throw new Error("Invalid date");

    // We need the number of dreams the file is dealing with
    // So we can calculate the number of raw comparisons
    const numDreamsInSet = parsedFileData.dreamSetSize;

    // ComparisonSet is all the comparisons within a given "coloured set" in a granularity
    // At this point, we're making 'day comparisons'
    // i.e. One day of dreams compared to one day of news
    const comparisonSets: ComparisonSet[] = parsedFileData.newsRecords.map(newsRecord => {
      const ret = convertNewsRecordToDayComparisonSet(
        newsRecord,
        dreamDate,
        numDreamsInSet,
        NEWS_YEAR,
        NUM_CONCEPTS_PER_COMPARISON,
        NUM_EXAMPLES_PER_COMPARISON
      );
      return ret;
    });

    // Not pretty, but let's update the max and min similarity/wordcount here
    comparisonSets.forEach(set => {
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
          set.dreamCollection.timePeriod.start,
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
// Also include the label and color
const dayComparisonDictionaries: ColoredSetWithinGranularity[] = Object.entries(data).map(
  ([key, value]) => {
    return {
      label: colouredCollections[key as CollectionKey].label,
      color: colouredCollections[key as CollectionKey].color,
      comparisons: value,
    };
  }
);

// We have a set of comparisons by day
// We want to turn this into a set of comparisons by week
// and a set of comparisons by month
const weekComparisonsCollection: GranularityComparisonCollection = getBroaderGranularity(
  "week",
  weekIndexFromDate,
  dayComparisonDictionaries,
  NUM_EXAMPLES_PER_COMPARISON
);
const monthComparisonsCollection: GranularityComparisonCollection = getBroaderGranularity(
  "month",
  monthIndexFromDate,
  dayComparisonDictionaries,
  NUM_EXAMPLES_PER_COMPARISON
);

// TODO: We're just removing the control temporarily until it's ready
const weekComparisonsCollectionFiltered = {
  ...weekComparisonsCollection,
  comparisonSets: [weekComparisonsCollection.comparisonSets[0]],
};
const monthComparisonsCollectionFiltered = {
  ...monthComparisonsCollection,
  comparisonSets: [monthComparisonsCollection.comparisonSets[0]],
};

// Write all the week data to file
fs.writeFileSync(
  path.join(__dirname, "../public/data/weekComparisons.json"),
  JSON.stringify(weekComparisonsCollectionFiltered),
  "utf8"
);

// Write all the month data to file
fs.writeFileSync(
  path.join(__dirname, "../public/data/monthComparisons.json"),
  JSON.stringify(monthComparisonsCollectionFiltered),
  "utf8"
);

////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////

// Given a date, return the collection it belongs to
function getColouredCollectionKey(
  date: Date | undefined,
  collections: CollectionFinder[]
): CollectionKey | null {
  if (!date) {
    console.log("No date found");
    // throw new Error(`Invalid date: ${date}`);
  }
  if (!date) date = new Date("2020-01-01");
  const dateTime = date.getTime();
  const found = collections.find(collection => {
    const { from, to } = collection.range;
    return dateTime >= from.getTime() && dateTime <= to.getTime();
  });
  return found ? found.key : null;
}

// Merge two comparison dictionaries
function mergeComparisonDictionaries(
  dict1: ComparisonDictionary,
  dict2: ComparisonDictionary
): ComparisonDictionary {
  const dict12020 = dict1.dreams2020 || [];
  const dict1ControlSet = dict1.controlSet || [];
  const dict22020 = dict2.dreams2020 || [];
  const dict2ControlSet = dict2.controlSet || [];

  return {
    dreams2020: [...dict12020, ...dict22020],
    controlSet: [...dict1ControlSet, ...dict2ControlSet],
  };
}

export {};
