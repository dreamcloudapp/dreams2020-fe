import { DifferenceRecord } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "react-redux";
import Axes from "../axes/axes";
import { selectActiveGranularity } from "../ducks/ui";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type ColumnGraphProps = {
  data: DifferenceRecord[];
  max: number;
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
  barColor: string;
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
  max,
  barColor,
}: ColumnGraphProps) {
  const activeGranularity = useSelector(selectActiveGranularity);

  // Width of columns
  const columnWidth =
    (width - padding.LEFT - padding.RIGHT) / (data.length > 0 ? data.length : 1);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  const colHeightScale = scaleLinear()
    .domain([0, max])
    .range([0, height - padding.TOP - padding.BOTTOM]);

  return (
    <svg width={width} height={height}>
      {/* Columns */}
      {data.map((d, i) => {
        const colHeight = colHeightScale(d.averageSimilarity);
        return (
          <rect
            key={i}
            x={midpoint + d.difference * columnWidth}
            y={height - colHeight - padding.BOTTOM}
            fill={barColor}
            width={columnWidth}
            height={colHeight}
            onMouseOver={e => {
              (handleMouseOver as any)(
                e,
                <div>
                  <p>
                    {d.difference === 0 ? (
                      <span>Dreams on same day as news</span>
                    ) : (
                      <span>
                        <span>Dreams {Math.abs(d.difference)} </span>
                        <span>{Math.abs(d.difference) === 1 ? "day" : "days"} </span>
                        <i>{d.difference >= 0 ? "after" : "before"} </i>
                        <span>the news</span>
                      </span>
                    )}
                  </p>
                  <p>Average similarity: {d.averageSimilarity.toFixed(5)}</p>
                  <p>Dreams have been compared to {d.recordCount} days of news</p>
                </div>
              );
            }}
            onMouseOut={hideTooltip}
          ></rect>
        );
      })}
      {/* GRID */}
      <Axes
        height={height}
        width={width}
        padding={padding}
        // xAxisLabel="Days since news"
        // yAxisLabel="Similarity"
        // yScale={d3.scaleLinear().domain([0, 1]).range([height - padding.BOTTOM, padding.TOP])}
        // xScale={d3.scaleLinear().domain([0, 1]).range([padding.LEFT, width - padding.RIGHT])}
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
    </svg>
  );
}
