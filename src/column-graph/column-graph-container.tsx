import { ColumnGraphData } from "../App";
import { Column } from "../components/column";
import { changeHslOpacity } from "../modules/colorHelpers";
import { prettyNumber } from "../modules/formatters";
import { monthNameFromIndex } from "../modules/time-helpers";

const STROKE_WIDTH = 2;
const COLUMN_GAP = 10;

type GraphProps = {
  data: ColumnGraphData[];
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  onMouseOut: () => void;
};

const renderTooltip = (d: ColumnGraphData) => {
  const monthName = monthNameFromIndex(d.month);
  return (
    <div>
      <p>
        {monthName} 2020 dream days vs.
        <br /> {monthName} 2020 news days
      </p>
      <p>
        <b>Average similarity: </b>
        {prettyNumber(d.avgSimilarity, 5)}
      </p>
      {/* <p>
        <b style={{ color: d.highSimilarity.color }}>High similarity day pairs</b>
        <span> (&gt;= {d.highSimilarity.threshold}): </span>
        <span> {prettyNumber(d.highSimilarity.percent, 1)}%</span>
      </p>
      <p>
        <b style={{ color: d.mediumSimilarity.color }}>Medium similarity day pairs</b>
        <span> (&gt;= {d.mediumSimilarity.threshold}): </span>
        <span> {prettyNumber(d.mediumSimilarity.percent, 1)}%</span>
      </p>
      <p>
        <b style={{ color: d.lowSimilarity.color }}>Low similarity day pairs</b>
        <span> (&lt; {d.mediumSimilarity.threshold}): </span>
        <span>{prettyNumber(d.lowSimilarity.percent, 1)}%</span>
      </p> */}
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
              handleMouseOver={handleMouseOver}
              onMouseOut={onMouseOut}
              sections={d.similarityLevels}
              x={x}
              y={height - colHeight}
              tooltipData={d}
              renderTooltip={renderTooltip}
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
