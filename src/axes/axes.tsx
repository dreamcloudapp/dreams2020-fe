import { Granularity } from "@kannydennedy/dreams-2020-types";
import { ScaleLinear } from "d3";
import { changeHslLightness } from "../modules/colorHelpers";
import { Padding } from "../modules/ui-types";
import { Triangle } from "./triangle";

const splitLabel = (text: string): string[] => {
  const parts = text.split(" ");
  return [parts.slice(0, 4).join(" "), parts.slice(4, parts.length).join(" ")];
};

type AxesProps = {
  height: number;
  width: number;
  strokeWidth: number;
  padding: Padding;
  triangleHeight: number;
  strokeColor: string;
  yAxisTopLabel?: string;
  yAxisBottomLabel?: string;
  xAxisRightLabel?: string;
  yAxisTextLeft?: number;
  maxTimeDistance: number;
  tickScale: ScaleLinear<number, number, never>;
  opacity: number;
  granularity: Granularity;
};

function Axes({
  height,
  width,
  strokeWidth,
  triangleHeight,
  strokeColor,
  yAxisTopLabel,
  yAxisBottomLabel,
  padding,
  yAxisTextLeft,
  xAxisRightLabel,
  maxTimeDistance,
  tickScale,
  opacity,
  granularity,
}: AxesProps) {
  const leftGraphEdge = padding.LEFT;
  const rightGraphEdge = width - padding.RIGHT;
  const topGraphEdge = padding.TOP;
  const bottomGraphEdge = height - padding.BOTTOM;

  // x intervals before, x intervals after, and 'same time'.
  const numVerticalTicks = maxTimeDistance * 2 + 1;

  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  const intervalTick = tickScale(1);

  return (
    <g opacity={opacity}>
      {/* x-Axis section before label */}
      <line
        x1={leftGraphEdge}
        y1={height - padding.BOTTOM}
        x2={rightGraphEdge}
        y2={height - padding.BOTTOM}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* y-Axis */}
      <line
        x1={leftGraphEdge}
        y1={topGraphEdge}
        x2={leftGraphEdge}
        y2={bottomGraphEdge}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* yAxisTopLabel */}
      {topLabels.map((label, i) => {
        return (
          <text
            key={i}
            x={yAxisTextLeftPadding}
            y={20 * (i + 1)}
            fontFamily="Lato"
            fontSize="14"
            fontWeight={500}
            fill={strokeColor}
          >
            {label}
          </text>
        );
      })}

      {/* yAxisBottomLabel */}
      {bottomLabels.map((label, i) => {
        return (
          <text
            key={i}
            x={yAxisTextLeftPadding}
            y={height - 30 + 20 * i}
            fontFamily="Lato"
            fontSize="14"
            fontWeight={500}
            fill={strokeColor}
          >
            {label}
          </text>
        );
      })}

      {/* xAxisRightLabel */}
      <text
        x={rightGraphEdge + triangleHeight + 5}
        y={height / 2 + 5}
        fontFamily="Lato"
        fontSize="14"
        fontWeight={500}
        fill={strokeColor}
      >
        {xAxisRightLabel}
      </text>
      {/* Top y-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"N"}
        x={leftGraphEdge - triangleHeight / 2}
        y={topGraphEdge - triangleHeight}
        fill={strokeColor}
      />
      {/* x-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"E"}
        x={rightGraphEdge}
        y={height - padding.BOTTOM - triangleHeight / 2}
        fill={strokeColor}
      />
    </g>
  );
}

export default Axes;
