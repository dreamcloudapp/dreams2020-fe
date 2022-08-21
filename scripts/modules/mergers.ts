import {
  WikipediaConcept,
  ExampleRecordComparison,
} from "@kannydennedy/dreams-2020-types";

// Take a big list of wikipedia concepts and consolidate them into a smaller list
// First consolidate and sum the concepts with the same title
// Then sort the consolidated list by score
// Then return the top n concepts
export const consolidateWikipediaConceptList = (
  bigList: WikipediaConcept[],
  desiredLength: number
): WikipediaConcept[] => {
  // We need to consolidate the list of concepts
  // So there are no duplicates
  const consolidatedConceptsDict = bigList.reduce((acc, concept) => {
    // If the concept title includes the word "list", we ignore it
    // if (concept.title.toLowerCase().includes("list")) {
    //   return acc;
    // }

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
