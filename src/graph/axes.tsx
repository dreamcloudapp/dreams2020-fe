import { ScaleLinear } from "d3";
import { changeHslLightness } from "../modules/colorHelpers";
import { MILLISECONDS_IN_YEAR } from "../modules/constants";
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
};

const APPROX_MONTH_TIME = MILLISECONDS_IN_YEAR / 12;

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
}: AxesProps) {
  const leftGraphEdge = padding.LEFT;
  const rightGraphEdge = width - padding.RIGHT;
  const topGraphEdge = padding.TOP;
  const bottomGraphEdge = height - padding.BOTTOM;

  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  const monthTick = tickScale(APPROX_MONTH_TIME);
  const weekTick = tickScale(APPROX_MONTH_TIME / 4);

  const numMonthGridLines = 25;

  return (
    <>
      {/* Grid */}
      {/* hGrid */}
      {[...new Array(numMonthGridLines)].map((_, i) => {
        const linePosition = topGraphEdge + i * monthTick;
        return (
          <line
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
      {[...new Array(25)].map((_, i) => {
        // No tick in zero position, there's an arrow there
        const tickPosition = topGraphEdge + i * monthTick;

        const midPoint = Math.floor(25 / 2);

        const axisNum = Math.abs(i - midPoint);
        const sameMonth = axisNum === 0;

        const text = sameMonth ? "Same time" : `${axisNum} months`;

        return (
          <g key={`tick-${i}`}>
            {i > 0 && i < 24 && (
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
                fontFamily="Lato"
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

      {[...new Array(95)].map((_, i) => {
        // No tick in zero position, there's an arrow there
        const tickPosition = topGraphEdge + (i + 1) * weekTick;

        return (
          <g key={`tick-${i}`}>
            <line
              x1={leftGraphEdge - 3}
              y1={tickPosition}
              x2={leftGraphEdge}
              y2={tickPosition}
              stroke={changeHslLightness(strokeColor, 40)}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      })}

      {/* const weekTick = tickScale(monthTick / 4); */}

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
    </>
  );
}

export default Axes;
