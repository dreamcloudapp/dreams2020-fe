import { ColumnGraphData } from "../App";
import { Column } from "../components/column";
import { prettyNumber } from "../modules/formatters";
import { monthNameFromIndex } from "../modules/time-helpers";

const COLUMN_GAP = 10;

type GraphProps = {
  data: ColumnGraphData[];
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  onMouseOut: () => void;
};

const renderTooltip = (d: ColumnGraphData) => {
  const { similarityLevels, avgSimilarity, month } = d;
  const monthName = monthNameFromIndex(month);
  return (
    <div>
      <p>
        {monthName} 2020 dream days vs.
        <br /> {monthName} 2020 news days
      </p>
      <p>
        <b>Average similarity: </b>
        {prettyNumber(avgSimilarity, 5)}
      </p>
      {/* Need to reverse these for presentation */}
      {similarityLevels
        .slice()
        .reverse()
        .map((sLevel, i) => {
          return (
            <p key={i}>
              <b style={{ color: sLevel.color }}>
                {sLevel.similarityLevel} similarity day pairs
              </b>
              <span> (&gt;= {sLevel.threshold}): </span>
              <span> {prettyNumber(sLevel.percent, 1)}%</span>
            </p>
          );
        })}
      <p>
        <b>Total day comparisons: </b>
        {d.count}
      </p>
      <p>
        <b>Total word count: </b>
        {d.totalWordCount}
      </p>
    </div>
  );
};

export function ColumnGraphContainer({
  data,
  width,
  height,
  handleMouseOver,
  onMouseOut,
}: GraphProps) {
  const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const colHeight = d.avgSimilarity * 18000;

        const x = i * (columnWidth + COLUMN_GAP);

        // const sections: SimilarityLevelSection[] = [

        // ]

        return (
          <g>
            <Column
              key={i}
              onMouseOver={e => {
                (handleMouseOver as any)(e, renderTooltip(d));
              }}
              onMouseOut={onMouseOut}
              sections={d.similarityLevels}
              x={x}
              y={height - colHeight}
              colHeight={colHeight}
              colWidth={columnWidth}
            />

            {/* Label */}
            <text
              x={x + columnWidth / 2}
              y={height - colHeight - 10}
              textAnchor="middle"
              fill="black"
              fontSize="12px"
            >
              {monthNameFromIndex(d.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
