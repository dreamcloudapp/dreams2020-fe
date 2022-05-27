import {
  WikipediaConcept,
  ExampleRecordComparison,
} from "@kannydennedy/dreams-2020-types";

const FAKE_WIKI_CONCEPTS: WikipediaConcept[] = [
  {
    title: "COVID-19",
    link: "https://en.wikipedia.org/wiki/COVID-19",
    score: 0.5,
  },
  {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
    score: 0.6,
  },
  {
    title: "USA",
    link: "https://en.wikipedia.org/wiki/USA",
    score: 0.7,
  },
  {
    title: "Joe Biden",
    link: "https://en.wikipedia.org/wiki/Joe_Biden",
    score: 0.8,
  },
  {
    title: "Al Gore",
    link: "https://en.wikipedia.org/wiki/Al_Gore",
    score: 0.9,
  },
];

const FAKE_WIKI_CONCEPTS_2: WikipediaConcept[] = [
  {
    title: "Dog",
    link: "https://en.wikipedia.org/wiki/Dog",
    score: 0.7,
  },
  {
    title: "Cat",
    link: "https://en.wikipedia.org/wiki/Cat",
    score: 0.8,
  },
  {
    title: "Park",
    link: "https://en.wikipedia.org/wiki/Park",
    score: 0.4,
  },
];

export const FAKE_EXAMPLE_COMPARISONS: ExampleRecordComparison[] = [
  {
    dreamText: "I dreamt about a dog.",
    newsText: "A news article about a dog.",
    score: 0.6,
    concepts: FAKE_WIKI_CONCEPTS_2,
  },
];

// Months of the year
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Short months of the year
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LAST_WEEK_OF_YEAR_INDEX = 51;

// 100 word dummy text
const LOREM =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ";

export { FAKE_WIKI_CONCEPTS, MONTHS, LAST_WEEK_OF_YEAR_INDEX, LOREM, SHORT_MONTHS };
