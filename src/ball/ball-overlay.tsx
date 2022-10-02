import { changeHslLightness } from "../modules/colorHelpers";
import { SplitBall } from "../ball/split-ball";
import {
  VisComparison,
  setPrevFocusedComparison,
  setFocusedComparison,
} from "../ducks/ui";
import { useDispatch } from "react-redux";

type BubbleOverlayProps = {
  width: number;
  height: number;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
};

const LINE_WIDTH = 2;

export function BubbleOverlay({
  width,
  height,
  focusedComparison,
  prevFocusedComparison,
}: BubbleOverlayProps) {
  const dispatch = useDispatch();

  return (
    <>
      {focusedComparison && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={"rgba(255,255,255,0.2)"}
          onClick={() => {
            dispatch(setPrevFocusedComparison(focusedComparison));
            dispatch(setFocusedComparison(null));
          }}
        />
      )}
      {prevFocusedComparison && (
        <SplitBall
          key={`${prevFocusedComparison.x}-${prevFocusedComparison.y}`}
          startPoint={[prevFocusedComparison.x, prevFocusedComparison.y]}
          endPoint={[width / 2, height / 2]}
          startRadius={prevFocusedComparison.startRadius}
          endRadius={Math.floor(height / 4)}
          stroke={changeHslLightness(prevFocusedComparison.color, -10)}
          strokeWidth={LINE_WIDTH}
          fill={prevFocusedComparison.color}
          onMouseOver={() => {}}
          onMouseOut={() => {}}
          opacity={1}
          onClick={() => {}}
          topCommonConcepts={prevFocusedComparison.concepts}
          graphHeight={height}
          graphWidth={width}
          isFocused={false}
        />
      )}
      {focusedComparison && (
        <SplitBall
          key={`${focusedComparison.x}-${focusedComparison.y}`}
          startPoint={[focusedComparison.x, focusedComparison.y]}
          endPoint={[width / 2, height / 2]}
          startRadius={focusedComparison.startRadius}
          endRadius={Math.floor(height / 4)}
          stroke={changeHslLightness(focusedComparison.color, -10)}
          strokeWidth={LINE_WIDTH}
          fill={focusedComparison.color}
          onMouseOver={() => {}}
          onMouseOut={() => {}}
          opacity={1}
          onClick={() => {}}
          topCommonConcepts={focusedComparison.concepts}
          graphHeight={height}
          graphWidth={width}
          isFocused={true}
        />
      )}
    </>
  );
}
