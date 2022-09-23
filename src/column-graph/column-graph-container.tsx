import { ColumnGraphData } from "../App";
import { changeHslOpacity } from "../modules/colorHelpers";
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

const prettyNumber = (similarity: number, decimals: number): string => {
  if (similarity === 0) {
    return "0";
  }
  return similarity.toFixed(decimals);
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
      <p>
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
      </p>
      <p>
        <b>Total day comparisons: </b>
        {d.count}
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
        const highSimilarityHeight = (colHeight / 100) * d.highSimilarity.percent;
        const mediumSimilarityHeight = (colHeight / 100) * d.mediumSimilarity.percent;
        const lowSimilarityHeight = (colHeight / 100) * d.lowSimilarity.percent;

        const x = i * (columnWidth + COLUMN_GAP);

        return (
          <g
            key={i}
            onMouseOver={e => {
              (handleMouseOver as any)(e, renderTooltip(d));
            }}
            onMouseOut={onMouseOut}
          >
            {/* High Similarity */}
            <rect
              x={x}
              y={height - colHeight}
              key={i}
              width={columnWidth}
              height={highSimilarityHeight}
              fill={changeHslOpacity(d.highSimilarity.color, 0.2)}
              stroke={d.highSimilarity.color}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Medium similarity */}
            <rect
              x={x}
              y={height - mediumSimilarityHeight - lowSimilarityHeight}
              key={i + "medium"}
              width={columnWidth}
              height={mediumSimilarityHeight}
              fill={changeHslOpacity(d.mediumSimilarity.color, 0.2)}
              stroke={d.mediumSimilarity.color}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Low Similarity*/}
            <rect
              x={x}
              y={height - lowSimilarityHeight}
              key={i + "low"}
              width={columnWidth}
              height={lowSimilarityHeight}
              fill={changeHslOpacity(d.lowSimilarity.color, 0.2)}
              stroke={d.lowSimilarity.color}
              strokeWidth={STROKE_WIDTH}
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
