import {
  ExampleRecordComparison,
  WikipediaConcept,
} from "@kannydennedy/dreams-2020-types";
import {
  consolidateWikipediaConceptList,
  consolidateExampleList,
} from "../../scripts/modules/mergers";

const inputList: WikipediaConcept[] = [
  {
    title: "John F. Kennedy",
    score: 3,
  },
  {
    title: "Donald Trump",
    score: 3,
  },
  {
    title: "Al Gore",
    score: 5,
  },
  {
    title: "John F. Kennedy",
    score: 4,
  },
  {
    title: "Donald Trump",
    score: 3,
  },
];

const expectedList: WikipediaConcept[] = [
  {
    title: "John F. Kennedy",
    score: 7,
  },
  {
    title: "Donald Trump",
    score: 6,
  },
];

test("consolidateWikipediaConceptList", () => {
  const result = consolidateWikipediaConceptList(inputList, 2);
  expect(result).toEqual(expectedList);
});

const inputExampleList: ExampleRecordComparison[] = [
  {
    dreamId: "I dreamt of a mouse.",
    newsId: "A mouse caught COVID-19.",
    score: 0.7,
    concepts: [],
  },
  {
    dreamId: "I dreamt of a dog.",
    newsId: "A dog caught COVID-19.",
    score: 0.5,
    concepts: [],
  },
  {
    dreamId: "I dreamt of a beaver.",
    newsId: "A beaver caught COVID-19.",
    score: 0.8,
    concepts: [],
  },
  {
    dreamId: "I dreamt of a cat.",
    newsId: "A cat caught polio.",
    score: 0.6,
    concepts: [],
  },
];

const expectedExampleList: ExampleRecordComparison[] = [
  {
    dreamId: "I dreamt of a beaver.",
    newsId: "A beaver caught COVID-19.",
    score: 0.8,
    concepts: [],
  },
  {
    dreamId: "I dreamt of a mouse.",
    newsId: "A mouse caught COVID-19.",
    score: 0.7,
    concepts: [],
  },
];

test("consolidateExampleList", () => {
  const result = consolidateExampleList(inputExampleList, 2);
  expect(result).toEqual(expectedExampleList);
});
