import { Point } from "../../types/types";
import { animated, useSpring } from "react-spring";

type BubbleProps = {
  r: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  onMouseOver: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  onMouseOut: () => void;
  onClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  startPoint: Point;
  endPoint: Point;
  opacity: number;
};

export const Bubble = ({
  r,
  stroke,
  strokeWidth,
  fill,
  onMouseOver,
  onMouseOut,
  startPoint,
  endPoint,
  opacity,
  onClick,
}: BubbleProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const moveIntoPlaceSpring = useSpring({
    to: { cx: endX, cy: endY },
    from: { cx: startX, cy: startY },
    config: { mass: 5, tension: 500, friction: 65, clamp: false },
  });

  return (
    <animated.circle
      {...moveIntoPlaceSpring}
      r={r}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      opacity={opacity}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    />
  );
};
