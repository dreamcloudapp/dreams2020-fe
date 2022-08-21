import { Focus, Point } from "../../types/types";
import { animated, useSpring, useChain, useSpringRef } from "react-spring";
import React from "react";
import { AnimatedText } from "./animated-text";
import { AnimatedLine } from "./animated-line";
import { changeHslLightness } from "../modules/colorHelpers";
import { AnimatedLabel } from "./animated-label";

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

  const ballSpreadPercentage = 0.8;
  const ballDistance = Math.floor(graphWidth * ballSpreadPercentage);
  const textRectWidth = Math.floor(graphWidth * 0.5);
  const lineLength = ballDistance / 2;

  const outlineShade = changeHslLightness(fill, -10);

  const rectHeight = 40;

  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const positions = {
    unfocused: {
      moveIntoPlace: { cx: startX, cy: startY, r: startRadius },
      moveTextIntoPlace: { x: startX, y: startY },
      leftBallMove: { transform: "translateX(0%) scale(1) translateY(0%)", stroke: fill },
      leftBallLabelMove: {
        transform: "translateX(0%) translateY(0%)",
      },
      rightBallLabelMove: {
        transform: "translateX(0%) translateY(0%)",
      },
      rightBallMove: {
        transform: "translateX(0%) scale(1) translateY(0%)",
        stroke: fill,
      },
      conceptsLabelMove: {
        transform: "translateX(0%) translateY(0%)",
        fill: stroke,
      },
    },
    focused: {
      moveIntoPlace: { cx: endX, cy: endY, r: endRadius },
      moveTextIntoPlace: { x: endX, y: endY },
      leftBallMove: {
        transform: "translateX(-21%) scale(0.7) translateY(20%)",
        stroke: stroke,
      },
      leftBallLabelMove: {
        transform: "translateX(11%) translateY(50%)",
      },
      rightBallLabelMove: {
        transform: "translateX(84%) translateY(50%)",
      },
      rightBallMove: {
        transform: "translateX(51%) scale(0.7) translateY(20%)",
        stroke: stroke,
      },
      conceptsLabelMove: {
        transform: "translateX(-21%) translateY(20%)",
        fill: stroke,
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

  // const moveTextRef = useSpringRef();

  // const moveTextIntoPlaceProps = useSpring({
  //   from: positions[startFocus].moveTextIntoPlace,
  //   to: positions[endFocus].moveTextIntoPlace,
  //   config: { mass: 8, tension: 500, friction: 75, clamp: false },
  //   ref: moveTextRef,
  // });

  const leftBallMoveRef = useSpringRef();

  const leftBallMoveProps = useSpring({
    from: positions[startFocus].leftBallMove,
    to: positions[endFocus].leftBallMove,
    config: { mass: 8, tension: 500, friction: isFocused ? 75 : 100, clamp: false },
    ref: leftBallMoveRef,
  });

  const leftBallLabelMoveRef = useSpringRef();

  const leftBallLabelMoveProps = useSpring({
    from: positions[startFocus].leftBallLabelMove,
    to: positions[endFocus].leftBallLabelMove,
    config: { mass: 1, tension: 500, friction: isFocused ? 75 : 100, clamp: false },
    ref: leftBallLabelMoveRef,
  });

  const rightBallLabelMoveRef = useSpringRef();

  const rightBallLabelMoveProps = useSpring({
    from: positions[startFocus].rightBallLabelMove,
    to: positions[endFocus].rightBallLabelMove,
    config: { mass: 5, tension: 500, friction: isFocused ? 75 : 100, clamp: false },
    ref: rightBallLabelMoveRef,
  });

  const rightBallMoveRef = useSpringRef();

  const rightBallMoveProps = useSpring({
    from: positions[startFocus].rightBallMove,
    to: positions[endFocus].rightBallMove,
    config: { mass: 8, tension: 500, friction: isFocused ? 75 : 100, clamp: false },
    ref: rightBallMoveRef,
  });

  const refOrder = isFocused
    ? [
        moveRef,
        leftBallMoveRef,
        rightBallMoveRef,
        leftBallLabelMoveRef,
        rightBallLabelMoveRef,
        // moveTextRef,
      ]
    : [
        rightBallMoveRef,
        leftBallMoveRef,
        moveRef,
        leftBallLabelMoveRef,
        rightBallLabelMoveRef,
        // moveTextRef,
      ];
  const animationOrder = isFocused ? [0, 1, 1, 1, 1] : [0, 0, 1, 1, 1];

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
                stroke={outlineShade}
                clampLeft={false}
                clampRight={true}
                strokeWidth={strokeWidth}
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
                stroke={outlineShade}
                clampLeft={true}
                clampRight={false}
                strokeWidth={strokeWidth}
              />
              <AnimatedText
                startPoint={[endX, endY]}
                endPoint={[endX, ySpreadStart + i * spreadInterval]}
                fill={fill}
                conceptText={concept}
                key={i}
                fontSize={18}
                fontWeight={500}
                rectWidth={textRectWidth}
                rectHeight={rectHeight}
                outlineShade={outlineShade}
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
      {isFocused && (
        <animated.text
          {...moveIntoPlaceProps}
          fill={"white"}
          style={leftBallLabelMoveProps}
          fontSize={18}
        >
          Dreams
        </animated.text>
      )}

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
      {isFocused && (
        <animated.text
          {...moveIntoPlaceProps}
          fill={"white"}
          style={rightBallLabelMoveProps}
          fontSize={18}
        >
          News
        </animated.text>
      )}

      {/* Labels */}
      {isFocused && (
        <>
          <AnimatedLabel
            startPoint={[endX, endY]}
            endPoint={[endX, endY - 250]}
            fill={fill}
            label={"Common Concepts"}
            fontSize={18}
            fontWeight={500}
            rectWidth={200}
            rectHeight={rectHeight}
            outlineShade={fill}
            textColor={"white"}
            hasBackground={true}
          />
          {/* <AnimatedLabel
            startPoint={[endX, endY]}
            endPoint={[endX - 475, endY - 25]}
            fill={"black"}
            label={"Dreams"}
            fontSize={18}
            fontWeight={500}
            rectWidth={100}
            rectHeight={rectHeight}
            outlineShade={"black"}
            textColor={"white"}
            hasBackground={false}
          />
          <AnimatedLabel
            startPoint={[endX, endY]}
            endPoint={[endX + 475, endY - 25]}
            fill={"black"}
            label={"News"}
            fontSize={18}
            fontWeight={500}
            rectWidth={100}
            rectHeight={rectHeight}
            outlineShade={"black"}
            textColor={"white"}
            hasBackground={false}
          /> */}
        </>
      )}
    </>
  );
};
