import { Granularity } from "@kannydennedy/dreams-2020-types";
import { ScaleLinear } from "d3";
import { Padding } from "../modules/ui-types";
import { Triangle } from "./triangle";

const splitLabel = (text: string): string[] => {
  const parts = text.split(" ");
  return [parts.slice(0, 4).join(" "), parts.slice(4, parts.length).join(" ")];
};

const BOTTOM_LABEL_PADDING = 90;

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
  numTicksX?: number;
  barWidth?: number;
  barGap?: number;
  xTickModulo?: number;
  xAxisFormat?: (d: number) => string;
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
  numTicksX = 10,
  barWidth,
  barGap,
  xTickModulo = 1,
  xAxisFormat = d => d.toString(),
}: AxesProps) {
  const leftGraphEdge = padding.LEFT;
  const rightGraphEdge = width - padding.RIGHT;
  const topGraphEdge = padding.TOP;
  const bottomGraphEdge = height - padding.BOTTOM;

  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  const intervalTick = tickScale(yRange[1]) / numTicks;

  // X axis calculations
  const numRawXTicks = Math.abs(xRange[1] - xRange[0]);
  const xTickInterval = (width - padding.LEFT - padding.RIGHT) / numRawXTicks;

  return (
    <g opacity={opacity}>
      {/* x-Axis line */}
      <line
        x1={leftGraphEdge}
        y1={height - padding.BOTTOM}
        x2={rightGraphEdge}
        y2={height - padding.BOTTOM}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* x-axis ticks */}
      {/* We use xRange and numTicksX */}
      {[...Array(numRawXTicks)].map((_, i) => {
        const barOffset = barWidth ? barWidth / 2 : 0;
        const xTickValue = i + xRange[0];

        if (xTickValue % xTickModulo !== 0) {
          return null;
        }

        return (
          <g>
            <line
              x1={leftGraphEdge + i * xTickInterval + barOffset}
              x2={leftGraphEdge + i * xTickInterval + barOffset}
              y1={height - padding.BOTTOM}
              y2={height - padding.BOTTOM + 5}
              stroke={"#AAA"}
              strokeWidth={strokeWidth}
            />
            {/* Tick text, rotated 45 degrees */}
            <text
              x={leftGraphEdge + i * xTickInterval + barOffset}
              y={height - padding.BOTTOM + 20}
              transform={`rotate(45, ${leftGraphEdge + i * xTickInterval + barOffset}, ${
                height - padding.BOTTOM + 20
              })`}
              textAnchor="start"
              fontSize={12}
              fill={"#AAA"}
            >
              {xAxisFormat(xTickValue)}
            </text>
          </g>
        );
      })}

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
            y={height - 70 + 20 * i}
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
        y={height - padding.BOTTOM + BOTTOM_LABEL_PADDING}
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
        y={height - padding.BOTTOM + BOTTOM_LABEL_PADDING}
        fontFamily="Calibri"
        fontSize="16"
        fontWeight={500}
        fill={strokeColor}
      >
        {xAxisCenterLabel}
      </text>
      {/* xAxisRightLabel */}
      <text
        x={rightGraphEdge - 210}
        y={height - padding.BOTTOM + BOTTOM_LABEL_PADDING}
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
