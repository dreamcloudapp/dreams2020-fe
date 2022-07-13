import { Point } from "../../types/types";
import { animated, useChain, useSpring, useSpringRef } from "react-spring";

type AnimatedLineProps = {
  leftStart: Point;
  rightStart: Point;
  leftEnd: Point;
  rightEnd: Point;
  stroke: string;
  clampLeft: boolean;
  clampRight: boolean;
  strokeWidth: number;
};

export const AnimatedLine = ({
  leftStart,
  rightStart,
  leftEnd,
  rightEnd,
  stroke,
  clampLeft,
  clampRight,
  strokeWidth,
}: AnimatedLineProps) => {
  const [leftStartX, leftStartY] = leftStart;
  const [rightStartX, rightStartY] = rightStart;
  const [leftEndX, leftEndY] = leftEnd;
  const [rightEndX, rightEndY] = rightEnd;

  const lineLeftRef = useSpringRef();
  const lineRightRef = useSpringRef();
  const fadeInRef = useSpringRef();

  const fadeInProps = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    ref: fadeInRef,
  });

  const moveLineLeftProps = useSpring({
    from: { x1: leftStartX, y1: leftStartY },
    to: { x1: leftEndX, y1: leftEndY },
    config: { mass: 10, tension: 500, friction: 85, clamp: clampLeft },
    ref: lineLeftRef,
  });

  const moveLineRightProps = useSpring({
    from: { x2: rightStartX, y2: rightStartY },
    to: { x2: rightEndX, y2: rightEndY },
    config: { mass: 10, tension: 500, friction: 85, clamp: clampRight },
    ref: lineRightRef,
  });

  useChain([fadeInRef, lineLeftRef, lineRightRef], [0, 1, 1]);

  return (
    <g>
      <animated.line
        {...fadeInProps}
        {...moveLineLeftProps}
        {...moveLineRightProps}
        stroke={stroke}
        strokeWidth={strokeWidth}
        // shapeRendering={"crispEdges"}
      />
    </g>
  );
};
