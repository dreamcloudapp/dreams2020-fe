import { yearEndDate, yearStartDate } from "./dateHelpers";
import { ColorTheme } from "./theme";
import {
  DreamRecord,
  NewsRecord,
  Comparison,
  DreamRecordDictionary,
  NewsRecordDictionary,
  DreamCollection,
  NewsCollection,
  ComparisonSet,
  ComparisonSets,
  WikipediaConceptDictionary,
} from "../../types/types";

// 100 word dummy text
const LOREM =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ";

const createDummyText = (wordLength: number): string => {
  return LOREM.split(" ").slice(0, wordLength).join(" ");
};

const createNewsData = (collectionLabel: String): NewsRecord[] => {
  return [...new Array(12)].map((_, i) => {
    // Need to declare this in the loop
    const day1 = new Date("2020-01-01T09:00:00");
    const numDaysToAdd = i * 30;

    const date = new Date(day1.setUTCDate(day1.getUTCDate() + numDaysToAdd));

    if (i > 48) {
      console.log("day 1", day1);
      console.log("date", date);
      console.log("numDaysToAdd", numDaysToAdd);
    }
    return {
      text: createDummyText(Math.random() * 100),
      date: date,
      label: collectionLabel,
      id: i,
    };
  });
};

const createDreamsData = (year: number, collectionLabel: String): DreamRecord[] => {
  return [...new Array(12)].map((_, i) => {
    const day1 = new Date(`${year}-01-01T09:00:00`);
    const date = new Date(day1.setUTCDate(day1.getUTCDate() + i * 30));
    return {
      text: createDummyText(Math.random() * 100),
      date: date,
      label: collectionLabel,
      id: i,
    };
  });
};

const dreamsToDictionary = (dreams: DreamRecord[]): DreamRecordDictionary => {
  return dreams.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as DreamRecordDictionary);
};

const newsToDictionary = (news: NewsRecord[]): NewsRecordDictionary => {
  return news.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as NewsRecordDictionary);
};

const createComparisons = (
  dreamData: DreamRecord[],
  newsData: NewsRecord[],
  dataLabel: string,
  weight: number
): Comparison[] => {
  let comparisons: Comparison[] = [];
  for (let i = 0; i < dreamData.length; i++) {
    const dream = dreamData[i];
    for (let j = 0; j < newsData.length; j++) {
      const news = newsData[j];
      const comparison: Comparison = {
        score: Math.random() * weight,
        dreamId: dream.id,
        newsId: news.id,
        dataLabel: dataLabel,
        topCommonConceptIds: [
          "dog",
          "cat",
          "Donald Trump",
          "COVID-19",
          "Al Gore",
          "Internet",
        ],
      };
      comparisons.push(comparison);
    }
  }
  return comparisons;
};

export const createFakeData = (): ComparisonSets => {
  const newsData = createNewsData("2020 News");
  const dreams2020Data = createDreamsData(2020, "2020 Dreams");
  const dreams2010Data = createDreamsData(2010, "2010 Dreams");
  const comparisons2020 = createComparisons(dreams2020Data, newsData, "2020", 2);
  const comparisons2010 = createComparisons(dreams2010Data, newsData, "2010", 1.5);

  const dreams2010Dictionary = dreamsToDictionary(dreams2010Data);
  const dreams2020Dictionary = dreamsToDictionary(dreams2020Data);
  const newsRecordDictionary = newsToDictionary(newsData);

  const dreams2020Collection: DreamCollection = {
    year: "2020",
    timePeriodStartDate: yearStartDate("2020"),
    timePeriodEndDate: yearEndDate("2020"),
    collectionStartDate: new Date(Math.min(...dreams2020Data.map(d => d.date.getTime()))),
    collectionEndDate: new Date(Math.max(...dreams2020Data.map(d => d.date.getTime()))),
    label: "Dreams 2020",
    dreams: dreams2020Dictionary,
  };

  const dreams2010Collection: DreamCollection = {
    year: "2010",
    timePeriodStartDate: yearStartDate("2010"),
    timePeriodEndDate: yearEndDate("2010"),
    collectionStartDate: new Date(Math.min(...dreams2010Data.map(d => d.date.getTime()))),
    collectionEndDate: new Date(Math.max(...dreams2010Data.map(d => d.date.getTime()))),
    label: "Dreams 2010",
    dreams: dreams2010Dictionary,
  };

  const newsCollection: NewsCollection = {
    year: "2020",
    timePeriodStartDate: yearStartDate("2020"),
    timePeriodEndDate: yearEndDate("2020"),
    collectionStartDate: new Date(Math.min(...newsData.map(d => d.date.getTime()))),
    collectionEndDate: new Date(Math.max(...newsData.map(d => d.date.getTime()))),
    label: "News 2020",
    news: newsRecordDictionary,
  };

  const comparisonSet1: ComparisonSet = {
    label: "2010 Dreams vs 2020 News Items",
    comparisons: comparisons2010,
    color: ColorTheme.RED,
    dreamCollection: dreams2010Collection,
    newsCollection: newsCollection,
  };

  const comparisonSet2: ComparisonSet = {
    label: "2020 Dreams vs 2020 News Items",
    comparisons: comparisons2020,
    color: ColorTheme.BLUE,
    dreamCollection: dreams2020Collection,
    newsCollection: newsCollection,
  };

  return {
    comparisonSets: [comparisonSet1, comparisonSet2],
  };
};

export const wikipediaConceptDictionary: WikipediaConceptDictionary = {
  "Donald Trump": {
    title: "Donald Trump",
    link: "https://en.wikipedia.org/wiki/Donald_Trump",
  },
  Dog: {
    title: "Dog",
    link: "https://en.wikipedia.org/wiki/Dog",
  },
  Cat: {
    title: "Cat",
    link: "https://en.wikipedia.org/wiki/Cat",
  },
  "COVID-19": {
    title: "COVID-19",
    link: "https://en.wikipedia.org/wiki/COVID-19",
  },
  "Al Gore": {
    title: "Al Gore",
    link: "https://en.wikipedia.org/wiki/Al_Gore",
  },
  Internet: {
    title: "Internet",
    link: "https://en.wikipedia.org/wiki/Internet",
  },
};
