import { Padding } from "../modules/ui-types";
import { Triangle } from "./triangle";

type AxesProps = {
  height: number;
  width: number;
  strokeWidth: number;
  padding: Padding;
  triangleHeight: number;
  strokeColor?: string;
  yAxisTopLabel?: string;
  yAxisBottomLabel?: string;
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
}: AxesProps) {
  const yAxisTextLeftPadding = yAxisTextLeft || 0;

  return (
    <>
      {/* x-Axis */}
      <line
        x1={padding.LEFT}
        y1={height / 2}
        x2={width}
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
      <text
        x={yAxisTextLeftPadding}
        y={20}
        fontFamily="Arial"
        fontSize="16"
        fontWeight={500}
        fill={strokeColor}
      >
        {yAxisTopLabel}
      </text>
      <text
        x={yAxisTextLeftPadding}
        y={height - 10}
        fontFamily="Arial"
        fontSize="16"
        fontWeight={500}
        fill={strokeColor}
      >
        {yAxisBottomLabel}
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
        x={width - triangleHeight}
        y={height / 2 - triangleHeight / 2}
        fill={strokeColor || "#000"}
      />
    </>
  );
}

export default Axes;
