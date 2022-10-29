import { Point } from "../../types/types";
import { animated, useChain, useSpring, useSpringRef } from "react-spring";
import { changeHslLightness } from "../modules/colorHelpers";

type AnimatedTextProps = {
  startPoint: Point;
  endPoint: Point;
  conceptText: string;
  fill: string;
  outlineShade: string;
  fontSize: number;
  fontWeight: number;
  rectWidth: number;
  rectHeight: number;
};

export const AnimatedText = ({
  startPoint,
  endPoint,
  conceptText,
  fill,
  fontSize,
  fontWeight,
  rectWidth,
  rectHeight,
  outlineShade,
}: AnimatedTextProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;
  const textOffset = fontSize * 1.5;

  const moveTextSpringRef = useSpringRef();
  const moveRectSpringRef = useSpringRef();

  const moveTextProps = useSpring({
    to: { x: endX, y: endY + textOffset }, // why * 1.1?
    from: { x: startX, y: startY },
    config: { mass: 6, tension: 500, friction: 85, clamp: false, delay: 3000 },
    ref: moveTextSpringRef,
  });

  const moveRectProps = useSpring({
    to: {
      x: endX - rectWidth / 2,
      y: endY,
      opacity: 1,
    },
    from: {
      x: startX - rectWidth / 2,
      y: startY,
      opacity: 0,
    },
    config: { mass: 10, tension: 500, friction: 85, clamp: false, delay: 3000 },
    ref: moveRectSpringRef,
  });

  const fadeInRef = useSpringRef();

  const fadeInProps = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    ref: fadeInRef,
  });

  useChain([moveTextSpringRef, moveRectSpringRef, fadeInRef], [1]);

  return (
    <g>
      <animated.rect
        {...moveRectProps}
        {...fadeInProps}
        width={rectWidth}
        height={rectHeight}
        fill={changeHslLightness(fill, 35)}
        stroke={outlineShade}
        rx={0}
        ry={0}
        strokeWidth={2}
      />
      <animated.text
        {...moveTextProps}
        {...fadeInProps}
        fill={"#222"}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {conceptText}
      </animated.text>
    </g>
  );
};
