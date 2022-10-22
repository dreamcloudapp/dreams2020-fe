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
import { scaleLinear } from "d3";
import { Tooltip, TooltipRow } from "../tooltip/tooltip-inner";
import { useState } from "react";

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

  const similarityRows: TooltipRow[] = similarityLevels.map((sLevel, i) => {
    return {
      key: `${sLevel.similarityLevel} similarity day pairs (>= ${sLevel.threshold}):`,
      value: prettyNumber(sLevel.percent, 1) + "%",
      keyColor: sLevel.color,
    };
  });

  return (
    <Tooltip
      tipTitle={`${monthName} 2020 dreams vs. ${monthName} 2020 news`}
      sections={[
        {
          rows: [
            {
              key: "Average similarity:",
              value: prettyNumber(avgSimilarity, 5),
            },
            {
              key: "Total dream-news pairs compared:",
              value: prettyNumber(d.numComparisons, 0),
            },
            ...similarityRows,
          ],
        },
      ]}
    />
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

  const [focusedColIndex, setFocusedColIndex] = useState<number | null>(null);

  const numBars = data.length;
  const totalGap = (numBars - 1) * COLUMN_GAP;
  const barWidth = (width - totalGap - padding.LEFT - padding.RIGHT) / numBars;

  const maxSimilarity = 0.025;

  // yScale
  const yScale = scaleLinear()
    .domain([0, maxSimilarity])
    .range([0, height - padding.BOTTOM - padding.TOP]);

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
        yRange={[0, maxSimilarity]}
        xRange={[0, data.length]}
        numTicks={5}
      />
      {data.map((d, i) => {
        const colHeight = yScale(d.avgSimilarity);

        const x = i * (barWidth + COLUMN_GAP) + padding.LEFT;
        const y = height - padding.BOTTOM - colHeight;

        return (
          <g key={i}>
            <Column
              focused={focusedColIndex === i}
              onMouseOver={e => {
                setFocusedColIndex(i);
                (handleMouseOver as any)(e, renderTooltip(d));
              }}
              onMouseOut={() => {
                setFocusedColIndex(null);
                onMouseOut();
              }}
              sections={d.similarityLevels}
              x={x}
              y={y}
              colHeight={colHeight}
              colWidth={barWidth}
              onClick={() => {
                const ballX = x + barWidth / 2;
                const ballY = y;
                const startRadius = 5;

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
              }}
            />

            {/* Label */}
            <text
              x={x + barWidth / 2}
              y={y - 20}
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
