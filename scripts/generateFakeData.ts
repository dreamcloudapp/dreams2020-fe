const fs = require("fs");
const {
  FAKE_WIKI_CONCEPTS,
  MONTHS,
  LAST_WEEK_OF_YEAR_INDEX,
  LOREM,
  SHORT_MONTHS,
} = require("./fakeConstants");

/////////////// TYPES ///////////////

type Granularity = "day" | "week" | "month" | "year";

// It's an interesting question how to compare time periods across years
// For months, it's easy -> just compare the month number
// For weeks, we compare the week number, but we have to know that Feb. 29 creates an "8 day week", as does December 31.
// For days, we say that February 28-29 is the same day.
type TimePeriod = {
  granularity: Granularity;
  identifier: string; // something that uniquely identifies the time period. E.g. "March", "Week 40", or "Feb 27"
  index: number; // e.g. 0 for January, 1 for February, 1 for the first of the month, etc.
};

// Determine if a year is a leap year
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// Add a specified number of days to a date
const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Given a granularity, index and year range, return a string representing the time period
// E.g:
// for granularity "month", index 0, yearRange 2020 -> "January 2020"
// for granularity "week", index 1, yearRange 2020 -> "Jan 7 - Jan 14, 2020"
// for granularity "day", index 1, yearRange 2020 -> "January 2, 2020"
function generateTimePeriodLabel(
  granularity: Granularity,
  index: number,
  yearRange: number[]
): string {
  const yearLabel =
    yearRange.length > 1
      ? yearRange[0] + "-" + yearRange[yearRange.length - 1]
      : yearRange[0];
  // If a year range has a leap year, we will treat the whole set as a leap year
  // E.g. "Feb 22 - Feb 29, 2005-15"
  const hasLeapYear = yearRange.some(year => isLeapYear(year));
  const exampleLeapYear = 2020;
  const exampleNonLeapYear = 2019;

  const firstDayOfExampleLeapYear = new Date(exampleLeapYear, 0, 1);
  const firstDayOfExampleNonLeapYear = new Date(exampleNonLeapYear, 0, 1);

  switch (granularity) {
    case "day":
      // In the case of a leap year, we want to treat Feb. 28-29 as a "day"
      if (hasLeapYear && (index === 29 || index === 30)) {
        return `Feb 28-29 ${yearLabel}`;
      } else if (hasLeapYear && index > 30) {
        return `Feb 29 ${yearLabel}`;
      }

      return `${index}`;
    case "week":
      const isLastWeekOfYear = index === LAST_WEEK_OF_YEAR_INDEX;
      let firstDayOfWeek: Date;
      let lastDayOfWeek: Date;
      // If there's no leap year, just naively add 7 days
      if (!hasLeapYear) {
        firstDayOfWeek = addDays(firstDayOfExampleNonLeapYear, index * 7);
        lastDayOfWeek = addDays(firstDayOfWeek, isLastWeekOfYear ? 6 : 7);
      }
      // If there's a leap year, we need to account for Feb 29
      else {
        if (index < 9) {
          firstDayOfWeek = addDays(firstDayOfExampleLeapYear, index * 7);
          lastDayOfWeek = addDays(firstDayOfWeek, 6);
          console.log(firstDayOfWeek, lastDayOfWeek);
        } else if (index === 9) {
          firstDayOfWeek = addDays(firstDayOfExampleLeapYear, index * 7);
          lastDayOfWeek = addDays(firstDayOfWeek, 7);
        } else {
          firstDayOfWeek = addDays(firstDayOfExampleNonLeapYear, index * 7 + 1);
          lastDayOfWeek = addDays(firstDayOfWeek, isLastWeekOfYear ? 6 : 7);
        }
      }

      const firstDayOfWeekMonth = SHORT_MONTHS[firstDayOfWeek.getMonth()];
      const lastDayOfWeekMonth = SHORT_MONTHS[lastDayOfWeek.getMonth()];

      return `${firstDayOfWeek.getDate()} ${firstDayOfWeekMonth}. - ${lastDayOfWeek.getDate()} ${lastDayOfWeekMonth}, ${yearLabel}`;
    case "month":
      return `${MONTHS[index]} ${yearLabel}`; // Just the name of the month, e.g. "January 2005"
    case "year":
      return `${index}`; // This is just the year, e.g. "2005"
    default:
      throw new Error(`Unknown granularity: ${granularity}`);
  }
}

// Get date based on week number
const getDateFromWeekNumber = (year: number, weekNumber: number): Date => {
  const d = new Date(year, 0, 1);
  const dayOfWeek = d.getDay();
  const dayOfYear = (weekNumber - 1) * 7 + 1 - dayOfWeek;
  d.setDate(d.getDate() + dayOfYear);
  return d;
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
  id: string;
  granularity: Granularity; // "day", "week", "month", "year"
  label: string; // E.g. "March 2020 Dreams vs. April 2020 News"
  collection1: CollectionParams;
  collection2: CollectionParams;
  similarity: number;
  examples: RecordComparison[];
  concepts: WikipediaConcept[];
};

