import {
  ComparisonSet,
  CollectionParams,
  GranularityComparisonCollection,
  WikipediaConcept,
  ExampleRecordComparison,
  SheldonConcept,
  SheldonExample,
  SheldonRecord,
} from "@kannydennedy/dreams-2020-types";

// Function to capitalise the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
  sheldonExample: SheldonExample
): ExampleRecordComparison => {
  return {
    dreamText: sheldonExample.doc1Id, // TODO
    newsText: sheldonExample.doc2Id, // TODO
    score: sheldonExample.score,
    concepts: sheldonExample.topConcepts.map(sheldonConceptToWikipediaConcept),
  };
};

// Convert a SheldonRecord to a ComparisonSet
const convertSheldonRecordToComparisonSet = (record: SheldonRecord): ComparisonSet => {
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
      index: 1, // Gammin
      identifier: record.set1Date + " - " + record.set1Name,
      start: set1Date,
      end: set1Date,
    },
  };
  const collection2: CollectionParams = {
    label: "News",
    timePeriod: {
      granularity: "day",
      index: 1, // Gammin
      identifier: record.set2Date + " - " + record.set2Name,
      start: set2Date,
      end: set2Date,
    },
  };
  const concepts = record.topConcepts.map(sheldonConceptToWikipediaConcept);
  const examples = record.examples.map(sheldonExampleToExampleRecordComparison);

  return {
    id: record.set1Date + " - " + record.set2Date,
    granularity: "day",
    label: record.set1Date + " - " + record.set2Date,
    collection1: collection1,
    collection2: collection2,
    concepts: concepts,
    examples: examples,
    score: record.similarity,
    wordCount: record.wordCount,
  };
};

module.exports = { convertSheldonRecordToComparisonSet };
