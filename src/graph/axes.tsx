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
};

const MONTHS_IN_YEAR = 12;
const APPROX_WEEKS_IN_MONTH = 4;

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
  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  const monthTick = tickScale(maxTimeDistance / MONTHS_IN_YEAR);
  const weekTick = tickScale(maxTimeDistance / (MONTHS_IN_YEAR * APPROX_WEEKS_IN_MONTH));

  const numMonthGridLines = 25;

  return (
    <>
      {/* Grid */}
      {/* hGrid */}
      {[...new Array(numMonthGridLines)].map((_, i) => {
        const linePosition = padding.TOP + i * monthTick;
        return (
          <line
            x1={padding.LEFT}
            y1={linePosition}
            x2={width - padding.RIGHT}
            y2={linePosition}
            stroke={changeHslLightness(strokeColor, 70)}
          />
        );
      })}

      {/* x-Axis section before label */}
      <line
        x1={padding.LEFT}
        y1={height / 2}
        x2={width - padding.RIGHT}
        y2={height / 2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* y-Axis */}
      <line
        x1={padding.LEFT}
        y1={padding.TOP}
        x2={padding.LEFT}
        y2={height - padding.BOTTOM}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Ticks */}
      {[...new Array(23)].map((_, i) => {
        // No tick in zero position, there's an arrow there
        const tickPosition = padding.TOP + (i + 1) * monthTick;

        return (
          <g key={`tick-${i}`}>
            <line
              x1={padding.LEFT - 7}
              y1={tickPosition}
              x2={padding.LEFT}
              y2={tickPosition}
              stroke={changeHslLightness(strokeColor, 40)}
              strokeWidth={strokeWidth}
            />
            <text
              key={i}
              x={padding.LEFT - 30}
              y={tickPosition + 3} // + 3 to account for text centring
              fontFamily="Lato"
              fontSize="12"
              fontWeight={300}
              fill={strokeColor}
            >
              x
            </text>
          </g>
        );
      })}

      {[...new Array(95)].map((_, i) => {
        // No tick in zero position, there's an arrow there
        const tickPosition = padding.TOP + (i + 1) * weekTick;

        return (
          <g key={`tick-${i}`}>
            <line
              x1={padding.LEFT - 3}
              y1={tickPosition}
              x2={padding.LEFT}
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
        x={width - padding.RIGHT + triangleHeight + 5}
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
        x={padding.LEFT - triangleHeight / 2}
        y={padding.TOP - triangleHeight}
        fill={strokeColor || "#000"}
      />
      {/* Bottom y-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"S"}
        x={padding.LEFT - triangleHeight / 2}
        y={height - padding.BOTTOM}
        fill={strokeColor || "#000"}
      />
      {/* x-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"E"}
        x={width - padding.RIGHT}
        y={height / 2 - triangleHeight / 2}
        fill={strokeColor || "#000"}
      />
    </>
  );
}

export default Axes;
