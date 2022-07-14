import { Granularity } from "@kannydennedy/dreams-2020-types";
import { ScaleLinear } from "d3";
import { changeHslLightness } from "../modules/colorHelpers";
import { Padding } from "../modules/ui-types";
import { Triangle } from "../axes/triangle";

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
      {/* Grid */}
      {/* hGrid */}
      {[...new Array(numVerticalTicks)].map((_, i) => {
        const linePosition = topGraphEdge + i * intervalTick;
        return (
          <line
            key={i}
            x1={leftGraphEdge}
            y1={linePosition}
            x2={rightGraphEdge}
            y2={linePosition}
            stroke={changeHslLightness(strokeColor, 70)}
          />
        );
      })}

      {/* x-Axis section before label */}
      <line
        x1={leftGraphEdge}
        y1={height / 2}
        x2={rightGraphEdge}
        y2={height / 2}
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

      {/* Month ticks */}
      {[...new Array(numVerticalTicks)].map((_, i) => {
        // No tick in zero position, there's an arrow there
        const tickPosition = topGraphEdge + i * intervalTick;

        const midPoint = Math.floor(numVerticalTicks / 2);

        const axisNum = Math.abs(i - midPoint);
        const sameMonth = axisNum === 0;

        const text = sameMonth ? "Same time" : `${axisNum} ${granularity}s`;

        return (
          <g key={`tick-${i}`}>
            {i > 0 && i < numVerticalTicks - 1 && (
              <line
                x1={leftGraphEdge - 7}
                y1={tickPosition}
                x2={leftGraphEdge}
                y2={tickPosition}
                stroke={changeHslLightness(strokeColor, 40)}
                strokeWidth={strokeWidth}
              />
            )}
            {i % 2 === 0 && (
              <text
                key={i}
                x={sameMonth ? 20 : leftGraphEdge - (axisNum > 9 ? 70 : 65)}
                y={tickPosition + 3} // + 3 to account for text centring
                fontFamily="Calibri"
                fontSize="11"
                fontWeight={300}
                fill={changeHslLightness(strokeColor, 30)}
                // color={changeHslLightness(strokeColor, 40)}
              >
                {text}
              </text>
            )}
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
            fontFamily="Calibri"
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
            fontFamily="Calibri"
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
        fontFamily="Calibri"
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
      {/* Bottom y-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"S"}
        x={leftGraphEdge - triangleHeight / 2}
        y={bottomGraphEdge}
        fill={strokeColor}
      />
      {/* x-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"E"}
        x={rightGraphEdge}
        y={height / 2 - triangleHeight / 2}
        fill={strokeColor}
      />
    </g>
  );
}

export default Axes;
