import { Point } from "../modules/types";
import { animated, useSpring, useChain, useSpringRef } from "react-spring";
import React from "react";

type BallProps = {
  stroke: string;
  fill: string;
  strokeWidth: number;
  onMouseOver: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  onMouseOut: () => void;
  onClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  startPoint: Point;
  endPoint: Point;
  opacity: number;
  startRadius: number;
  endRadius: number;
};

export const SplitBall = ({
  startRadius,
  endRadius,
  stroke,
  strokeWidth,
  fill,
  onMouseOver,
  onMouseOut,
  startPoint,
  endPoint,
  opacity,
  onClick,
}: BallProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const moveRef = useSpringRef();

  const moveProps = useSpring({
    to: { cx: endX, cy: endY, r: endRadius },
    from: { cx: startX, cy: startY, r: startRadius },
    config: { mass: 10, tension: 500, friction: 65, clamp: false, delay: 1000 },
    ref: moveRef,
  });

  const moveLeftRef = useSpringRef();

  const moveLeftProps = useSpring({
    to: { transform: "translateX(-5%) scale(0.7) translateY(20%)" },
    from: { transform: "translateX(0%) scale(1) translateY(0%)" },
    config: { mass: 10, tension: 500, friction: 85, clamp: false },
    ref: moveLeftRef,
  });

  const moveRightRef = useSpringRef();

  const moveRightProps = useSpring({
    to: { transform: "translateX(30%) scale(0.7) translateY(20%)" },
    from: { transform: "translateX(0%) scale(1) translateY(0%)" },
    config: { mass: 10, tension: 500, friction: 85, clamp: false },
    ref: moveRightRef,
  });

  useChain([moveRef, moveLeftRef, moveRightRef], [0, 1, 1]);

  return (
    <>
      <animated.circle
        {...moveProps}
        style={moveLeftProps}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      />
      <animated.circle
        {...moveProps}
        style={moveRightProps}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      />
    </>
  );
};
