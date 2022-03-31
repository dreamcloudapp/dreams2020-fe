import { scaleLinear } from "d3";
import { ComparisonSets } from "../modules/types";
import Axes from "./axes";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import { Ball } from "./ball";

type GraphProps = {
  data: ComparisonSets;
  maxTimeDistance: number; // We only show comparisons that fall within this range
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  checkedState: boolean[];
  hideTooltip: () => void;
};

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;
const graphPadding: Padding = { LEFT: 90, RIGHT: 90, TOP: 50, BOTTOM: 50 };

function Graph({
  data,
  width,
  height,
  maxTimeDistance,
  handleMouseOver,
  checkedState,
  hideTooltip,
}: GraphProps) {
  // For scaleY, the time difference between a dream and a news source is max one year
  // So we only scale for that, but just reflect it around the X axis in getYAxisPosition
  const scaleY = scaleLinear()
    .domain([maxTimeDistance * -1, maxTimeDistance])
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  // Same as scale y, but all positive inputs
  const tickScale = scaleLinear()
    .domain([0, maxTimeDistance * 2])
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  const scaleX = scaleLinear()
    .domain([0, 2])
    .range([graphPadding.LEFT, width - graphPadding.RIGHT]);

  // Basically we need to:
  // 1) Get the distance between the news and its year start
  // 2) Get the distance between the dream and its year start
  // 3) Get the distance between these distances
  const getYAxisPosition = (
    dreamDateTime: number,
    newsDateTime: number,
    dreamCollectionTimePeriodStart: number,
    newsCollectionTimePeriodStart: number
  ) => {
    // 1) Get the distance between the news and its year start
    const newsTimeDistance = newsDateTime - newsCollectionTimePeriodStart;

    // 2) Get the distance between the dream and its year start
    const dreamTimeDistance = dreamDateTime - dreamCollectionTimePeriodStart;

    // 3) Get the distance between these distances
    // If this number is negative, the dream happened before the news
    // If it's positive, the dream happened after the news
    const distance = dreamTimeDistance - newsTimeDistance;

    const absoluteGraphDistance = scaleY(distance);
    return absoluteGraphDistance;
  };

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
      />

      {data.comparisonSets.map((comparisonSet, setIndex) => {
        return comparisonSet.comparisons.map((comparison, i) => {
          const { dreamCollection, newsCollection } = comparisonSet;

          const dream = dreamCollection.dreams[comparison.dreamId];
          const news = newsCollection.news[comparison.newsId];

          const endX = scaleX(comparison.score);
          const endY =
            graphPadding.TOP +
            getYAxisPosition(
              dream.date.getTime(),
              news.date.getTime(),
              dreamCollection.timePeriodStartDate.getTime(),
              newsCollection.timePeriodStartDate.getTime()
            );

          const startPoint: [number, number] = [width / 2, height / 2];
          // const startPoint: [number, number] = [536.5, 300];

          // console.log(startPoint);

          return (
            <Ball
              startPoint={startPoint}
              endPoint={[endX, endY]}
              key={i}
              r={Math.floor((dream.text.length + news.text.length) / 100)}
              stroke={changeHslLightness(comparisonSet.color, -10)}
              strokeWidth={LINE_WIDTH}
              fill={comparisonSet.color}
              onMouseOver={e => {
                (handleMouseOver as any)(e, dream.text);
              }}
              opacity={checkedState[setIndex] ? 1 : 0}
              onMouseOut={hideTooltip}
            />
          );
        });
      })}
    </svg>
  );
}

export default Graph;
