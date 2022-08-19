import { DifferenceDisplayReccord } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "react-redux";
import Axes from "../axes/axes";
import { selectActiveGranularity } from "../ducks/ui";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import { ChartPolyline } from "./chart-polyline";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type ColumnGraphProps = {
  data: DifferenceDisplayReccord[];
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const padding: Padding = {
  LEFT: 30,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 40,
};

export function ColumnGraph({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
}: ColumnGraphProps) {
  const max = Math.max(...data.map(d => d.comparisons.maxAverageSimilarity));

  const activeGranularity = useSelector(selectActiveGranularity);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  const colHeightScale = scaleLinear()
    .domain([0, max])
    .range([0, height - padding.TOP - padding.BOTTOM]);

  return (
    <svg width={width} height={height}>
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
      {data.map((d, i) => {
        return (
          <ChartPolyline
            max={max}
            width={width}
            height={height}
            data={d.comparisons.differences}
            handleMouseOver={handleMouseOver}
            hideTooltip={hideTooltip}
            strokeWidth={LINE_WIDTH}
            midpoint={midpoint}
            padding={padding}
            colHeightScale={colHeightScale}
            barColor={d.color}
          />
        );
      })}
    </svg>
  );
}
