import { Point } from "../modules/types";
import { animated, useChain, useSpring, useSpringRef } from "react-spring";

type AnimatedTextProps = {
  startPoint: Point;
  endPoint: Point;
  conceptText: string;
  fill: string;
  fontSize: number;
};

export const AnimatedText = ({
  startPoint,
  endPoint,
  conceptText,
  fill,
  fontSize,
}: AnimatedTextProps) => {
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const moveSpringRef = useSpringRef();

  const moveProps = useSpring({
    to: { x: endX, y: endY },
    from: { x: startX, y: startY },
    config: { mass: 10, tension: 500, friction: 85, clamp: false, delay: 3000 },
    ref: moveSpringRef,
  });

  const fadeInRef = useSpringRef();

  const fadeInProps = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    ref: fadeInRef,
  });

  useChain([moveSpringRef, fadeInRef], [1]);

  return (
    <animated.text
      {...moveProps}
      {...fadeInProps}
      fill={fill}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
    >
      {conceptText}
    </animated.text>
  );
};
