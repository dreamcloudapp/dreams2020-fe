const fs = require("fs");

/////////////// TYPES ///////////////

type Granularity = "day" | "week" | "month" | "year";
type TimePeriod = {
  granularity: Granularity;
  index: number; // e.g. 0 for January, 1 for February, 1 for the first of the month, etc.
};

type WikipediaConcept = {
  title: string;
  link: string;
};

// Dream Record or News Record
type ItemRecord = {
  id: number;
  text: String;
  date: Date;
};

// Set of records keyed by id
type RecordDictionary = {
  [key: number]: ItemRecord;
};

type DateTimeRange = {
  from: Date;
  to: Date;
};

type RecordComparison = {
  score: number;
  dreamId: number;
  newsId: number;
  concepts: WikipediaConcept[];
};

type CollectionParams = {
  label: string;
  timePeriod: TimePeriod;
};

type ComparisonSet = {
  id: number;
  granularity: Granularity;
  collection1: CollectionParams;
  collection2: CollectionParams;
  similarity: number;
  examples: RecordComparison[];
  concepts: WikipediaConcept[];
};

/////////////// CONSTANTS ///////////////

// 100 word dummy text
const LOREM =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ";

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

const dummyWikipediaConcepts = [
  {
    title: "COVID-19",
    link: "https://en.wikipedia.org/wiki/COVID-19",
  },
  {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
  },
  {
    title: "Dog",
    link: "https://en.wikipedia.org/wiki/Dog",
  },
  {
    title: "Cat",
    link: "https://en.wikipedia.org/wiki/Cat",
  },
  {
    title: "Al Gore",
    link: "https://en.wikipedia.org/wiki/Al_Gore",
  },
];

/////////////// HELPER FUNCS ////////////////

const createDummyText = (wordLength: number): string => {
  return LOREM.split(" ").slice(0, wordLength).join(" ");
};

// Generate a set of fake records
// Either dreams or news

/*
 * Generate a dictionary of records
 * @param {number} numRecords - number of records to generate
 * @param {DateTimeRange} dateRange - range of dates to generate records in
 */
const generateRecordDictionary = (numRecords: number, dateRange: DateTimeRange) => {
  // We want to space records evenly within the date range
  const dateSpacing = (dateRange.to.getTime() - dateRange.from.getTime()) / numRecords;

  const records: RecordDictionary = {};

  for (let i = 0; i < numRecords; i++) {
    const date = new Date(dateRange.from.getTime() + dateSpacing * i);

    const length = Math.ceil(Math.random() * 100);
    records[i] = {
      id: i,
      text: createDummyText(length),
      date: date,
    };
  }
  return records;
};

// Generate fake comparisons for a given time period
const generateMonthComparisons = (
  collection1Label: string,
  collection2Label: string,
  granularity: Granularity
): ComparisonSet[] => {
  const comparisons: ComparisonSet[] = [];

  for (let i = 0; i < MONTHS.length; i++) {
    const month = MONTHS[i];
    const id = i;
    const collection1 = {
      label: `${month} Dreams`,
      timePeriod: {
        granularity: "month" as Granularity,
        index: i,
      },
    };
    const collection2 = {
      label: `${month} News`,
      timePeriod: {
        granularity: "month" as Granularity,
        index: i,
      },
    };
    const similarity = Math.random();
    const examples: RecordComparison[] = [];
    const concepts: WikipediaConcept[] = dummyWikipediaConcepts;
    const granularity = "month";

    comparisons.push({
      id,
      granularity,
      collection1,
      collection2,
      similarity,
      examples,
      concepts,
    });
  }
  return comparisons;
};

/////////////// MAIN ///////////////

const generateData = async () => {
  // Generate record dictionaries

  const dateRange2020: DateTimeRange = {
    from: new Date(2020, 0, 1),
    to: new Date(2020, 11, 31),
  };
  const dateRange2005_2015: DateTimeRange = {
    from: new Date(2005, 0, 1),
    to: new Date(2015, 11, 31),
  };

  const dream2020Records = generateRecordDictionary(2000, dateRange2020);
  const dream2005_2015Records = generateRecordDictionary(2000, dateRange2005_2015);
  const newsRecords = generateRecordDictionary(2000, dateRange2020);

  // First, generate a set of fake month-by-month comparisons

  const monthComparisons: ComparisonSet[] = generateMonthComparisons();

  //   let x: ComparisonSet[] = [];

  //   for (let i = 0; i < 3000; i++) {
  //     const c: ComparisonSet = {
  //       id: i,
  //       label: "",
  //       dreamDates: { from: new Date(), to: new Date() },
  //       newsDates: { from: new Date(), to: new Date() },
  //       similarity: 2,
  //       examples: [],
  //       concepts: [],
  //     };
  //     x.push(c);
  //   }

  return {
    dreamsTest: dream2020Records,
    dreamsControl: dream2005_2015Records,
    news: newsRecords,
    comparisons: comparisons,
  };
};

generateData().then(data => {
  const { dreamsTest, dreamsControl, news, comparisons } = data;
  fs.writeFileSync("data/dreams-test.json", JSON.stringify(dreamsTest));
  fs.writeFileSync("data/dreams-control.json", JSON.stringify(dreamsControl));
  fs.writeFileSync("data/news.json", JSON.stringify(news));
  fs.writeFileSync("data/comparisons.json", JSON.stringify(comparisons));
});

export {};
