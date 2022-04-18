import { Focus, Point } from "../modules/types";
import { animated, useSpring, useChain, useSpringRef } from "react-spring";
import React from "react";
import { AnimatedText } from "./animated-text";
import { AnimatedLine } from "./animated-line";

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
  isFocused: boolean;
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
  isFocused,
}: SplitBallProps) => {
  // If the ball is focused, we want to make it bigger and have it fade in
  // If the ball is not focused, we want to make it smaller and have it fade out
  const startFocus: Focus = isFocused ? "unfocused" : "focused";
  const endFocus: Focus = isFocused ? "focused" : "unfocused";

  const ballSpreadPercentage = 0.5;
  const ballDistance = Math.floor(graphWidth * ballSpreadPercentage);
  const textRectWidth = Math.floor(graphWidth * 0.15);
  const lineLength = ballDistance / 2;

  const rectHeight = 40;

  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const positions = {
    unfocused: {
      moveIntoPlace: { cx: startX, cy: startY, r: startRadius },
      leftBallMove: { transform: "translateX(0%) scale(1) translateY(0%)", stroke: fill },
      rightBallMove: {
        transform: "translateX(0%) scale(1) translateY(0%)",
        stroke: fill,
      },
    },
    focused: {
      moveIntoPlace: { cx: endX, cy: endY, r: endRadius },
      leftBallMove: {
        transform: "translateX(-5%) scale(0.7) translateY(20%)",
        stroke: stroke,
      },
      rightBallMove: {
        transform: "translateX(34%) scale(0.7) translateY(20%)",
        stroke: stroke,
      },
    },
  };

  const moveRef = useSpringRef();

  const moveIntoPlaceProps = useSpring({
    from: positions[startFocus].moveIntoPlace,
    to: positions[endFocus].moveIntoPlace,
    config: { mass: 8, tension: 500, friction: 75, clamp: false },
    ref: moveRef,
  });

  const leftBallMoveRef = useSpringRef();

  const leftBallMoveProps = useSpring({
    from: positions[startFocus].leftBallMove,
    to: positions[endFocus].leftBallMove,
    config: { mass: 8, tension: 500, friction: isFocused ? 75 : 95, clamp: false },
    ref: leftBallMoveRef,
  });

  const rightBallMoveRef = useSpringRef();

  const rightBallMoveProps = useSpring({
    from: positions[startFocus].rightBallMove,
    to: positions[endFocus].rightBallMove,
    config: { mass: 8, tension: 500, friction: isFocused ? 75 : 95, clamp: false },
    ref: rightBallMoveRef,
  });

  const refOrder = isFocused
    ? [moveRef, leftBallMoveRef, rightBallMoveRef]
    : [rightBallMoveRef, leftBallMoveRef, moveRef];
  const animationOrder = isFocused ? [0, 1, 1] : [0, 0, 1];

  useChain(refOrder, animationOrder);

  const ySpread = graphHeight * 0.5;
  const ySpreadStart = endY - ySpread / 2;
  const spreadInterval = ySpread / (topCommonConcepts.length - 1);

  return (
    <>
      {isFocused &&
        topCommonConcepts.map((concept, i) => {
          return (
            <g>
              {/* Lines that lead from the left ball to the text */}
              <AnimatedLine
                leftStart={[endX, endY]}
                rightStart={[endX, endY]}
                leftEnd={[endX - lineLength, endY]}
                rightEnd={[
                  endX - textRectWidth / 2,
                  ySpreadStart + i * spreadInterval + rectHeight / 2,
                ]}
                stroke={"black"}
                clampLeft={false}
                clampRight={true}
              />
              {/* Lines that lead from the right ball to the text */}
              <AnimatedLine
                leftStart={[endX, endY]}
                rightStart={[endX, endY]}
                leftEnd={[
                  endX + textRectWidth / 2,
                  ySpreadStart + i * spreadInterval + rectHeight / 2,
                ]}
                rightEnd={[endX + lineLength, endY]}
                stroke={"black"}
                clampLeft={true}
                clampRight={false}
              />
              <AnimatedText
                startPoint={[endX, endY]}
                endPoint={[endX, ySpreadStart + i * spreadInterval]}
                fill={fill}
                conceptText={concept}
                key={i}
                fontSize={24}
                fontWeight={500}
                rectWidth={textRectWidth}
                rectHeight={rectHeight}
              />
            </g>
          );
        })}
      {/* Left ball */}
      <animated.circle
        {...moveIntoPlaceProps}
        style={leftBallMoveProps}
        strokeWidth={strokeWidth}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        fill={fill}
      />

      {/* Right ball */}
      <animated.circle
        {...moveIntoPlaceProps}
        style={rightBallMoveProps}
        strokeWidth={strokeWidth}
        fill={fill}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      />
    </>
  );
};
