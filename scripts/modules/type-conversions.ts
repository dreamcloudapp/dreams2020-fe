import {
  ComparisonSet,
  CollectionParams,
  WikipediaConcept,
  ExampleRecordComparison,
  SheldonConcept,
  SheldonExample,
  SheldonRecord,
} from "@kannydennedy/dreams-2020-types";
const { dayIndexFromDate } = require("./time-helpers");

// Function to capitalise the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Print dates like "Jan 1 2020"
const prettyPrintDate = (date: Date): string => {
  const month = capitalizeFirstLetter(date.toLocaleString("en-us", { month: "long" }));
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
};

// Convert a SheldonConcept to a WikipediaConcept
function sheldonConceptToWikipediaConcept(
  sheldonConcept: SheldonConcept
): WikipediaConcept {
  const title = capitalizeFirstLetter(sheldonConcept.concept);
  return {
    title: title,
    link: `https://en.wikipedia.org/wiki/${title.replace(/\s/g, "_")}`,
    score: sheldonConcept.score,
  };
}

// Convert Sheldon Example to ExampleRecordComparison
const sheldonExampleToExampleRecordComparison = (
  sheldonExample: SheldonExample,
  numConceptsPerComparison: number
): ExampleRecordComparison => {
  return {
    dreamText: sheldonExample.doc1Id, // TODO
    newsText: sheldonExample.doc2Id, // TODO
    score: sheldonExample.score,
    concepts: sheldonExample.topConcepts
      .slice(0, numConceptsPerComparison)
      .map(sheldonConceptToWikipediaConcept),
  };
};

// Convert a SheldonRecord to a ComparisonSet
export const convertSheldonRecordToComparisonSet = (
  record: SheldonRecord,
  numConceptsPerComparison: number,
  numExamplesPerComparison: number
): ComparisonSet => {
  // Get dates of set1 and set2
  const set1Date = new Date(record.set1Date);
  const set2Date = new Date(record.set2Date);

  // Make collection1 and collection2
  // from set1 and set2
  // Assuming that 'set1' is dreams, and set2 is news
  const collection1: CollectionParams = {
    label: "Dreams",
    timePeriod: {
      granularity: "day",
      index: dayIndexFromDate(set1Date),
      identifier: record.set1Date + " - " + record.set1Name,
      start: set1Date,
      end: set1Date,
    },
  };
  const collection2: CollectionParams = {
    label: "News",
    timePeriod: {
      granularity: "day",
      index: dayIndexFromDate(set2Date),
      identifier: record.set2Date + " - " + record.set2Name,
      start: set2Date,
      end: set2Date,
    },
  };

  const label = `Dreams from ${prettyPrintDate(set1Date)} vs. news from ${prettyPrintDate(
    set2Date
  )}`;

  const concepts = record.topConcepts
    .slice(0, numConceptsPerComparison)
    .map(sheldonConceptToWikipediaConcept);
  const examples = record.examples
    .slice(0, numExamplesPerComparison)
    .map(e => sheldonExampleToExampleRecordComparison(e, numConceptsPerComparison));

  return {
    id: record.set1Date + "_" + record.set2Date,
    granularity: "day",
    label: label,
    collection1: collection1,
    collection2: collection2,
    concepts: concepts,
    examples: examples,
    score: record.similarity,
    wordCount: record.wordCount,
  };
};