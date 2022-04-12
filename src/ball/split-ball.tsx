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
    config: { mass: 10, tension: 500, friction: 65, clamp: false },
    ref: moveRef,
  });

  const moveLeftRef = useSpringRef();

  const moveLeftProps = useSpring({
    // to: { cx: 100, cy: 100, r: endRadius / 2 },
    // from: { cx: 1, cy: 2, r: endRadius },
    to: { transform: "translateX(-500px)" },
    from: { transform: "translateX(0px)" },
    config: { mass: 10, tension: 500, friction: 65, clamp: false },
    ref: moveLeftRef,
  });

  useChain([moveRef, moveLeftRef], [0, 1]);

  return (
    <>
      <animated.circle
        // ref={circle1Ref}
        {...moveProps}
        style={moveLeftProps}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        // opacity={opacity}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        // style={{ cursor: "pointer" }}
        onClick={onClick}
      />
    </>
  );
};
