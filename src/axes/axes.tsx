import { Granularity } from "@kannydennedy/dreams-2020-types";
import { ScaleLinear } from "d3";
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
  xAxisLeftLabel?: string;
  xAxisCenterLabel?: string;
  yAxisTextLeft?: number;
  maxTimeDistance: number;
  tickScale: ScaleLinear<number, number, never>;
  opacity: number;
  granularity: Granularity;
  yRange: [number, number];
  xRange: [number, number];
  numTicks: number;
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
  xAxisCenterLabel,
  xAxisLeftLabel,
  granularity,
  xRange,
  yRange,
  numTicks,
}: AxesProps) {
  const leftGraphEdge = padding.LEFT;
  const rightGraphEdge = width - padding.RIGHT;
  const topGraphEdge = padding.TOP;
  const bottomGraphEdge = height - padding.BOTTOM;

  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  const intervalTick = tickScale(yRange[1]) / numTicks;

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
      {/* y-axis ticks */}
      {[...Array(numTicks)].map((_, i) => {
        const y = bottomGraphEdge - intervalTick * i;
        return (
          <g key={i}>
            <line
              x1={leftGraphEdge}
              y1={y}
              x2={leftGraphEdge - 5}
              y2={y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* background lines */}
            <line
              x1={leftGraphEdge}
              y1={y}
              x2={rightGraphEdge}
              y2={y}
              stroke={"#ccc"}
              strokeWidth={strokeWidth}
              strokeDasharray="2,2"
            />
            {/* label */}
            <text
              x={leftGraphEdge - 10 - yAxisTextLeftPadding}
              y={y + 5}
              textAnchor="end"
              fontSize={12}
              fill={strokeColor}
            >
              {((i * yRange[1]) / numTicks).toFixed(3)}
            </text>
          </g>
        );
      })}

      {/* yAxisTopLabel */}
      {topLabels.map((label, i) => {
        return (
          <text
            key={i}
            x={yAxisTextLeftPadding}
            y={20 * (i + 1)}
            fontSize="16"
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
            fontSize="16"
            fontWeight={500}
            fill={strokeColor}
          >
            {label}
          </text>
        );
      })}

      {/* xAxisLeftLabel */}
      <text
        x={leftGraphEdge}
        y={height - padding.BOTTOM + 20}
        fontFamily="Calibri"
        fontSize="16"
        fontWeight={500}
        fill={strokeColor}
      >
        {xAxisLeftLabel}
      </text>
      {/* xAxisCenterLabel */}
      <text
        x={width / 2 - 80}
        y={height - padding.BOTTOM + 20}
        fontFamily="Calibri"
        fontSize="16"
        fontWeight={500}
        fill={strokeColor}
      >
        {xAxisCenterLabel}
      </text>
      {/* xAxisRightLabel */}
      <text
        x={rightGraphEdge - 180}
        y={height - padding.BOTTOM + 20}
        fontFamily="Calibri"
        fontSize="16"
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
