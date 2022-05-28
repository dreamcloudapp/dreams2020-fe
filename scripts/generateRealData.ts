const fs = require("fs");
const path = require("path");
import {
  SheldonRecordSet,
  DateTimeRange,
  ComparisonSet,
  GranularityComparisonCollection,
  ColoredSetWithinGranularity,
} from "@kannydennedy/dreams-2020-types";
import { weekIndexFromDate } from "./modules/time-helpers";
import {
  consolidateExampleList,
  consolidateWikipediaConceptList,
} from "./modules/mergers";
const { convertSheldonRecordToComparisonSet } = require("./modules/type-conversions");
const { isDotPath } = require("./modules/file-felpers");

const NUM_CONCEPTS_PER_COMPARISON = 5;
const NUM_EXAMPLES_PER_COMPARISON = 1;
const VERY_LARGE_NUMBER = 999 * 999 * 999;

////////////////////////////////////////////////////
// CONFIGURATION
////////////////////////////////////////////////////

// We need to decide what the 'coloured collections' will be
// We decide this based on date ranges
export type CollectionKey = "jan" | "feb" | "mar";
export type CollectionFinder = {
  key: CollectionKey;
  range: DateTimeRange;
  label: string;
  color: string;
};
export const colouredCollections: { [key in CollectionKey]: CollectionFinder } = {
  jan: {
    key: "jan",
    label: "January News vs February Dreams",
    color: "hsl(10, 90%, 60%)",
    range: { from: new Date("2020-01-01"), to: new Date("2020-01-31") },
  },
  feb: {
    key: "feb",
    label: "February News vs February Dreams",
    color: "hsl(70, 90%, 40%)",
    range: { from: new Date("2020-02-01"), to: new Date("2020-02-29") },
  },
  mar: {
    key: "mar",
    label: "March News vs February Dreams",
    color: "hsl(200, 90%, 60%)",
    range: { from: new Date("2020-03-01"), to: new Date("2020-03-31") },
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
const files = fs.readdirSync(path.join(__dirname, "../source-data"));

let maxSimilarity = 0;
let minSimilarity = 1;
let maxWordCount = 0;
let minWordCount = VERY_LARGE_NUMBER;

const colouredCollectionRanges = Object.values(colouredCollections);

const data: ComparisonDictionary = files.reduce(
  (dataAcc: ComparisonDictionary, file: any) => {
    // Read the file
    const filePath = path.join(__dirname, "../source-data", file);
    const fileData = fs.readFileSync(filePath, "utf8");

    if (isDotPath(filePath)) {
      return dataAcc;
    } else {
      const parsedFileData: SheldonRecordSet = JSON.parse(fileData);
      const comparisonSets: ComparisonSet[] = parsedFileData.records.map(s =>
        convertSheldonRecordToComparisonSet(
          s,
          NUM_CONCEPTS_PER_COMPARISON,
          NUM_EXAMPLES_PER_COMPARISON
        )
      );

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

// Turn the day comparison dictionaries into week comparison dictionaries
let weekMaxSimilarity = 0;
let weekMinSimilarity = 1;
let weekMaxWordCount = 0;
let weekMinWordCount = VERY_LARGE_NUMBER;
const weekComparisonDictionaries: ColoredSetWithinGranularity[] =
  dayComparisonDictionaries.map(dict => {
    // Label and color are the same between day, week and month
    // Just need to change the comparisons
    // We need an object keyed by index-index (dream week index, news week index)
    // We can just concat the top concepts and examples for now,
    // Then deal with ordering and consolidating them later
    const consolidatedDictionary: { [key: string]: ComparisonSet } =
      dict.comparisons.reduce((acc, comparison) => {
        const dreamWeekIndex = weekIndexFromDate(comparison.collection1.timePeriod.start);
        const newsWeekIndex = weekIndexFromDate(comparison.collection2.timePeriod.start);
        const key = `week-${dreamWeekIndex}-${newsWeekIndex}`;

        if (!acc[key]) {
          // If we don't have this key yet, add a new comparison
          const weekComparison: ComparisonSet = {
            id: key,
            granularity: "week",
            label: `Dreams from Week ${
              dreamWeekIndex + 1
            } (collection name) vs. news from week ${newsWeekIndex}`,
            collection1: {
              label: "Dreams",
              timePeriod: {
                granularity: "week",
                index: 0,
                identifier: `Week ${dreamWeekIndex}`,
                start: new Date(), // TODO
                end: new Date(), // TODO
              },
            },
            collection2: {
              label: "News",
              timePeriod: {
                granularity: "week",
                index: 0,
                identifier: `Week ${newsWeekIndex}`,
                start: new Date(), // TODO
                end: new Date(), // TODO
              },
            },
            score: comparison.score,
            wordCount: comparison.wordCount,
            examples: [...comparison.examples],
            concepts: [...comparison.concepts],
          };

          return {
            ...acc,
            [key]: weekComparison,
          };
        } else {
          // We already have a week comparison here, we need to consolidate it
          const compToMerge = acc[key];

          const mergedComp: ComparisonSet = {
            ...compToMerge,
            score: compToMerge.score + comparison.score, // TODO?
            wordCount: compToMerge.wordCount + comparison.wordCount,
            concepts: [...compToMerge.concepts, ...comparison.concepts],
            examples: [...compToMerge.examples, ...comparison.examples],
          };

          return {
            ...acc,
            [key]: mergedComp,
          };
        }
      }, {} as { [key: string]: ComparisonSet });

    // Now we just squash down those pesky long lists
    const longComparisons: ComparisonSet[] = Object.values(consolidatedDictionary);

    const shortenedComparisons = longComparisons.map(comp => {
      // Ugly!
      if (comp.score > weekMaxSimilarity) weekMaxSimilarity = comp.score;
      if (comp.score < weekMinSimilarity) weekMinSimilarity = comp.score;
      if (comp.wordCount > weekMaxWordCount) weekMaxWordCount = comp.wordCount;
      if (comp.wordCount < weekMinWordCount) weekMinWordCount = comp.wordCount;

      return {
        ...comp,
        concepts: consolidateWikipediaConceptList(comp.concepts),
        examples: consolidateExampleList(comp.examples, NUM_EXAMPLES_PER_COMPARISON),
      };
    });

    return {
      label: dict.label,
      color: dict.color,
      comparisons: shortenedComparisons,
    };
  });

// Convert our dictionary to a big fat GranularityComparisonCollection
const dayComparisonsCollection: GranularityComparisonCollection = {
  granularity: "day",
  maxSimilarity: maxSimilarity,
  minSimilarity: minSimilarity,
  maxWordCount: maxWordCount,
  minWordCount: minWordCount,
  comparisonSets: dayComparisonDictionaries,
};

const weekComparisonsCollection: GranularityComparisonCollection = {
  granularity: "week",
  maxSimilarity: weekMaxSimilarity,
  minSimilarity: weekMinSimilarity,
  maxWordCount: weekMaxWordCount,
  minWordCount: weekMinWordCount,
  comparisonSets: weekComparisonDictionaries,
};

// Now write all the day data to a big new file
fs.writeFileSync(
  path.join(__dirname, "../public/data/dayComparisons.json"),
  JSON.stringify(dayComparisonsCollection, null, 2),
  "utf8"
);

// Now write all the week data to a big new file
fs.writeFileSync(
  path.join(__dirname, "../public/data/weekComparisons.json"),
  JSON.stringify(weekComparisonsCollection, null, 2),
  "utf8"
);

export {};