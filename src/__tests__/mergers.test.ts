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
    link: "https://en.wikipedia.org/wiki/John_F._Kennedy",
    score: 3,
  },
  {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
    score: 3,
  },
  {
    title: "Al Gore",
    link: "https://en.wikipedia.org/wiki/Al_Gore",
    score: 5,
  },
  {
    title: "John F. Kennedy",
    link: "https://en.wikipedia.org/wiki/John_F._Kennedy",
    score: 4,
  },
  {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
    score: 3,
  },
];

const expectedList: WikipediaConcept[] = [
  {
    title: "John F. Kennedy",
    link: "https://en.wikipedia.org/wiki/John_F._Kennedy",
    score: 7,
  },
  {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
    score: 6,
  },
];

test("consolidateWikipediaConceptList", () => {
  const result = consolidateWikipediaConceptList(inputList, 2);
  expect(result).toEqual(expectedList);
});

const inputExampleList: ExampleRecordComparison[] = [
  {
    dreamText: "I dreamt of a mouse.",
    newsText: "A mouse caught COVID-19.",
    score: 0.7,
    concepts: [],
  },
  {
    dreamText: "I dreamt of a dog.",
    newsText: "A dog caught COVID-19.",
    score: 0.5,
    concepts: [],
  },
  {
    dreamText: "I dreamt of a beaver.",
    newsText: "A beaver caught COVID-19.",
    score: 0.8,
    concepts: [],
  },
  {
    dreamText: "I dreamt of a cat.",
    newsText: "A cat caught polio.",
    score: 0.6,
    concepts: [],
  },
];

const expectedExampleList: ExampleRecordComparison[] = [
  {
    dreamText: "I dreamt of a beaver.",
    newsText: "A beaver caught COVID-19.",
    score: 0.8,
    concepts: [],
  },
  {
    dreamText: "I dreamt of a mouse.",
    newsText: "A mouse caught COVID-19.",
    score: 0.7,
    concepts: [],
  },
];

test("consolidateExampleList", () => {
  const result = consolidateExampleList(inputExampleList, 2);
  expect(result).toEqual(expectedExampleList);
});
