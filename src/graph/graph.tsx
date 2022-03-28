import { useRef } from "react";
import useComponentSize from "@rehooks/component-size";
import { scaleLinear } from "d3";
import { ComparisonData } from "../modules/types";
import {
  useTooltip,
  useTooltipInPortal,
  //   TooltipWithBounds,
} from "@visx/tooltip";
import { localPoint } from "@visx/event";
import Axes from "./axes";
import { Padding } from "../modules/ui-types";

type GraphProps = {
  data: ComparisonData;
};

const MILLISECONDS_IN_YEAR = 31536000000;
const TRIANGLE_HEIGHT = 10;
const graphPadding: Padding = { LEFT: 60, RIGHT: 20, TOP: 30, BOTTOM: 30 };

// const height =

function Graph({ data }: GraphProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  //   let { width, height } = useComponentSize(chartContainerRef);
  let { width, height } = useComponentSize(chartContainerRef);

  console.log("height:", height);

  // For scaleY, the time difference between a dream and a news source is max one year
  // So we only scale for that, but just reflect it around the X axis in getYAxisPosition
  const scaleY = scaleLinear()
    .domain([MILLISECONDS_IN_YEAR * -1, MILLISECONDS_IN_YEAR])
    .range([0, height]);

  const scaleX = scaleLinear()
    .domain([0, 2])
    .range([graphPadding.LEFT, width - graphPadding.RIGHT]);

  const defaultColor = "red";
  const otherColor = "blue";
  const LINE_WIDTH = 1;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

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

  const getYAxisPosition = (dreamDateTime: number, newsDateTime: number) => {
    // If this number is negative, the dream happened before the news
    // If it's positive, the dream happened after the news
    const distance = dreamDateTime - newsDateTime;
    const multiplier = distance < 0 ? -1 : 1;
    const absoluteGraphDistance = scaleY(distance);
    // if (Math.random() > 0.999) {
    //   console.log(absoluteGraphDistance);
    // }
    // if (Math.abs(distance) > MILLISECONDS_IN_YEAR) {
    //   console.log("WTFFFF");
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
            yAxisTopLabel={"12 Months before"}
            yAxisBottomLabel={"12 Months after"}
            yAxisTextLeft={5}
          />

          {data.comparisons.map((comparison, i) => {
            const dream = data.dreamCollection.dreams[comparison.dreamId];
            const news = data.newsCollection.news[comparison.newsId];
            return (
              <circle
                key={i}
                cx={scaleX(comparison.score)}
                cy={getYAxisPosition(dream.date.getTime(), news.date.getTime())}
                r={Math.floor((dream.text.length + news.text.length) / 100)}
                stroke={
                  comparison.dataLabel === "2020" ? defaultColor : otherColor
                }
                strokeWidth={LINE_WIDTH}
                fill={"white"}
                onMouseOver={(e) => {
                  (handleMouseOver as any)(e, dream.text);
                }}
                onMouseOut={hideTooltip}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>
      </div>
      <p style={{ color: otherColor }}>2010 dreams</p>
      <p style={{ color: defaultColor }}>2020 dreams</p>
      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div style={{ maxWidth: 300 }}>
            <strong>{tooltipData}</strong>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default Graph;
