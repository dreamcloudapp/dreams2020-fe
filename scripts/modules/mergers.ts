import {
  WikipediaConcept,
  ExampleRecordComparison,
  ExampleDreamNewsComparison,
} from "@kannydennedy/dreams-2020-types";
import { ExamplesWithSimilarityLevel } from "../generateBarData";

// Take a big list of wikipedia concepts and consolidate them into a smaller list
// First consolidate and sum the concepts with the same title
// Then sort the consolidated list by score
// Then return the top n concepts
export const consolidateWikipediaConceptList = (
  bigList: WikipediaConcept[],
  desiredLength: number
): WikipediaConcept[] => {
  // For the sake of interest, we're going to try removing lists
  const filteredList = bigList.filter(x => {
    const title = x.title.toLowerCase();
    const isListArticle = title.includes("list ") || title.includes("glossary ");
    return !isListArticle;
  });

  // We need to consolidate the list of concepts
  // So there are no duplicates
  const consolidatedConceptsDict = filteredList.reduce((acc, concept) => {
    // If the concept title includes the word "list", we ignore it
    // if (concept.title.toLowerCase().includes("list")) {
    //   return acc;
    // }

    if (acc[`${concept.title}`]) {
      return {
        ...acc,
        [`concept.title`]: {
          ...acc[`${concept.title}`],
          score: acc[`${concept.title}`].score + concept.score,
        },
      };
    } else {
      return {
        ...acc,
        [`${concept.title}`]: concept,
      };
    }
  }, {} as { [key: string]: WikipediaConcept });

  const consolidatedConceptsArr = Object.values(consolidatedConceptsDict);

  // Order list items by score
  // So we get the most relevant items first
  const sortedList = consolidatedConceptsArr.sort((a, b) => b.score - a.score);
  return sortedList.slice(0, desiredLength);
};

export const consolidateExampleList = (
  bigList: ExampleRecordComparison[],
  desiredLength: number
): ExampleRecordComparison[] => {
  // Order list items by score
  // So we get the most relevant items first
  const sortedList = bigList.sort((a, b) => b.score - a.score);
  return sortedList.slice(0, desiredLength);
};

export const consolidateDreamNewsComparisonExampleList = (
  bigList: ExampleDreamNewsComparison[]
): ExamplesWithSimilarityLevel => {
  // We can't show things when there's no concepts in common
  const listWithRealThings = bigList.filter(example => example.topConcepts.length > 0);
  // Order list items by score
  // So we get the most relevant items first

  const sortedList = listWithRealThings.sort((a, b) => b.score - a.score);
  const high = sortedList[0];
  const low = sortedList[sortedList.length - 1];
  const medium = sortedList[Math.floor(sortedList.length / 2)];

  return {
    high,
    low,
    medium,
  };
};
