import {
  WikipediaConcept,
  ExampleRecordComparison,
} from "@kannydennedy/dreams-2020-types";

export const consolidateWikipediaConceptList = (
  bigList: WikipediaConcept[]
): WikipediaConcept[] => {
  // We need to consolidate the list of concepts
  // So there are no duplicates
  const consolidatedConceptsDict = bigList.reduce((acc, concept) => {
    // If the concept title includes the word "list", we ignore it
    if (concept.title.toLowerCase().includes("list")) {
      return acc;
    }

    if (acc[concept.link]) {
      return {
        ...acc,
        [concept.link]: {
          ...acc[concept.link],
          score: acc[concept.link].score + concept.score,
        },
      };
    } else {
      return {
        ...acc,
        [concept.link]: concept,
      };
    }
  }, {} as { [key: string]: WikipediaConcept });

  const consolidatedConceptsArr = Object.values(consolidatedConceptsDict);

  // Order list items by score
  // So we get the most relevant items first
  const sortedList = consolidatedConceptsArr.sort((a, b) => b.score - a.score);
  return sortedList.slice(0, 5);
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
