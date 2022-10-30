import { useSelector } from "react-redux";
import Axes from "./axes";
import { selectActiveGranularity } from "../ducks/ui";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import "../App.css";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type XYAxisProps = {
  width: number;
  height: number;
  padding: Padding;
  hasMidpointLine?: boolean;
  xAxisRightLabel?: string;
  xAxisLeftLabel?: string;
  xAxisCenterLabel?: string;
  yRange: [number, number];
  xRange: [number, number];
  numTicks?: number;
  barWidth?: number;
  barGap?: number;
  xTickModulo?: number;
  xAxisFormat?: (d: number) => string;
};

export function XYAxis({
  height,
  width,
  padding,
  hasMidpointLine = false,
  xAxisRightLabel = "Dream occured after the news →",
  xAxisLeftLabel = "← Dream occured before the news",
  xAxisCenterLabel = "Dream on same day as news",
  yRange,
  xRange,
  numTicks = 10,
  barWidth,
  barGap,
  xTickModulo,
  xAxisFormat,
}: XYAxisProps) {
  const activeGranularity = useSelector(selectActiveGranularity);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  return (
    <>
      {/* GRID */}
      <Axes
        height={height}
        width={width}
        padding={padding}
        strokeColor={"hsl(0, 0%, 0%)"}
        opacity={0.9}
        strokeWidth={LINE_WIDTH}
        triangleHeight={TRIANGLE_HEIGHT}
        tickScale={scaleLinear()
          .domain(yRange)
          .range([0, height - padding.BOTTOM - padding.TOP])}
        granularity={activeGranularity}
        maxTimeDistance={1}
        yAxisTopLabel="Similarity"
        xAxisRightLabel={width < 900 ? "" : xAxisRightLabel}
        xAxisLeftLabel={width < 900 ? "" : xAxisLeftLabel}
        xAxisCenterLabel={xAxisCenterLabel}
        yRange={yRange}
        xRange={xRange}
        numTicks={numTicks}
        barWidth={barWidth}
        barGap={barGap}
        xTickModulo={xTickModulo}
        xAxisFormat={xAxisFormat}
      />
      {/* MIDPOINT LINE */}
      {hasMidpointLine && (
        <g>
          <line
            x1={midpoint}
            y1={padding.TOP}
            x2={midpoint}
            y2={height - padding.BOTTOM}
            stroke={"#444"}
            strokeWidth={1}
          />
        </g>
      )}
    </>
  );
}
