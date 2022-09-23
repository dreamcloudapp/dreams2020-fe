import { scaleLinear } from "d3";
import Axes from "./axes";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import { Ball } from "./ball";
import { SplitBall } from "../ball/split-ball";
import { MAX_DISTANCE_BETWEEN_TIME_PERIODS } from "../ducks/data";
import {
  Granularity,
  GranularityComparisonCollection,
} from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  CollectionCheck,
  VisComparison,
  setPrevFocusedComparison,
  setFocusedComparison,
} from "../ducks/ui";
import { useDispatch } from "react-redux";

type GraphProps = {
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

function Graph({
  data,
  width,
  height,
  maxTimeDistance,
  handleMouseOver,
  hideTooltip,
  focusedComparison,
  prevFocusedComparison,
  checkedCollections,
}: GraphProps) {
  const dispatch = useDispatch();

  // We need to know the active granularity to determine the scale
  const activeGranularity = useSelector(selectActiveGranularity);

  // Domain & range for the y-axis
  const domain = getDomain(activeGranularity);
  const range = [0, height - graphPadding.BOTTOM - graphPadding.TOP];

  const maxDist = MAX_DISTANCE_BETWEEN_TIME_PERIODS[activeGranularity];

  // Same as scale y, but all positive inputs
  const tickScale = scaleLinear()
    .domain([0, maxDist * 2]) // x intervals before, x intervals after
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  const scaleX = scaleLinear()
    .domain([0, data.maxSimilarity])
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
            <Ball
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
                    <p>{comparison.label}</p>
                    <p>Average similarity: {comparison.score.toFixed(5)}</p>
                    <p>Total words: {comparison.wordCount}</p>
                    <p>Total days compared: TODO</p>
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
                dispatch(
                  setFocusedComparison({
                    x: endX,
                    y: endY,
                    color: comparisonSet.color,
                    concepts: comparison.concepts.map(c => c.title),
                    startRadius: scaleBallSize(wordCount),
                  })
                );
              }}
            />
          );
        });
      })}
      {/* Transparent overlay */}
      {focusedComparison && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={"rgba(255,255,255,0.2)"}
          onClick={() => {
            dispatch(setPrevFocusedComparison(focusedComparison));
            dispatch(setFocusedComparison(null));
          }}
        />
      )}
      {prevFocusedComparison && (
        <SplitBall
          key={`${prevFocusedComparison.x}-${prevFocusedComparison.y}`}
          startPoint={[prevFocusedComparison.x, prevFocusedComparison.y]}
          endPoint={[width / 2, height / 2]}
          startRadius={prevFocusedComparison.startRadius}
          endRadius={Math.floor(height / 4)}
          stroke={changeHslLightness(prevFocusedComparison.color, -10)}
          strokeWidth={LINE_WIDTH}
          fill={prevFocusedComparison.color}
          onMouseOver={() => {}}
          onMouseOut={() => {}}
          opacity={1}
          onClick={() => {}}
          topCommonConcepts={prevFocusedComparison.concepts}
          graphHeight={height}
          graphWidth={width}
          isFocused={false}
        />
      )}
      {focusedComparison && (
        <SplitBall
          key={`${focusedComparison.x}-${focusedComparison.y}`}
          startPoint={[focusedComparison.x, focusedComparison.y]}
          endPoint={[width / 2, height / 2]}
          startRadius={focusedComparison.startRadius}
          endRadius={Math.floor(height / 4)}
          stroke={changeHslLightness(focusedComparison.color, -10)}
          strokeWidth={LINE_WIDTH}
          fill={focusedComparison.color}
          onMouseOver={() => {}}
          onMouseOut={() => {}}
          opacity={1}
          onClick={() => {}}
          topCommonConcepts={focusedComparison.concepts}
          graphHeight={height}
          graphWidth={width}
          isFocused={true}
        />
      )}
    </svg>
  );
}

export default Graph;