/////////////// CONSTANTS ///////////////

const NUM_STOPS_IN_TIME_PERIOD: {
  [key in Granularity]: number;
} = {
  month: 12,
  week: 52,
  day: 365,
  year: 1,
};

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
type CollectionParameters = {
  label: string;
  yearArray: number[];
};
const generateComparisons = (
  collection1Params: CollectionParameters,
  collection2Params: CollectionParameters,
  granularity: Granularity
): ComparisonSet[] => {
  const numIntervalsInPeriod = NUM_STOPS_IN_TIME_PERIOD[granularity];

  const comparisons: ComparisonSet[] = [];

  for (let i = 0; i < numIntervalsInPeriod; i++) {
    for (let j = 0; j < numIntervalsInPeriod; j++) {
      // First create the label for the collection
      // E.g. "March 2020 Dreams vs. April 2020 News"
      // 1) Generate the label for the first collection, e.g. "March 2020 Dreams"
      const timeLabel1 = generateTimePeriodLabel(
        granularity,
        i,
        collection1Params.yearArray
      );
      const collectionLabel1 = `${collection1Params.label} from ${timeLabel1}`;
      // 2) Generate the label for the second collection, e.g. "April 2020 News"
      const timeLabel2 = generateTimePeriodLabel(
        granularity,
        j,
        collection2Params.yearArray
      );
      const collectionLabel2 = `${collection2Params.label} from ${timeLabel2}`;
      // Then combine them to generate the label for the comparison
      const collectionLabel = `${collectionLabel1} vs. ${collectionLabel2}`;

      const collection1 = {
        label: collection1Params.label,
        timePeriod: {
          granularity: granularity,
          index: i,
          identifier: timeLabel1,
        },
      };
      const collection2 = {
        label: collection2Params.label,
        timePeriod: {
          granularity: granularity,
          index: j,
          identifier: timeLabel2,
        },
      };
      const similarity = Math.random();
      const examples: RecordComparison[] = [];
      const concepts: WikipediaConcept[] = FAKE_WIKI_CONCEPTS;

      comparisons.push({
        id: `${granularity}-${i}-${j}`,
        granularity,
        label: collectionLabel,
        collection1,
        collection2,
        similarity,
        examples,
        concepts,
      });
    }
  }
  return comparisons;
};

/////////////// MAIN ///////////////

// Everything we want to compare
// All the granularities ("day", "week", "month", "year")
const granularities: Granularity[] = ["week", "month", "year"];
// All the dream collections
const dreams: CollectionParameters[] = [
  {
    label: "Dreams",
    yearArray: [2020],
  },
  {
    label: "Dreams",
    yearArray: [2005, 2006, 2007, 2008, 2009, 2010],
  },
];
// All the news
const news: CollectionParameters = {
  label: "News",
  yearArray: [2020],
};

const generateData = async () => {
  // Generate record dictionaries

  const dateRange2020: DateTimeRange = {
    from: new Date(2020, 0, 1),
    to: new Date(2020, 11, 31),
  };
  const dateRange2005_2010: DateTimeRange = {
    from: new Date(2005, 0, 1),
    to: new Date(2010, 11, 31),
  };

  const dream2020Records = generateRecordDictionary(2000, dateRange2020);
  const dream2005_2010Records = generateRecordDictionary(2000, dateRange2005_2010);
  const newsRecords = generateRecordDictionary(2000, dateRange2020);

  // Generate comparisons
  // We want to generate a set of comparisons for every granularity (day, week, month, year)
  // and each combination of dreams and news (there is only one set of news)
  const comparisonSets: { [key in Granularity]: ComparisonSet[] } = granularities.reduce(
    (acc, granularity) => {
      // Compare dreams to news
      const dreamComparisonSets = dreams.map(dreamParams =>
        generateComparisons(dreamParams, news, granularity)
      );
      return {
        ...acc,
        [granularity]: dreamComparisonSets.flat(),
      };
    },
    {} as { [key in Granularity]: ComparisonSet[] }
  );

  const { week, month, year } = comparisonSets;

  return {
    dreamsTest: dream2020Records,
    dreamsControl: dream2005_2010Records,
    news: newsRecords,
    monthComparisons: month,
    weekComparisons: week,
    yearComparisons: year,
  };
};

generateData().then(data => {
  const {
    dreamsTest,
    dreamsControl,
    news,
    monthComparisons,
    weekComparisons,
    yearComparisons,
  } = data;
  fs.writeFileSync("data/dreams-test.json", JSON.stringify(dreamsTest));
  fs.writeFileSync("data/dreams-control.json", JSON.stringify(dreamsControl));
  fs.writeFileSync("data/news.json", JSON.stringify(news));
  fs.writeFileSync("data/monthComparisons.json", JSON.stringify(monthComparisons));
  fs.writeFileSync("data/weekComparisons.json", JSON.stringify(weekComparisons));
  fs.writeFileSync("data/yearComparisons.json", JSON.stringify(yearComparisons));
});

export {};
