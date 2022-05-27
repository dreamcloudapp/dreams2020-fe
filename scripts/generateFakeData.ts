const fs = require("fs");
const {
  FAKE_WIKI_CONCEPTS,
  MONTHS,
  LAST_WEEK_OF_YEAR_INDEX,
  LOREM,
  SHORT_MONTHS,
  FAKE_EXAMPLE_COMPARISONS,
} = require("./fakeConstants");
import {
  Granularity,
  WikipediaConcept,
  ExampleRecordComparison,
  ComparisonSet,
  ColoredSetWithinGranularity,
  GranularityComparisonCollection,
  DateTimeRange,
} from "@kannydennedy/dreams-2020-types";
const { isLeapYear, addDays } = require("./modules/time-helpers");

/////////////// TYPES ///////////////

// The maximum time index distance for a given granularity
// E.g. for granularity "month", the max distance is 11
export const MAX_DISTANCE_BETWEEN_TIME_PERIODS: {
  [key in Granularity]: number;
} = {
  day: 2, // 2 days max between day comparisons
  week: 4, // 3 weeks max between week comparisons
  month: 11, // 11 months max between month comparisons (since we only compare January to December, not January to January)
  year: 30, // 30 years max between year comparisons
};

export enum ColorTheme {
  RED = "hsl(10, 90%, 60%)",
  BLUE = "hsl(220, 90%, 60%)",
}

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
      if (hasLeapYear && (index === 29 || index === 30)) {
        // In the case of a leap year, we want to treat Feb. 28-29 as a "day"
        // Though theoretically this function doesn't get passed Feb 29, it's handled in the calling function
        return `Feb 28-29 ${yearLabel}`;
      } else if (hasLeapYear && index > 30) {
        // -1 because we just combined Feb 28 and Feb 29 into a single day
        const day = addDays(firstDayOfExampleLeapYear, index - 1);
        return `${SHORT_MONTHS[day.getMonth()]} ${day.getDate()} ${yearLabel}`;
      } else {
        // Leap year / non leap year doesn't matter before Feb 28
        const day = addDays(firstDayOfExampleNonLeapYear, index);
        return `${SHORT_MONTHS[day.getMonth()]} ${day.getDate()} ${yearLabel}`;
      }

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

      return `Week ${
        index + 1
      } ${yearLabel} (${firstDayOfWeekMonth} ${firstDayOfWeek.getDate()} - ${lastDayOfWeekMonth} ${lastDayOfWeek.getDate()})`;
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
  collectionLabel: string;
  yearArray: number[];
  fakeSimilarityWeighting: number;
  color: ColorTheme;
};
const generateComparisons = (
  collection1Params: CollectionParameters,
  collection2Params: CollectionParameters,
  granularity: Granularity,
  weighting: number
): ComparisonSet[] => {
  const numIntervalsInPeriod = NUM_STOPS_IN_TIME_PERIOD[granularity];

  const comparisons: ComparisonSet[] = [];

  for (let i = 0; i < numIntervalsInPeriod; i++) {
    for (let j = 0; j < numIntervalsInPeriod; j++) {
      // If the time interval is greater than the max distance, we don't want to compare
      // e.g. if granularity is "day", we don't want to compare Jan 1 vs. Dec 31
      if (Math.abs(i - j) > MAX_DISTANCE_BETWEEN_TIME_PERIODS[granularity]) {
        continue;
      }
      // We ignore Feb 29 in a leap year, it's combined with Feb 28
      if ((granularity === "day" && i === 30) || j === 30) {
        continue;
      }

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
          start: new Date(), // TODO: make this real
          end: new Date(),
        },
      };
      const collection2 = {
        label: collection2Params.label,
        timePeriod: {
          granularity: granularity,
          index: j,
          identifier: timeLabel2,
          start: new Date(),
          end: new Date(),
        },
      };
      const score = Math.random() * weighting * 2;
      const wordCount = Math.floor(Math.random() * 100); // Need to make this different depending on the granularity
      const examples: ExampleRecordComparison[] = FAKE_EXAMPLE_COMPARISONS;
      const concepts: WikipediaConcept[] = FAKE_WIKI_CONCEPTS;

      comparisons.push({
        id: `${granularity}-${i}-${j}`,
        granularity,
        label: collectionLabel,
        collection1,
        collection2,
        score,
        wordCount,
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
const granularities: Granularity[] = ["day", "week", "month", "year"];
// All the dream collections
const dreamCollectionParams: CollectionParameters[] = [
  {
    label: "Dreams",
    collectionLabel: "2020 Dreams",
    yearArray: [2020],
    fakeSimilarityWeighting: 1,
    color: ColorTheme.BLUE,
  },
  {
    label: "Dreams",
    collectionLabel: "2005-2010 Dreams",
    yearArray: [2005, 2006, 2007, 2008, 2009, 2010],
    fakeSimilarityWeighting: 0.5,
    color: ColorTheme.RED,
  },
];
// All the news
const news: CollectionParameters = {
  label: "News",
  collectionLabel: "2020 News Items",
  yearArray: [2020],
  fakeSimilarityWeighting: 1,
  color: ColorTheme.RED,
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
  const allDreamRecords: RecordDictionary = {
    ...dream2020Records,
    ...dream2005_2010Records,
  };
  const newsRecords = generateRecordDictionary(2000, dateRange2020);

  // Generate comparisons
  // We want to generate a set of comparisons for every granularity (day, week, month, year)
  // and each combination of dreams and news (there is only one set of news)
  const comparisonSets: { [key in Granularity]: GranularityComparisonCollection } =
    granularities.reduce((acc, granularity) => {
      // Compare dreams to news
      // There's only one news set, but multiple dream sets
      const dreamComparisonSets = dreamCollectionParams.map(dreamParams => {
        const comparisons = generateComparisons(
          dreamParams,
          news,
          granularity,
          dreamParams.fakeSimilarityWeighting
        );
        const ret: ColoredSetWithinGranularity = {
          label: `${dreamParams.collectionLabel} vs ${news.collectionLabel}`,
          color: dreamParams.color,
          comparisons: comparisons,
        };
        return ret;
      });

      const dataForGranularity: GranularityComparisonCollection = {
        granularity: granularity,
        maxSimilarity: 2,
        minSimilarity: 0,
        comparisonSets: dreamComparisonSets,
      };

      return {
        ...acc,
        [granularity]: dataForGranularity,
      };
    }, {} as { [key in Granularity]: GranularityComparisonCollection });

  const { week, month, year, day } = comparisonSets;

  return {
    dreams: allDreamRecords,
    news: newsRecords,
    monthComparisons: month,
    weekComparisons: week,
    yearComparisons: year,
    dayComparisons: day,
  };
};

generateData().then(data => {
  const {
    dreams,
    news,
    monthComparisons,
    weekComparisons,
    yearComparisons,
    dayComparisons,
  } = data;
  fs.writeFileSync("public/data/dreams-test.json", JSON.stringify(dreams));
  fs.writeFileSync("public/data/news.json", JSON.stringify(news));
  fs.writeFileSync("public/data/monthComparisons.json", JSON.stringify(monthComparisons));
  fs.writeFileSync("public/data/weekComparisons.json", JSON.stringify(weekComparisons));
  fs.writeFileSync("public/data/yearComparisons.json", JSON.stringify(yearComparisons));
  fs.writeFileSync("public/data/dayComparisons.json", JSON.stringify(dayComparisons));
});

export {};
