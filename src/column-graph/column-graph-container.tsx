import { useDispatch } from "react-redux";
import { ColorTheme } from "../modules/theme";
import { ColumnGraphData } from "../App";
import { BasedAxis } from "../axes/before-after-axis";
import { BubbleOverlay } from "../ball/ball-overlay";
import { Column } from "../components/column";
import { useSelector } from "../ducks/root-reducer";
import {
  selectFocusedComparison,
  selectPrevFocusedComparison,
  setFocusedComparison,
} from "../ducks/ui";
import { prettyNumber } from "../modules/formatters";
import { monthNameFromIndex } from "../modules/time-helpers";
import { Padding } from "../modules/ui-types";

const COLUMN_GAP = 10;

type GraphProps = {
  data: ColumnGraphData[];
  width: number;
  height: number;
  padding: Padding;
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
  padding,
}: GraphProps) {
  const dispatch = useDispatch();
  const focusedComparison = useSelector(selectFocusedComparison);
  const prevFocusedComparison = useSelector(selectPrevFocusedComparison);

  const numBars = data.length;
  const totalGap = (numBars - 1) * COLUMN_GAP;
  const barWidth = (width - totalGap - padding.LEFT - padding.RIGHT) / numBars;

  // const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <svg width={width} height={height}>
      <BasedAxis width={width} height={height} padding={padding} />
      {data.map((d, i) => {
        const colHeight = d.avgSimilarity * 18000;

        const x = i * (barWidth + COLUMN_GAP) + padding.LEFT;
        const y = height - padding.BOTTOM - colHeight;

        return (
          <g key={i}>
            <Column
              onMouseOver={e => {
                (handleMouseOver as any)(e, renderTooltip(d));
              }}
              onMouseOut={onMouseOut}
              sections={d.similarityLevels}
              x={x}
              y={y}
              colHeight={colHeight}
              colWidth={barWidth}
              onClick={() => {
                dispatch(
                  setFocusedComparison({
                    x: x + barWidth / 2,
                    y: y + colHeight / 2,
                    color: ColorTheme.DULLER_BLUE,
                    concepts: ["example", "example", "example"],
                    startRadius: 20,
                  })
                );
              }}
            />

            {/* Label */}
            <text
              x={x + barWidth / 2}
              y={y - 10}
              textAnchor="middle"
              fill="black"
              fontSize="12px"
            >
              {monthNameFromIndex(d.month)}
            </text>
          </g>
        );
      })}
      <BubbleOverlay
        width={width}
        height={height}
        prevFocusedComparison={prevFocusedComparison}
        focusedComparison={focusedComparison}
      />
    </svg>
  );
}
