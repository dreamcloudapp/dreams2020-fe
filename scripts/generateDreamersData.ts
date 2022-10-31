const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
import {
  ColoredSetWithinGranularity,
  ComparisonSet,
  DayRecord,
  ExampleDreamNewsComparison,
  GranularityComparisonCollection,
  NewsRecord,
  SimilarityLevel,
  SingleTextRecord,
} from "@kannydennedy/dreams-2020-types";
import { DREAMERS_SRC_FOLDER, SIMILARITY_CUTOFFS, palette } from "./config";
import { isEmptyFile } from "./modules/file-helpers";
import { linkToTitle, truncateString, wordCount } from "./modules/string-helpers";
const { dayIndexFromDate } = require("./modules/time-helpers");
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
  "2020 Reference": string;
  "Real Date": string;
};
type DreamerCsvRowWithRealId = DreamerCsvRow & {
  realId: string;
};

// Read the all-dreams-final.json file to get the real ids
const DREAMS_JSON_PATH = "../public/data/all-dreams-final.json";
const dreamsJsonPath = path.join(__dirname, DREAMS_JSON_PATH);
const allDreams: { [key: string]: SingleTextRecord } = require(dreamsJsonPath);

// Read the all-news-final.json file
const NEWS_JSON_PATH = "../public/data/all-news-final.json";
const newsJsonPath = path.join(__dirname, NEWS_JSON_PATH);
const allNews: { [key: string]: SingleTextRecord } = require(newsJsonPath);

const results: DreamerCsvRowWithRealId[] = [];
let fakeIdToRealId: { [key: string]: string } = {};

