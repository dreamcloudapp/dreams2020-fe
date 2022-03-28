import { useRef } from "react";
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

type GraphProps = {
  data: ComparisonSets;
};

const MILLISECONDS_IN_YEAR = 31536000000;
const TRIANGLE_HEIGHT = 10;
const graphPadding: Padding = { LEFT: 60, RIGHT: 70, TOP: 30, BOTTOM: 30 };

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

  const colorSets = [defaultColor, otherColor];

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
            yAxisTopLabel={"Dream earlier in the year than news"}
            yAxisBottomLabel={"Dream later in the year than news"}
            xAxisRightLabel={"Similarity"}
            yAxisTextLeft={5}
          />

          {data.comparisonSets.map((comparisonSet) => {
            return comparisonSet.comparisons.map((comparison, i) => {
              const dream =
                comparisonSet.dreamCollection.dreams[comparison.dreamId];
              const news = comparisonSet.newsCollection.news[comparison.newsId];
              return (
                <circle
                  key={i}
                  cx={scaleX(comparison.score)}
                  cy={getYAxisPosition(
                    dream.date.getTime(),
                    news.date.getTime()
                  )}
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
            });
          })}
        </svg>
      </div>
      {/* Legend */}
      {data.comparisonSets.map((s, i) => {
        return <p style={{ color: colorSets[i] }}>{s.label}</p>;
      })}

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
