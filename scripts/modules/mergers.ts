import {
  WikipediaConcept,
  ExampleRecordComparison,
} from "@kannydennedy/dreams-2020-types";

export const consolidateWikipediaConceptList = (
  bigList: WikipediaConcept[]
): WikipediaConcept[] => {
  return bigList.slice(0, 5); // TODO
};

export const consolidateExampleList = (
  bigList: ExampleRecordComparison[],
  desiredLength: number
): ExampleRecordComparison[] => {
  return bigList.slice(0, desiredLength); // TODO
};
