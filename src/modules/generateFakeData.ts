import {
  DreamRecord,
  NewsRecord,
  Comparison,
  ComparisonData,
  DreamRecordDictionary,
  NewsRecordDictionary,
} from "./types";

// 100 word dummy text
const LOREM =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ";

const createDummyText = (wordLength: number): string => {
  return LOREM.split(" ").slice(0, wordLength).join(" ");
};

const createNewsData = (): NewsRecord[] => {
  const day1 = new Date("2020-01-01T09:00:00");
  return [...new Array(56)].map((_, i) => {
    const date = new Date(day1.setUTCDate(day1.getUTCDate() + i * 7));
    return {
      text: createDummyText(Math.random() * 100),
      date: date,
      id: i,
    };
  });
};

const createDreamsData = (year: number): DreamRecord[] => {
  const day1 = new Date(`${year}-01-01T09:00:00`);
  return [...new Array(56)].map((_, i) => {
    const date = new Date(day1.setUTCDate(day1.getUTCDate() + i * 7));
    return {
      text: createDummyText(Math.random() * 100),
      date: date,
      id: i,
    };
  });
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
      };
      comparisons.push(comparison);
    }
  }
  return comparisons;
};

export const createFakeData = (): ComparisonData => {
  const newsData = createNewsData();
  const dreams2020Data = createDreamsData(2020);
  const dreams2010Data = createDreamsData(2010);
  const comparisons2020 = createComparisons(
    dreams2020Data,
    newsData,
    "2020",
    2
  );

  const d: DreamRecordDictionary = [
    ...dreams2020Data,
    ...dreams2010Data,
  ].reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as DreamRecordDictionary);

  const n: NewsRecordDictionary = newsData.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as NewsRecordDictionary);

  const comparisons2010 = createComparisons(
    dreams2010Data,
    newsData,
    "2010",
    1
  );
  return {
    dreams: d,
    news: n,
    comparisons: [...comparisons2020, ...comparisons2010],
  };
};
