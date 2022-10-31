import { scaleLinear } from "d3";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import { Bubble } from "./bubble";
import { MAX_DISTANCE_BETWEEN_TIME_PERIODS } from "../ducks/data";
import {
  Granularity,
  GranularityComparisonCollection,
  SimilarityLevel,
} from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  VisComparison,
  setFocusedComparison,
  selectActiveComparisonSet,
  setActiveComparisonSet,
  selectCheckedCollections,
} from "../ducks/ui";
import { useDispatch } from "react-redux";
import { BallOverlay } from "../ball/ball-overlay";
import { ColorTheme, RED_SIMILARITY_COLORS, SIMILARITY_COLORS } from "../modules/theme";
import { XYAxis } from "../axes/xy-axis";
import { Tooltip, TooltipRow } from "../tooltip/tooltip-inner";
import { toTitleCase } from "../modules/formatters";

type BubbleGraphProps = {
  data: GranularityComparisonCollection;
  maxTimeDistance: number; // We only show comparisons that fall within this range
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  hideTooltip: () => void;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
  padding: Padding;
};

const getXDomain = (granularity: Granularity): [number, number] => {
  const maxDist = MAX_DISTANCE_BETWEEN_TIME_PERIODS[granularity];
  return [maxDist * -1, maxDist];
};

const LINE_WIDTH = 2;

export function BubbleGraph({
  data,
  width,
  height,
  maxTimeDistance,
  handleMouseOver,
  hideTooltip,
  focusedComparison,
  prevFocusedComparison,
  padding,
}: BubbleGraphProps) {
  const dispatch = useDispatch();

  // We need to know the active granularity to determine the scale
  const activeGranularity = useSelector(selectActiveGranularity);
  const activeComparisonSet = useSelector(selectActiveComparisonSet);
  const checkedCollections = useSelector(selectCheckedCollections);

  // Hardcoding based on knowledge of data:(
  // Ideally this would be a function of the data itself
  const paddedMax =
    activeGranularity === "month" ? 0.028 : activeGranularity === "week" ? 0.035 : 0.7;

  // Domain & range for the x-axis
  const xDomain = getXDomain(activeGranularity);

  const xRange = [0, width - padding.LEFT - padding.RIGHT];

  const scaleY = scaleLinear()
    .domain([0, paddedMax])
    .range([height - padding.BOTTOM, padding.TOP]);

  const scaleXDiscrete = scaleLinear().domain(xDomain).range(xRange);

  // Size of the balls is determined by the number of comparisons
  // Should also take into account graph dimensions
  const maxComparisons =
    activeGranularity === "month" ? 350000 : activeGranularity === "week" ? 30000 : 550;
  const heightRatio = activeGranularity === "day" ? 40 : 50;
  const scaleBallSize = scaleLinear()
    .domain([0, maxComparisons])
    .range([0, height / heightRatio]);

  return (
    <svg width={width} height={height}>
      <XYAxis
        width={width}
        height={height}
        padding={padding}
        hasMidpointLine={true}
        yRange={[0, paddedMax]}
        xRange={xDomain}
        numTicks={7}
        xTickModulo={activeGranularity === "day" ? 20 : 1}
        xAxisCenterLabel="Dream-news time difference"
        xAxisFormat={d => {
          const plural = Math.abs(d) > 1 ? "s" : "";
          if (d === 0) {
            return `Same ${activeGranularity}`;
          } else {
            return `${d} ${activeGranularity}${plural}`;
          }
        }}
      />

      {data.comparisonSets.map((comparisonSet, setIndex) => {
        return comparisonSet.comparisons.map((comparison, i) => {
          const { dreamCollection, newsCollection, score, numComparisons } = comparison;

          const index1 = dreamCollection.timePeriod.index;
          const index2 = newsCollection.timePeriod.index;

          const startPoint: [number, number] = [width / 2, height / 2];
          const endY = scaleY(score);
          const endX = padding.LEFT + scaleXDiscrete(index1 - index2);

          const inCheckedCollection = checkedCollections.find(
            c => c.label === comparisonSet.label
          )?.checked;

          return (
            <Bubble
              startPoint={startPoint}
              endPoint={[endX, endY]}
              key={i}
              r={inCheckedCollection ? scaleBallSize(numComparisons) : 0}
              stroke={changeHslLightness(comparisonSet.color, -10)}
              strokeWidth={LINE_WIDTH}
              fill={comparisonSet.color}
              onMouseOver={e => {
                const similarityRow: TooltipRow = {
                  key:
                    activeGranularity === "day"
                      ? "Dream-news similarity:"
                      : "Average similarity:",
                  value: comparison.score.toFixed(5),
                };
                const comparisonsRow: TooltipRow = {
                  key: "Total dream-news pairs compared:",
                  value: comparison.numComparisons.toLocaleString(),
                };
                const timeDifferenceRow: TooltipRow = {
                  key: "Time:",
                  value: `Dream ${Math.abs(index1 - index2)} ${activeGranularity}${
                    Math.abs(index1 - index2) > 1 ? "s" : ""
                  } ${index1 - index2 > 0 ? "after" : "before"} the news`,
                };
                const wordCountRow: TooltipRow = {
                  key: "Dream + News word count:",
                  value: `${comparison.wordCount.toLocaleString()} words`,
                };
                const possibleCorrelationRow: TooltipRow = {
                  key: "Possible news correlation:",
                  value: comparison.reference2020 || "Not defined",
                };

                const tooltipRows =
                  activeGranularity === "day"
                    ? [
                        similarityRow,
                        timeDifferenceRow,
                        wordCountRow,
                        possibleCorrelationRow,
                      ]
                    : [similarityRow, comparisonsRow];

                (handleMouseOver as any)(
                  e,
                  <Tooltip
                    tipTitle={comparison.label}
                    sections={[
                      {
                        rows: tooltipRows,
                      },
                    ]}
                  />
                );
              }}
              opacity={
                checkedCollections.find(c => c.label === comparisonSet.label)?.checked
                  ? focusedComparison
                    ? 0.2
                    : 1
                  : 0
              }
              onMouseOut={hideTooltip}
              onClick={() => {
                const colorTheme =
                  comparisonSet.color === ColorTheme.BLUE
                    ? SIMILARITY_COLORS
                    : RED_SIMILARITY_COLORS;

                const highMedLowComparisons: VisComparison[] = Object.entries(
                  comparison.similarityExamples || {}
                ).map(([level, comparison], i) => {
                  return {
                    x: endX,
                    y: endY,
                    index: i,
                    // TODO: quick hacks
                    color:
                      activeGranularity === "day"
                        ? comparisonSet.color
                        : colorTheme[level as SimilarityLevel],
                    concepts: comparison.concepts.map(c => c.title),
                    startRadius: scaleBallSize(numComparisons),
                    label: `${toTitleCase(level)} similarity example`,
                    dreamId: comparison.dreamId,
                    newsId: comparison.newsId,
                    subLabel: "testing",
                  };
                });

                // Don't do anything if there are no examples
                if (
                  !comparison.similarityExamples ||
                  (!comparison.similarityExamples.high?.score &&
                    !comparison.similarityExamples.medium?.score &&
                    !comparison.similarityExamples.low?.score)
                ) {
                  return;
                }
                dispatch(setActiveComparisonSet(highMedLowComparisons));
                dispatch(setFocusedComparison(highMedLowComparisons[0]));
              }}
            />
          );
        });
      })}
      {/* Overlay with focused balls (may be null) */}
      {/* Don't show this if there's no info in the focused comparison */}
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
