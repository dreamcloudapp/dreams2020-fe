import {
  WikipediaConcept,
  ExampleRecordComparison,
  ExampleDreamNewsComparison,
  ConceptScore,
} from "@kannydennedy/dreams-2020-types";
import { flatGroup } from "d3";
import { ExamplesWithSimilarityLevel } from "../generateBarData";
import { linkToTitle } from "../modules/string-helpers";

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

// This is a different way of getting the top concepts
// Rather than just consolidating all the concepts,
// We base it on examples
// This allows us to get the top of the relevant things
// Need to test this function
export const exampleListToTopConceptList = (
  exampleList: ExampleDreamNewsComparison[]
): WikipediaConcept[] => {
  // First, we order the examples
  const sortedList = exampleList.sort((a, b) => b.score - a.score);
  // Then we take the top 1/3, say
  const topThird = sortedList.slice(0, Math.floor(sortedList.length / 3));
  // Then, we get the concepts from each
  const topThirdConcepts = topThird.map(ex => ex.topConcepts).flat();
  // Then turn into a 'wikipedia' list
  const wikiTopConcepts: WikipediaConcept[] = topThirdConcepts.map(ex => ({
    // title: linkToTitle(ex.concept),
    title: ex.concept,
    score: ex.score,
  }));
  // Then we get the top ones
  const wikiList = consolidateWikipediaConceptList(wikiTopConcepts, 5);

  // Prettify and return
  return wikiList.map(example => ({
    score: example.score,
    title: linkToTitle(example.title),
  }));
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

const cleanExampleList = (dirtyList: ConceptScore[]): ConceptScore[] => {
  return dirtyList
    .slice(0, 5)
    .map(example => ({ ...example, concept: linkToTitle(example.concept) }));
};

export const consolidateDreamNewsComparisonExampleList = (
  bigList: ExampleDreamNewsComparison[]
): ExamplesWithSimilarityLevel => {
  // We can't show things when there's no concepts in common
  const listWithRealThings = bigList.filter(example => example.topConcepts.length > 0);
  // Order list items by score
  // So we get the most relevant items first

  const sortedList = listWithRealThings.sort((a, b) => b.score - a.score);

  // High is the top, low is the bottom, med is the one in the middle
  const highEx = sortedList[0];
  const lowEx = sortedList[sortedList.length - 1];
  const mediumEx = sortedList[Math.floor(sortedList.length / 2)];

  const high = { ...highEx, topConcepts: cleanExampleList(highEx.topConcepts) };
  const low = { ...lowEx, topConcepts: cleanExampleList(lowEx.topConcepts) };
  const medium = { ...mediumEx, topConcepts: cleanExampleList(mediumEx.topConcepts) };

  return {
    high,
    low,
    medium,
  };
};
