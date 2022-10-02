import {
  DifferenceDisplayRecord,
  DifferenceRecord,
} from "@kannydennedy/dreams-2020-types";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import "../App.css";
import { BasedAxis } from "../axes/before-after-axis";
import { prettyNumber } from "../modules/formatters";
import { Column } from "../components/column";
import { useDispatch } from "react-redux";
import {
  selectFocusedComparison,
  selectPrevFocusedComparison,
  setFocusedComparison,
} from "../ducks/ui";
import { DifferenceDisplayRecordWithExamples } from "../App";
import { BubbleOverlay } from "../ball/ball-overlay";
import { useSelector } from "../ducks/root-reducer";
import { ColorTheme } from "../modules/theme";

const BAR_GAP = 3;

type BarGraphProps = {
  data: DifferenceDisplayRecordWithExamples;
  padding: Padding;
  width: number;
  height: number;
  onMouseOut: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const renderTooltip = (d: DifferenceRecord) => {
  const { difference, similarityLevels } = d;
  const absoluteDifference = Math.abs(difference);

  let tooltipHeader = "";
  if (difference === 0) {
    tooltipHeader = "Dreams within 1 week after the news";
  } else if (difference > 0) {
    tooltipHeader = `Dreams within ${absoluteDifference + 1} weeks after the news`;
  } else if (difference === -1) {
    tooltipHeader = `Dreams within 1 week before the news`;
  } else if (difference < -1) {
    tooltipHeader = `Dreams within ${absoluteDifference} weeks before the news`;
  }

  return (
    <div className="tooltip">
      <p>{tooltipHeader}</p>
      <p>
        <b>Average similarity: </b>
        {prettyNumber(d.averageSimilarity, 5)}
      </p>
      {(similarityLevels || [])
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
    </div>
  );
};

export function BarGraphContainer({
  data,
  height,
  width,
  onMouseOut,
  handleMouseOver,
  padding,
}: BarGraphProps) {
  const dispatch = useDispatch();
  const focusedComparison = useSelector(selectFocusedComparison);
  const prevFocusedComparison = useSelector(selectPrevFocusedComparison);

  const numBars = data.comparisons.differences.length;
  const totalGap = (numBars - 1) * BAR_GAP;
  const barWidth = (width - totalGap - padding.LEFT - padding.RIGHT) / numBars;

  const max = data.comparisons.maxAverageSimilarity;
  const yPad = height * 0.1;
  const scaleY = scaleLinear()
    .domain([0, max])
    .range([0, height - padding.TOP - padding.BOTTOM - yPad]);

  return (
    <svg width={width} height={height}>
      <BasedAxis width={width} height={height} padding={padding} hasMidpointLine={true} />
      {data.comparisons.differences.map((difference, index) => {
        const x = (barWidth + BAR_GAP) * index + padding.LEFT;
        const barHeight = scaleY(difference.averageSimilarity);

        const y = height - padding.BOTTOM - barHeight;

        return (
          <Column
            key={index}
            x={x}
            y={y}
            colWidth={barWidth}
            colHeight={barHeight}
            onMouseOver={e => {
              (handleMouseOver as any)(e, renderTooltip(difference));
            }}
            onMouseOut={onMouseOut}
            sections={difference.similarityLevels || []}
            onClick={() => {
              dispatch(
                setFocusedComparison({
                  x: x + barWidth / 2,
                  y: y + barHeight / 2,
                  color: ColorTheme.DULLER_BLUE,
                  concepts: difference.examples["high"].topConcepts.map(x => x.concept),
                  startRadius: 20,
                })
              );
            }}
          />
        );
      })}
      {/* Overlay with focused balls (may be null) */}
      <BubbleOverlay
        width={width}
        height={height}
        prevFocusedComparison={prevFocusedComparison}
        focusedComparison={focusedComparison}
      />
    </svg>
  );
}
