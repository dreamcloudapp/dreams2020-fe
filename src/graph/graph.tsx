import { useRef, useState } from "react";
import useComponentSize from "@rehooks/component-size";
import { scaleLinear } from "d3";
import { ComparisonSets } from "../modules/types";
import {
  useTooltip,
  useTooltipInPortal,
  //   TooltipWithBounds,
} from "@visx/tooltip";
import { localPoint } from "@visx/event";
import Axes from "./axes";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import Legend from "./legend";

type GraphProps = {
  data: ComparisonSets;
  maxTimeDistance: number; // We only show comparisons that fall within this range
};

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;
const graphPadding: Padding = { LEFT: 90, RIGHT: 90, TOP: 50, BOTTOM: 50 };

function Graph({ data, maxTimeDistance }: GraphProps) {
  const comparisonSetLabels: String[] = data.comparisonSets.map(s => s.label);

  // console.log(`max time distance is ${millisecondsToYear(maxTimeDistance)} year(s)`);

  const [checkedState, setCheckedState] = useState(
    [...new Array(comparisonSetLabels.length)].map(_ => true)
  );

  const handleOnChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width, height } = useComponentSize(chartContainerRef);

  // For scaleY, the time difference between a dream and a news source is max one year
  // So we only scale for that, but just reflect it around the X axis in getYAxisPosition
  const scaleY = scaleLinear()
    .domain([maxTimeDistance * -1, maxTimeDistance])
    .range([0, height - graphPadding.TOP - graphPadding.BOTTOM]);

  const scaleX = scaleLinear()
    .domain([0, 2])
    .range([graphPadding.LEFT, width - graphPadding.RIGHT]);

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip();

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  const handleMouseOver = (event: any, datum: any) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: datum,
    });
  };

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
    // if (Math.random() > 0.999) {
    //   console.log(`News distance is ${millisecondsToYear(newsTimeDistance)} year(s)`);
    //   console.log(
    //     `news date: ${new Date(newsDateTime)}, period start: ${new Date(
    //       newsCollectionTimePeriodStart
    //     )}`
    //   );
    // }

    // 2) Get the distance between the dream and its year start
    const dreamTimeDistance = dreamDateTime - dreamCollectionTimePeriodStart;

    // 3) Get the distance between these distances

    // If this number is negative, the dream happened before the news
    // If it's positive, the dream happened after the news
    const distance = dreamTimeDistance - newsTimeDistance;

    const absoluteGraphDistance = scaleY(distance);
    // if (Math.random() > 0.999) {
    //   console.log(`WTF distance is ${millisecondsToYear(distance)} year(s)`);
    // }
    // if (Math.abs(distance) > maxTimeDistance) {
    //   console.log(`WTF distance is ${millisecondsToYear(distance)} year(s)`);
    // }

    return absoluteGraphDistance;
  };

  return (
    <div style={{ height: "100%" }}>
      <div ref={chartContainerRef} style={{ height: "100%" }}>
        <svg width={width} height={height} ref={containerRef}>
          <Axes
            height={height}
            width={width}
            strokeWidth={LINE_WIDTH}
            padding={graphPadding}
            triangleHeight={TRIANGLE_HEIGHT}
            strokeColor={"#333"}
            yAxisTopLabel={"Dream earlier in the year than news"}
            yAxisBottomLabel={"Dream later in the year than news"}
            xAxisRightLabel={"Similarity"}
            yAxisTextLeft={30}
          />

          {data.comparisonSets
            .filter((_, i) => checkedState[i])
            .map((comparisonSet, setIndex) => {
              return comparisonSet.comparisons.map((comparison, i) => {
                const { dreamCollection, newsCollection } = comparisonSet;

                const dream = dreamCollection.dreams[comparison.dreamId];
                const news = newsCollection.news[comparison.newsId];
                return (
                  <circle
                    key={i}
                    cx={scaleX(comparison.score)}
                    cy={
                      graphPadding.TOP +
                      getYAxisPosition(
                        dream.date.getTime(),
                        news.date.getTime(),
                        dreamCollection.timePeriodStartDate.getTime(),
                        newsCollection.timePeriodStartDate.getTime()
                      )
                    }
                    r={Math.floor((dream.text.length + news.text.length) / 100)}
                    stroke={changeHslLightness(comparisonSet.color, -10)}
                    strokeWidth={LINE_WIDTH}
                    fill={comparisonSet.color}
                    onMouseOver={e => {
                      (handleMouseOver as any)(e, dream.text);
                    }}
                    onMouseOut={hideTooltip}
                    style={{ cursor: "pointer" }}
                  />
                );
              });
            })}
        </svg>
      </div>
      {/* Legend */}
      <Legend data={data} handleCheck={handleOnChange} checkedState={checkedState} />

      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div style={{ maxWidth: 300, fontFamily: "Lato", fontWeight: 400 }}>
            <strong>{tooltipData}</strong>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default Graph;
