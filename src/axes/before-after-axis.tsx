import { useSelector } from "react-redux";
import Axes from "../axes/axes";
import { selectActiveGranularity } from "../ducks/ui";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import "../App.css";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type BeforeAfterAxisProps = {
  width: number;
  height: number;
  padding: Padding;
};

export function BeforeAfterAxis({ height, width, padding }: BeforeAfterAxisProps) {
  const activeGranularity = useSelector(selectActiveGranularity);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  return (
    <>
      {/* GRID */}
      <Axes
        height={height}
        width={width}
        padding={padding}
        strokeColor={"hsl(0, 0%, 0%)"}
        opacity={0.9}
        strokeWidth={LINE_WIDTH}
        triangleHeight={TRIANGLE_HEIGHT}
        tickScale={scaleLinear()
          .domain([0, 1])
          .range([0, height - padding.BOTTOM - padding.TOP])}
        granularity={activeGranularity}
        maxTimeDistance={1}
        yAxisTopLabel="Similarity"
        xAxisRightLabel="Dream occured after the news"
        xAxisLeftLabel="Dream occured before the news"
        xAxisCenterLabel="Dream on same day as news"
      />
      {/* MIDPOINT LINE */}
      <g>
        <line
          x1={midpoint}
          y1={padding.TOP}
          x2={midpoint}
          y2={height - padding.BOTTOM}
          stroke={"#444"}
          strokeWidth={1}
        />
      </g>
    </>
  );
}
