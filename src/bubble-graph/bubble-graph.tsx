import { scaleLinear } from "d3";
import Axes from "./axes";
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
  CollectionCheck,
  VisComparison,
  setFocusedComparison,
  selectActiveComparisonSet,
  setActiveComparisonSet,
} from "../ducks/ui";
import { useDispatch } from "react-redux";
import { BallOverlay } from "../ball/ball-overlay";
import { ColorTheme, RED_SIMILARITY_COLORS, SIMILARITY_COLORS } from "../modules/theme";

type BubbleGraphProps = {
  data: GranularityComparisonCollection;
  maxTimeDistance: number; // We only show comparisons that fall within this range
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  checkedCollections: CollectionCheck[];
  hideTooltip: () => void;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
};

const getDomain = (granularity: Granularity): [number, number] => {
  const maxDist = MAX_DISTANCE_BETWEEN_TIME_PERIODS[granularity];
  return [maxDist * -1, maxDist];
};

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;
const graphPadding: Padding = { LEFT: 90, RIGHT: 90, TOP: 60, BOTTOM: 60 };

export function BubbleGraph({
  data,
  width,
  height,
  maxTimeDistance,
  handleMouseOver,
  hideTooltip,
  focusedComparison,
  prevFocusedComparison,
  checkedCollections,
}: BubbleGraphProps) {
  const dispatch = useDispatch();

  // We need to know the active granularity to determine the scale
  const activeGranularity = useSelector(selectActiveGranularity);
  const activeComparisonSet = useSelector(selectActiveComparisonSet);

  // Domain & range for the y-axis
  const domain = getDomain(activeGranularity);
  const range = [0, height - graphPadding.BOTTOM - graphPadding.TOP];

  const maxDist = MAX_DISTANCE_BETWEEN_TIME_PERIODS[activeGranularity];

  // Same as scale y, but all positive inputs
  const tickScale = scaleLinear()
    .domain([0, maxDist * 2]) // x intervals before, x intervals after
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  const scaleX = scaleLinear()
    .domain([data.minSimilarity, data.maxSimilarity])
    .range([graphPadding.LEFT, width - graphPadding.RIGHT]);

  const scaleYDiscrete = scaleLinear().domain(domain).range(range);

  // Size of the balls is determined by the number of words in the comparison
  // And the height of the graph
  // TODO - think about width too
  const scaleBallSize = scaleLinear()
    .domain([0, data.maxWordCount])
    .range([0, height / 40]);

  return (
    <svg width={width} height={height}>
      <Axes
        height={height}
        width={width}
        strokeWidth={LINE_WIDTH}
        padding={graphPadding}
        triangleHeight={TRIANGLE_HEIGHT}
        strokeColor={"hsl(0, 0%, 20%)"}
        yAxisTopLabel={"Dream earlier in the year than news"}
        yAxisBottomLabel={"Dream later in the year than news"}
        xAxisRightLabel={"Similarity"}
        yAxisTextLeft={30}
        maxTimeDistance={maxDist}
        tickScale={tickScale}
        opacity={focusedComparison ? 0.2 : 1}
        granularity={activeGranularity}
      />

      {data.comparisonSets.map((comparisonSet, setIndex) => {
        return comparisonSet.comparisons.map((comparison, i) => {
          const { dreamCollection, newsCollection, score, wordCount } = comparison;

          const index1 = dreamCollection.timePeriod.index;
          const index2 = newsCollection.timePeriod.index;

          const startPoint: [number, number] = [width / 2, height / 2];
          const endX = scaleX(score);
          const endY = graphPadding.TOP + scaleYDiscrete(index1 - index2);

          return (
            <Bubble
              startPoint={startPoint}
              endPoint={[endX, endY]}
              key={i}
              r={scaleBallSize(wordCount)}
              stroke={changeHslLightness(comparisonSet.color, -10)}
              strokeWidth={LINE_WIDTH}
              fill={comparisonSet.color}
              onMouseOver={e => {
                (handleMouseOver as any)(
                  e,
                  <div>
                    <h4 style={{ fontWeight: "bold", textDecoration: "underline" }}>
                      {comparison.label}
                    </h4>
                    <p>Average similarity: {comparison.score.toFixed(5)}</p>
                    <p>Total words: {comparison.wordCount.toLocaleString()}</p>
                    <p>
                      Total dream-news pairs compared:{" "}
                      {comparison.numComparisons.toLocaleString()}
                    </p>
                  </div>
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
                    color: colorTheme[level as SimilarityLevel],
                    concepts: comparison.concepts.map(c => c.title),
                    startRadius: scaleBallSize(wordCount),
                    label: `Example ${level} similarity comparison`,
                    dreamId: comparison.dreamId,
                    newsId: comparison.newsId,
                    subLabel: "testing",
                  };
                });

                // Don't do anything if there are no examples
                if (
                  !comparison.similarityExamples ||
                  !comparison.similarityExamples.high.score
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
