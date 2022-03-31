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
  strokeColor?: string;
  yAxisTopLabel?: string;
  yAxisBottomLabel?: string;
  xAxisRightLabel?: string;
  yAxisTextLeft?: number;
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
}: AxesProps) {
  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  const topLabels = splitLabel(yAxisTopLabel || "");
  const bottomLabels = splitLabel(yAxisBottomLabel || "");

  return (
    <>
      {/* x-Axis section before label */}
      <line
        x1={padding.LEFT}
        y1={height / 2}
        x2={width - padding.RIGHT}
        y2={height / 2}
        stroke={strokeColor || "#000"}
        strokeWidth={strokeWidth}
      />
      {/* y-Axis */}
      <line
        x1={0 + padding.LEFT}
        y1={padding.TOP}
        x2={0 + padding.LEFT}
        y2={height - padding.BOTTOM}
        stroke={strokeColor || "#000"}
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
            fontFamily="Lato"
            fontSize="16"
            fontWeight={500}
            fill={strokeColor}
          >
            {label}
          </text>
        );
      })}

      {/* xAxisRightLabel */}
      <text
        x={width - padding.RIGHT + 5}
        y={height / 2 + 5}
        fontFamily="Lato"
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
        x={padding.LEFT - triangleHeight / 2}
        y={padding.TOP}
        fill={strokeColor || "#000"}
      />
      {/* Bottom y-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"S"}
        x={padding.LEFT - triangleHeight / 2}
        y={height - triangleHeight - padding.BOTTOM}
        fill={strokeColor || "#000"}
      />
      {/* x-Axis triangle */}
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"E"}
        x={width - triangleHeight - padding.RIGHT}
        y={height / 2 - triangleHeight / 2}
        fill={strokeColor || "#000"}
      />
    </>
  );
}

export default Axes;
