import { Point } from "../../types/types";
import { animated, useChain, useSpring, useSpringRef } from "react-spring";

type AnimatedTextProps = {
  startPoint: Point;
  endPoint: Point;
  conceptText: string;
  fill: string;
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
}: AnimatedTextProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;
  const textOffset = fontSize * 1.1;

  const moveTextSpringRef = useSpringRef();
  const moveRectSpringRef = useSpringRef();

  const moveTextProps = useSpring({
    to: { x: endX, y: endY + textOffset }, // why * 1.1?
    from: { x: startX, y: startY },
    config: { mass: 10, tension: 500, friction: 85, clamp: false, delay: 3000 },
    ref: moveTextSpringRef,
  });

  const moveRectProps = useSpring({
    to: { x: endX - rectWidth / 2, y: endY },
    from: { x: startX - rectWidth / 2, y: startY },
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
        fill={"white"}
        stroke={"black"}
      />
      <animated.text
        {...moveTextProps}
        {...fadeInProps}
        fill={fill}
        textAnchor="middle"
        // dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {conceptText}
      </animated.text>
    </g>
  );
};
