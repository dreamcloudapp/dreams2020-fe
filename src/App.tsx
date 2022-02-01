import React from "react";
import "./App.css";

type DreamRecord = {
  text: String;
  date: Date;
  year: number;
};

type NewsRecord = {
  text: String;
  date: Date;
};

type Comparison = {
  score: number;
  dream: DreamRecord;
  news: NewsRecord;
  dataLabel: string;
};

const createNewsData = (): NewsRecord[] => {
  const day1 = new Date("2020-01-01T09:00:00");
  return [...new Array(56)].map((_, i) => {
    const date = new Date(day1.setUTCDate(day1.getUTCDate() + i * 7));
    return {
      text: `News from ${date}`,
      date: date,
    };
  });
};

const createDreamsData = (year: number): DreamRecord[] => {
  const day1 = new Date(`${year}-01-01T09:00:00`);
  return [...new Array(56)].map((_, i) => {
    const date = new Date(day1.setUTCDate(day1.getUTCDate() + i * 7));
    return {
      text: `Dream from ${date}`,
      date: date,
      year: year,
    };
  });
};

const createComparisons = (
  dreamData: DreamRecord[],
  newsData: NewsRecord[],
  dataLabel: string
): Comparison[] => {
  let comparisons: Comparison[] = [];
  for (let i = 0; i < dreamData.length; i++) {
    const dream = dreamData[i];
    for (let j = 0; j < newsData.length; j++) {
      const news = newsData[j];
      const comparison: Comparison = {
        score: Math.random(),
        dream: dream,
        news: news,
        dataLabel: dataLabel,
      };
      comparisons.push(comparison);
    }
  }
  return comparisons;
};

const createFakeData = (): Comparison[] => {
  const newsData = createNewsData();
  const dreams2020Data = createDreamsData(2020);
  const dreams2010Data = createDreamsData(2010);
  const comparisons2020 = createComparisons(dreams2020Data, newsData, "2020");
  const comparisons2010 = createComparisons(dreams2010Data, newsData, "2010");
  return [...comparisons2020, ...comparisons2010];
};

const fakeData = createFakeData();

console.log(fakeData);

function App() {
  return <div className="App">Dreams 2020 Chart test</div>;
}

export default App;
