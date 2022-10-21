import { useDispatch } from "react-redux";
import { SIMILARITY_COLORS } from "../modules/theme";
import { XYAxis } from "../axes/xy-axis";
import { BallOverlay } from "../ball/ball-overlay";
import { Column } from "../components/column";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveComparisonSet,
  selectFocusedComparison,
  selectPrevFocusedComparison,
  setActiveComparisonSet,
  setFocusedComparison,
  VisComparison,
} from "../ducks/ui";
import { prettyNumber } from "../modules/formatters";
import { monthNameFromIndex } from "../modules/time-helpers";
import { Padding } from "../modules/ui-types";
import { ColumnGraphData, SimilarityLevel } from "@kannydennedy/dreams-2020-types";

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
      <h3 style={{ textDecoration: "underline" }}>
        {monthName} 2020 dreams vs. {monthName} 2020 news
      </h3>
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
        <b>Total dream-news pairs compared: </b>
        {d.numComparisons.toLocaleString()}
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
  const activeComparisonSet = useSelector(selectActiveComparisonSet);

  const numBars = data.length;
  const totalGap = (numBars - 1) * COLUMN_GAP;
  const barWidth = (width - totalGap - padding.LEFT - padding.RIGHT) / numBars;

  // const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <svg width={width} height={height}>
      <XYAxis
        width={width}
        height={height}
        padding={padding}
        xAxisLeftLabel=""
        xAxisRightLabel=""
        xAxisCenterLabel=""
        yRange={[0, 0.02]}
        xRange={[0, data.length]}
      />
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
                const ballX = x + barWidth / 2;
                const ballY = y + colHeight / 2;
                const startRadius = 20;

                const highMedLowComparisons: VisComparison[] = Object.entries(
                  d.examples
                ).map(([level, comparison], i) => {
                  return {
                    x: ballX,
                    y: ballY,
                    index: i,
                    color: SIMILARITY_COLORS[level as SimilarityLevel],
                    concepts: comparison.concepts.map(c => c.title),
                    startRadius,
                    label: `Example ${level} similarity comparison`,
                    dreamId: comparison.dreamId,
                    newsId: comparison.newsId,
                    subLabel: "",
                  };
                });

                dispatch(setActiveComparisonSet(highMedLowComparisons));

                dispatch(setFocusedComparison(highMedLowComparisons[0]));

                // dispatch(
                //   setFocusedComparison({
                //     x: x + ballX,
                //     y: y + ballY,
                //     index: 0,
                //     color: ColorTheme.DULLER_BLUE,
                //     concepts: ["example", "example", "example"],
                //     startRadius: 20,
                //     label: "TODO",
                //   })
                // );
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
      <BallOverlay
        width={width}
        height={height}
        prevFocusedComparison={prevFocusedComparison}
        focusedComparison={focusedComparison}
        activeComparisonSet={activeComparisonSet}
      />
    </svg>
  );
}
