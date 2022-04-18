import { Point } from "../modules/types";
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
  const ballSpreadPercentage = 0.5;
  const ballDistance = Math.floor(graphWidth * ballSpreadPercentage);
  const textRectWidth = Math.floor(graphWidth * 0.15);
  const lineLength = ballDistance / 2;

  const rectHeight = 40;

  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const moveRef = useSpringRef();

  const moveIntoPlaceProps = useSpring({
    to: { cx: endX, cy: endY, r: endRadius },
    from: { cx: startX, cy: startY, r: startRadius },
    config: { mass: 8, tension: 500, friction: 65, clamp: false },
    ref: moveRef,
  });

  const moveLeftRef = useSpringRef();

  const moveLeftProps = useSpring({
    from: { transform: "translateX(0%) scale(1) translateY(0%)" },
    to: { transform: "translateX(-5%) scale(0.7) translateY(20%)" },
    config: { mass: 10, tension: 500, friction: 85, clamp: false },
    ref: moveLeftRef,
  });

  const moveRightRef = useSpringRef();

  const moveRightProps = useSpring({
    from: { transform: "translateX(0%) scale(1) translateY(0%)" },
    to: { transform: "translateX(34%) scale(0.7) translateY(20%)" },
    config: { mass: 10, tension: 500, friction: 85, clamp: false },
    ref: moveRightRef,
  });

  useChain([moveRef, moveLeftRef, moveRightRef], [0, 1, 1]);

  const ySpread = graphHeight * 0.5;
  const ySpreadStart = endY - ySpread / 2;
  const spreadInterval = ySpread / (topCommonConcepts.length - 1);

  return (
    <>
      {topCommonConcepts.map((concept, i) => {
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
      <animated.circle
        {...moveIntoPlaceProps}
        style={moveLeftProps}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      />

      <animated.circle
        {...moveIntoPlaceProps}
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
