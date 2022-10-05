import {
  ComparisonSet,
  DifferenceDisplayRecordWithExamples,
  ExamplesWithSimilarityLevel,
  GranularityComparisonCollection,
  SingleTextRecord,
  SingleTextRecordDictionary,
} from "@kannydennedy/dreams-2020-types";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Read CSV file and convert to JSON
// (source-dreams-news/all-dreams-final.csv)

type NewsCsvRow = {
  NewsId: string;
  Title: string;
  Date: string;
  Summary: string;
  Categories: string;
  Headline: string;
  "Extended Headline": string;
  Text: string;
};

const NEWS_MAX_LEN = 1000;

const NEWS_FILE_PATH = "../source-dreams-news/all-news-final.csv";
const newsFile = path.join(__dirname, NEWS_FILE_PATH);

const NEWS_JSON_PATH = "../public/data/all-news-final.json";
const newsJsonPath = path.join(__dirname, NEWS_JSON_PATH);

/////////////////////////////////////////////////
// Get the news ids that are actually being used
/////////////////////////////////////////////////

// We also need to parse the data JSON files
// Because there are too many news items, we only want those that are actually getting used!

// BAR DATA
const BAR_DATA_FILE = "../public/data/bar-data.json";
const barJsonPath = path.join(__dirname, BAR_DATA_FILE);
// Read JSON file into memory
const barData: DifferenceDisplayRecordWithExamples = JSON.parse(
  fs.readFileSync(barJsonPath, "utf8")
);
const barExamples = barData.comparisons.differences.map(d => d.examples);
const barNewsIds = barExamples.reduce((acc, examples) => {
  return [...acc, examples.high.newsId, examples.low.newsId, examples.medium.newsId];
}, [] as string[]);
// Make sure they're unique
const barNewsIdsUnique = uniqueStringArr(barNewsIds);

// BUBBLE DATA
const BUBBLE_DATA_FILE_MONTH = "../public/data/monthComparisons.json";
const bubbleJsonPathMonth = path.join(__dirname, BUBBLE_DATA_FILE_MONTH);
const blankSimilarityExample: ExamplesWithSimilarityLevel = {
  high: { dreamId: "", newsId: "", score: 0, concepts: [] },
  medium: { dreamId: "", newsId: "", score: 0, concepts: [] },
  low: { dreamId: "", newsId: "", score: 0, concepts: [] },
};
// Read JSON file into memory
const bubbleDataMonth: GranularityComparisonCollection = JSON.parse(
  fs.readFileSync(bubbleJsonPathMonth, "utf8")
);
const allComparisons: ComparisonSet[] = bubbleDataMonth.comparisonSets
  .map(c => c.comparisons)
  .flat();
const allExampleSets: ExamplesWithSimilarityLevel[] = allComparisons.map(
  c => c.similarityExamples || blankSimilarityExample
);
const monthNewsIds = allExampleSets.reduce((acc, examples) => {
  return [...acc, examples.high.newsId, examples.low.newsId, examples.medium.newsId];
}, [] as string[]);
// Make sure they're unique
const monthNewsIdsUnique = uniqueStringArr(monthNewsIds);

// Combine the two
const allNewsIds = uniqueStringArr([...barNewsIdsUnique, ...monthNewsIdsUnique]);

/////////////////////////////////////////////////
// Main
/////////////////////////////////////////////////

const results: NewsCsvRow[] = [];

fs.createReadStream(newsFile)
  .pipe(csv())
  .on("data", (data: NewsCsvRow) => results.push(data))
  .on("end", () => {
    // console.log(results.slice(0, 5));
    console.log("Parsed CSV file");

    // Turn into an array of SingleTextRecord
    const newsItems: SingleTextRecord[] = results.map(newsItem => {
      const isLongDream = newsItem.Summary.length > NEWS_MAX_LEN;
      const clippedDream = isLongDream
        ? newsItem.Summary.slice(0, NEWS_MAX_LEN) + " (...)"
        : newsItem.Summary;

      return {
        id: newsItem.NewsId,
        text: clippedDream,
        date: new Date(newsItem.Date),
      };
    });

    // Now, we only want the news items that are actually being used
    // So we filter out the ones that aren't
    const newsItemsFiltered = newsItems.filter(newsItem => {
      return allNewsIds.includes(newsItem.id);
    });

    // Key by id
    const newsItemsById: SingleTextRecordDictionary = newsItemsFiltered.reduce(
      (acc, dream) => {
        return {
          ...acc,
          [dream.id]: dream,
        };
      },
      {} as SingleTextRecordDictionary
    );

    // Write JSON file

    fs.writeFileSync(newsJsonPath, JSON.stringify(newsItemsById, null, 2));
  });

/////////////////////////////////
// Helpers
/////////////////////////////////

function onlyUnique(value: string, index: number, self: string[]) {
  return self.indexOf(value) === index;
}

function uniqueStringArr(arr: string[]): string[] {
  return arr.filter(onlyUnique);
}
