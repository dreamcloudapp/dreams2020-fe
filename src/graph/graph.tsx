import { scaleLinear } from "d3";
import Axes from "./axes";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import { Ball } from "./ball";
import { SplitBall } from "../ball/split-ball";
import { FakeComparison } from "./graph-container";
import { MAX_DISTANCE_BETWEEN_TIME_PERIODS } from "../ducks/data";
import {
  Granularity,
  GranularityComparisonCollection,
} from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import { selectActiveGranularity } from "../ducks/ui";

type GraphProps = {
  data: GranularityComparisonCollection;
  maxTimeDistance: number; // We only show comparisons that fall within this range
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  checkedState: boolean[];
  hideTooltip: () => void;
  focusedComparison: FakeComparison | null;
  prevFocusedComparison: FakeComparison | null;
  setFocusedComparison: React.Dispatch<React.SetStateAction<FakeComparison | null>>;
  setPrevFocusedComparison: React.Dispatch<React.SetStateAction<FakeComparison | null>>;
};

function getRadius(wordLength: number): number {
  return Math.floor(wordLength / 100);
}

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
  checkedState,
  hideTooltip,
  focusedComparison,
  prevFocusedComparison,
  setFocusedComparison,
  setPrevFocusedComparison,
}: GraphProps) {
  // We need to know the active granularity to determine the scale
  const activeGranularity = useSelector(selectActiveGranularity);
  const domain = getDomain(activeGranularity);
  // const numStopsAboveAxis = getDomain(activeGranularity);

  // Same as scale y, but all positive inputs
  const tickScale = scaleLinear()
    .domain([0, maxTimeDistance * 2])
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  const scaleX = scaleLinear()
    .domain([0, 2])
    .range([graphPadding.LEFT, width - graphPadding.RIGHT]);

  const scaleYDiscrete = scaleLinear()
    .domain(domain)
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

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
        maxTimeDistance={maxTimeDistance}
        tickScale={tickScale}
        opacity={focusedComparison ? 0.2 : 1}
      />

      {data.comparisonSets.map((comparisonSet, setIndex) => {
        return comparisonSet.comparisons.map((comparison, i) => {
          const { collection1, collection2, score, wordCount } = comparison;

          console.log(comparison);

          const index1 = collection1.timePeriod.index;
          const index2 = collection2.timePeriod.index;

          const startPoint: [number, number] = [width / 2, height / 2];
          const endX = scaleX(score);
          const endY = graphPadding.TOP + scaleYDiscrete(index1 - index2);

          return (
            <Ball
              startPoint={startPoint}
              endPoint={[endX, endY]}
              key={i}
              r={getRadius(wordCount * 10)} // TODO: Make this a function of the word length
              stroke={changeHslLightness(comparisonSet.color, -10)}
              strokeWidth={LINE_WIDTH}
              fill={comparisonSet.color}
              onMouseOver={e => {
                (handleMouseOver as any)(e, comparison.label);
              }}
              opacity={checkedState[setIndex] ? (focusedComparison ? 0.2 : 1) : 0}
              onMouseOut={hideTooltip}
              onClick={() => {
                setFocusedComparison({
                  x: endX,
                  y: endY,
                  color: comparisonSet.color,
                  concepts: comparisonSet.comparisons[0].concepts.map(c => c.title),
                  startRadius: getRadius(wordCount * 10), // TODO
                });
              }}
            />
          );
        });

        // return comparisonSet.comparisons.map((comparison, i) => {
        //   const { collection1: dreamCollection, collection2: newsCollection } =
        //     comparisonSet;
        //   const dream = dreamCollection.dreams[comparison.dreamId];
        //   const news = newsCollection.news[comparison.newsId];
        //   const endX = scaleX(comparison.score);
        //   const endY =
        //     graphPadding.TOP +
        //     getYAxisPosition(
        //       dream.date.getTime(),
        //       news.date.getTime(),
        //       dreamCollection.timePeriodStartDate.getTime(),
        //       newsCollection.timePeriodStartDate.getTime()
        //     );
        //   const startPoint: [number, number] = [width / 2, height / 2];
        //   // const startPoint: [number, number] = [536.5, 300];
        //   // console.log(startPoint);
        //   return (
        //     <Ball
        //       startPoint={startPoint}
        //       endPoint={[endX, endY]}
        //       key={i}
        //       r={getRadius(dream.text.length + news.text.length)}
        //       stroke={changeHslLightness(comparisonSet.color, -10)}
        //       strokeWidth={LINE_WIDTH}
        //       fill={comparisonSet.color}
        //       onMouseOver={e => {
        //         (handleMouseOver as any)(e, dream.text);
        //       }}
        //       opacity={checkedState[setIndex] ? (focusedComparison ? 0.2 : 1) : 0}
        //       onMouseOut={hideTooltip}
        //       onClick={() => {
        //         setFocusedComparison({
        //           x: endX,
        //           y: endY,
        //           color: comparisonSet.color,
        //           concepts: comparisonSet.comparisons[0].topCommonConceptIds,
        //           startRadius: getRadius(dream.text.length + news.text.length),
        //         });
        //       }}
        //     />
        //   );
        // });
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
            setPrevFocusedComparison(focusedComparison);
            setFocusedComparison(null);
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
