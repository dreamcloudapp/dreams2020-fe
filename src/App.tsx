import React, { useRef } from "react";
import "./App.css";
import useComponentSize from "@rehooks/component-size";
import { scaleLinear } from "d3";

const MILLISECONDS_IN_YEAR = 31536000000;

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

// const height =

function App() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width } = useComponentSize(chartContainerRef);
  const height: number = width ? Math.floor(width * 0.6) : 0;

  const scaleY = scaleLinear()
    .domain([0, 2 * MILLISECONDS_IN_YEAR])
    .range([0, height]);
  const scaleX = scaleLinear().domain([0, 1]).range([0, width]);

  const defaultColor = "red";
  const LINE_WIDTH = 1;

  return (
    <div className="App">
      <h1>Dreams 2020 Chart test</h1>
      <div ref={chartContainerRef} style={{ width: "90%" }}>
        <svg width={width} height={height}>
          {fakeData.map((comparison, i) => {
            return (
              <circle
                key={i}
                cx={scaleX(comparison.score)}
                cy={scaleY(
                  Math.abs(
                    comparison.dream.date.getTime() -
                      comparison.news.date.getTime()
                  )
                )}
                r={5}
                stroke={defaultColor}
                strokeWidth={LINE_WIDTH}
                fill={"white"}
              />
            );
          })}
          {/* <circle
            cx={scaleX(0.5)}
            cy={scaleY(MILLISECONDS_IN_YEAR)}
            r={50}
            stroke={defaultColor}
            strokeWidth={LINE_WIDTH}
            fill={"white"}
          /> */}
        </svg>
      </div>
    </div>
  );
}

export default App;
