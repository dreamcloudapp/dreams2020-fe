import { DifferenceRecord } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "react-redux";
import Axes from "../axes/axes";
import { selectActiveGranularity } from "../ducks/ui";
import { ColorTheme } from "../modules/theme";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type GraphProps = {
  data: DifferenceRecord[];
  max: number;
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const padding: Padding = {
  LEFT: 30,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 10,
};

export function ColumnGraph({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
}: GraphProps) {
  const activeGranularity = useSelector(selectActiveGranularity);

  // Width of columns
  const columnWidth =
    (width - padding.LEFT - padding.RIGHT) / (data.length > 0 ? data.length : 1);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  return (
    <svg width={width} height={height}>
      {/* Columns */}
      {data.map((d, i) => {
        const colHeight = d.averageSimilarity * 900000;
        return (
          <rect
            key={i}
            x={midpoint + d.difference * columnWidth}
            y={height - colHeight - padding.BOTTOM}
            fill={ColorTheme.BLUE}
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
                  <p>Similarity: {d.averageSimilarity.toFixed(7)}</p>
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
      />
      <g>
        <line
          x1={midpoint}
          y1={0}
          x2={midpoint}
          y2={height}
          stroke={"#444"}
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}
