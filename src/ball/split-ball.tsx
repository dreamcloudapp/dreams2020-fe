import { Point } from "../modules/types";
import { animated, useSpring, useChain, useSpringRef } from "react-spring";
import React from "react";
import { AnimatedText } from "./animated-text";

type SplitBallProps = {
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
  topCommonConcepts: string[];
  graphHeight: number;
  graphWidth: number;
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
  topCommonConcepts,
  graphHeight,
  graphWidth,
}: SplitBallProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const moveRef = useSpringRef();

  const moveProps = useSpring({
    to: { cx: endX, cy: endY, r: endRadius },
    from: { cx: startX, cy: startY, r: startRadius },
    config: { mass: 8, tension: 500, friction: 65, clamp: false, delay: 1000 },
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
    to: { transform: "translateX(34%) scale(0.7) translateY(20%)" },
    from: { transform: "translateX(0%) scale(1) translateY(0%)" },
    config: { mass: 10, tension: 500, friction: 85, clamp: false },
    ref: moveRightRef,
  });

  useChain([moveRef, moveLeftRef, moveRightRef], [0, 1, 1]);

  const ySpread = graphHeight * 0.5;
  const ySpreadStart = endY - ySpread / 2;
  const spreadInterval = ySpread / (topCommonConcepts.length - 1);

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

      {topCommonConcepts.map((concept, i) => {
        return (
          <AnimatedText
            startPoint={[endX, endY]}
            endPoint={[endX, ySpreadStart + i * spreadInterval]}
            fill={fill}
            conceptText={concept}
            key={i}
            fontSize={24}
            fontWeight={500}
            graphWidth={graphWidth}
          />
        );
      })}

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
