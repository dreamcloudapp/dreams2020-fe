import { Point } from "../../types/types";
import { animated, useChain, useSpring, useSpringRef } from "react-spring";

type AnimatedLabelProps = {
  startPoint: Point;
  endPoint: Point;
  label: string;
  fill: string;
  outlineShade: string;
  fontSize: number;
  fontWeight: number;
  rectWidth: number;
  rectHeight: number;
  textColor: string;
  hasBackground: boolean;
};

export const AnimatedLabel = ({
  startPoint,
  endPoint,
  label,
  fill,
  fontSize,
  fontWeight,
  rectWidth,
  rectHeight,
  outlineShade,
  textColor,
  hasBackground,
}: AnimatedLabelProps) => {
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
      {hasBackground && (
        <animated.rect
          {...moveRectProps}
          {...fadeInProps}
          width={rectWidth}
          height={rectHeight}
          fill={fill}
          stroke={outlineShade}
          rx={0}
          ry={0}
          strokeWidth={2}
        />
      )}

      <animated.text
        {...moveTextProps}
        {...fadeInProps}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {label}
      </animated.text>
    </g>
  );
};