fs.createReadStream(dreamsFile)
  .pipe(csv())
  .on("data", (data: DreamerCsvRow) => {
    const realId = findRealId(data.Dream, allDreams);
    fakeIdToRealId[data.ID] = realId;

    const truncatedData = {
      ...data,
      realId: realId,
      Dream: truncateString(data.Dream, DREAM_MAX_LEN),
    };
    // For now, we're only interested in 2020 dreams.
    // We can deal with the rest later
    if (realId) {
      results.push(truncatedData);
    }
  })
  .on("end", () => {
    console.log("Parsed CSV file");

    /////////////////////////////////////////////////
    // Read JSON files and create 'comparison sets'
    /////////////////////////////////////////////////

    console.log("Generating dreamers data...");

    // Open all the files in source data one by one
    const files = fs.readdirSync(path.join(__dirname, DREAMERS_SRC_FOLDER));

    // Get all the files that have to do with 2020
    const dreamersDataArray: NewsRecordWithDates[] = files
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
      .flat()
      // Some of these are empty, filter them out
      .filter((record: NewsRecordWithDates) => record.topConcepts[0] !== null);

    // Now we just want to get the good examples out of these
    // Andy only the first 5 concepts
    const goodExamples: ExampleDreamNewsComparison[] = dreamersDataArray
      .map(x => x.examples)
      .flat()
      // Keep some semblance of similarity
      .filter(x => x.score >= SIMILARITY_CUTOFFS.low)
      // We only want things already in our news file for now
      // TODO, but we're cutting down on space which is good
      // const existsInNews = allNews[curr.doc2Id];
      .filter(x => allNews[x.doc2Id])
      .map(x => {
        return {
          ...x,
          topConcepts: x.topConcepts.slice(0, 5),
        };
      });

    // Now, we only want the highest scoring examples for each dream
    // We create a map of dreamId -> example
    const dreamIdToExampleMap: { [key: string]: ExampleDreamNewsComparison } =
      goodExamples.reduce((acc, curr) => {
        if (acc[curr.doc1Id]) {
          if (acc[curr.doc1Id].score < curr.score) {
            return { ...acc, [curr.doc1Id]: curr };
          } else {
            return acc;
          }
        } else {
          return { ...acc, [curr.doc1Id]: curr };
        }
      }, {} as { [key: string]: ExampleDreamNewsComparison });

    const bestExamples: ExampleDreamNewsComparison[] = Object.values(dreamIdToExampleMap);

    // NOW, we need to group the bestExamples by dreamer
    // We need to create a map of dreamerAlias -> example
    const dreamerAliasToExampleMap: { [key: string]: ExampleDreamNewsComparison[] } =
      bestExamples.reduce((acc, curr) => {
        // Get the dreamer alias
        const dreamerAlias = results.find(x => x.ID === curr.doc1Id)?.["Dreamer alias"];

        // If we don't have an alias, we can't do anything
        // This happens when a dream has been filtered out
        // Because it's outside the date range
        if (!dreamerAlias) {
          console.log("No dreamer alias found for", curr.doc1Id);
          return acc;
        }

        if (dreamerAlias) {
          if (acc[dreamerAlias]) {
            acc[dreamerAlias].push(curr);
          } else {
            acc[dreamerAlias] = [curr];
          }
        }
        return acc;
      }, {} as { [key: string]: ExampleDreamNewsComparison[] });

    // Now, we want to turn all these examples into ColoredSetWithinGranularity objects
    // Grouped by dreamer, as above

    const coloredSetsWithinGranularity: ColoredSetWithinGranularity[] = Object.entries(
      dreamerAliasToExampleMap
    ).map(([dreamerAlias, examples], i) => {
      // We turn all the examples into ComparisonSet objects
      const comparisonSets: ComparisonSet[] = examples.map((example, i) => {
        // We need to get the dream date and news date for the example
        const realDreamId = fakeIdToRealId[example.doc1Id];
        const dreamRecord = allDreams[realDreamId];
        if (!dreamRecord) {
          console.log(
            `No dream record found for fakeId: "${example.doc1Id}", realId "${realDreamId}"`
          );
        }
        const dreamDate = new Date(dreamRecord.date);
        const dreamDateIndex = dayIndexFromDate(dreamDate);

        const newsRecord = allNews[example.doc2Id] || {
          date: new Date("2020-12-31"),
          id: example.doc2Id,
          text: "No text found",
        };
        if (!allNews[example.doc2Id]) {
          console.log(`No news record found for "${example.doc2Id}"`);
        }
        const newsDate = new Date(newsRecord.date);
        const newsDateIndex = dayIndexFromDate(newsDate);

        const originalRow = findResultByRealId(realDreamId, results);

        const reference2020 = originalRow ? originalRow["2020 Reference"] : "Not defined";

        const totalWordCount = wordCount(dreamRecord.text + newsRecord.text);

        const similarityKey: SimilarityLevel = getSimilarityLevel(example.score);

        const comp: ComparisonSet = {
          id: `newsy-dream-${i}`,
          granularity: "day",
          label: dreamerAlias + " example dream", // TODO
          score: example.score,
          dreamerAlias: dreamerAlias,
          reference2020: reference2020,
          examples: [],
          concepts: [],
          similarityExamples: {
            [similarityKey]: {
              score: example.score,
              dreamId: fakeIdToRealId[example.doc1Id],
              newsId: example.doc2Id,
              concepts: example.topConcepts.map(x => ({
                title: linkToTitle(x.concept),
                score: x.score,
              })),
            },
          },
          // Bla these are used in a strange way
          // We just need something to set the bubble size with here
          // Since there's only one 'comparison' in each bubble
          wordCount: totalWordCount,
          numComparisons: totalWordCount,
          numDayComparisons: totalWordCount,
          dreamCollection: {
            label: "",
            timePeriod: {
              granularity: "day",
              identifier: "",
              index: dreamDateIndex,
            },
          },
          newsCollection: {
            label: "",
            timePeriod: {
              granularity: "day",
              identifier: "",
              index: newsDateIndex,
            },
          },
        };
        return comp;
      });

      const coloredSet: ColoredSetWithinGranularity = {
        label: dreamerAlias,
        color: palette[i],
        comparisons: comparisonSets,
      };

      return coloredSet;
    }, [] as ColoredSetWithinGranularity[]);

    // NOW, we want to put the coloredSets into a GranularityComparisonCollection
    const granularityComparisonCollection: GranularityComparisonCollection = {
      granularity: "day",
      maxSimilarity: 0.7, // We're just going to hardcode this for now
      minSimilarity: 0.1, // We're just going to hardcode this for now
      maxWordCount: 0,
      minWordCount: 0,
      comparisonSets: coloredSetsWithinGranularity,
    };

    //   Write the data to a file
    const outputFile = path.join(__dirname, "../public/data/newsy-dreamers.json");
    fs.writeFileSync(
      outputFile,
      JSON.stringify(granularityComparisonCollection, null, 2)
    );
    console.log(`Month column data written to ${outputFile}`);
  });

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

// Find a result by realId
function findResultByRealId(
  realId: string,
  results: DreamerCsvRowWithRealId[]
): DreamerCsvRowWithRealId | undefined {
  const found = results.find(result => result.realId === realId);
  return found;
}

// Get similarity level from score
// const SIMILARITY_CUTOFFS = {
//   high: 0.175,
//   medium: 0.07,
//   low: 0.05,
//   indiscernible: 0,
// };
function getSimilarityLevel(score: number): SimilarityLevel {
  if (score >= 0.175) {
    return "high";
  } else if (score >= 0.07) {
    return "medium";
  } else if (score >= 0.05) {
    return "low";
  } else {
    return "indiscernible";
  }
}

export {};
