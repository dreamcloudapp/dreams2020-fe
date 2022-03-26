import React, { useRef } from "react";
import "./App.css";
import useComponentSize from "@rehooks/component-size";
import { scaleLinear } from "d3";
import { createFakeData } from "./modules/generateFakeData";

const MILLISECONDS_IN_YEAR = 31536000000;

const fakeData = createFakeData();

// const height =

function App() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width } = useComponentSize(chartContainerRef);
  const height: number = width ? Math.floor(width * 0.6) : 0;

  const scaleY = scaleLinear()
    .domain([0, 2 * MILLISECONDS_IN_YEAR])
    .range([0, height]);
  const scaleX = scaleLinear().domain([0, 2]).range([0, width]);

  const defaultColor = "red";
  const otherColor = "blue";
  const LINE_WIDTH = 1;

  return (
    <div className="App">
      <div
        ref={chartContainerRef}
        style={{ width: "95%", margin: "2rem auto" }}
      >
        <svg width={width} height={height}>
          {fakeData.comparisons.map((comparison, i) => {
            const dream = fakeData.dreams[comparison.dreamId];
            const news = fakeData.news[comparison.newsId];
            return (
              <circle
                key={i}
                cx={scaleX(comparison.score)}
                cy={scaleY(
                  Math.abs(dream.date.getTime() - news.date.getTime())
                )}
                r={Math.floor((dream.text.length + news.text.length) / 100)}
                stroke={
                  comparison.dataLabel === "2020" ? defaultColor : otherColor
                }
                strokeWidth={LINE_WIDTH}
                fill={"white"}
              />
            );
          })}
        </svg>
      </div>
      <p style={{ color: otherColor }}>2010 dreams</p>
      <p style={{ color: defaultColor }}>2020 dreams</p>
    </div>
  );
}

export default App;
