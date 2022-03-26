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

const MILLISECONDS_IN_YEAR = 31536000000;
const Y_AXIS_PADDING = 50;
const TRIANGLE_HEIGHT = 10;

type GraphProps = {
  data: ComparisonData;
};

// const height =

function Graph({ data }: GraphProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width } = useComponentSize(chartContainerRef);
  const height: number = width ? Math.floor(width * 0.6) : 0;

  const scaleY = scaleLinear()
    .domain([0, 2 * MILLISECONDS_IN_YEAR])
    .range([0, height]);
  const scaleX = scaleLinear().domain([0, 2]).range([0, width]);

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

  return (
    <div>
      <div ref={chartContainerRef}>
        <svg width={width} height={height} ref={containerRef}>
          <Axes
            height={height}
            width={width}
            strokeWidth={LINE_WIDTH}
            paddingLeft={Y_AXIS_PADDING}
            triangleHeight={TRIANGLE_HEIGHT}
            strokeColor={"#333"}
          />

          {data.comparisons.map((comparison, i) => {
            const dream = data.dreams[comparison.dreamId];
            const news = data.news[comparison.newsId];
            return (
              <circle
                key={i}
                cx={scaleX(comparison.score)}
                cy={scaleY(
                  Math.abs(dream.date.getTime() - news.date.getTime())
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
