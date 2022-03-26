import { Triangle } from "./triangle";

type AxesProps = {
  height: number;
  width: number;
  strokeWidth: number;
  paddingLeft: number;
  triangleHeight: number;
  strokeColor?: string;
};

function Axes({
  height,
  width,
  strokeWidth,
  paddingLeft,
  triangleHeight,
  strokeColor,
}: AxesProps) {
  return (
    <>
      <line
        x1={0 + paddingLeft}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke={strokeColor || "#000"}
        strokeWidth={strokeWidth}
      />
      {/* y-Axis */}
      <line
        x1={0 + paddingLeft}
        y1={0}
        x2={0 + paddingLeft}
        y2={height}
        stroke={strokeColor || "#000"}
        strokeWidth={strokeWidth}
      />
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"N"}
        x={paddingLeft - triangleHeight / 2}
        y={0}
        fill={strokeColor || "#000"}
      />
      <Triangle
        height={triangleHeight}
        width={triangleHeight}
        orientation={"S"}
        x={paddingLeft - triangleHeight / 2}
        y={height - triangleHeight}
        fill={strokeColor || "#000"}
      />
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
