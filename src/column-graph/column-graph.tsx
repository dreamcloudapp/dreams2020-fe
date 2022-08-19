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

function ColumnTooltip({ datum }: { datum: DifferenceRecord }) {
  return (
    <div>
      <p>
        {datum.difference === 0 ? (
          <span>Dreams on same day as news</span>
        ) : (
          <span>
            <span>Dreams {Math.abs(datum.difference)} </span>
            <span>{Math.abs(datum.difference) === 1 ? "day" : "days"} </span>
            <i>{datum.difference >= 0 ? "after" : "before"} </i>
            <span>the news</span>
          </span>
        )}
      </p>
      <p>Average similarity: {datum.averageSimilarity.toFixed(5)}</p>
      <p>Dreams have been compared to {datum.recordCount} days of news</p>
    </div>
  );
}

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
  const bubbleRadius = columnWidth * 0.6;

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  const colHeightScale = scaleLinear()
    .domain([0, max])
    .range([0, height - padding.TOP - padding.BOTTOM]);

  const lineData = data.map((d, i) => {
    return {
      x: midpoint + d.difference * columnWidth,
      y: height - colHeightScale(d.averageSimilarity) - padding.BOTTOM,
      datum: d,
    };
  });

  // <polyline points="100,100 150,25 150,75 200,0" fill="none" stroke="black" />
  const polyLineString = lineData.reduce((acc, curr) => {
    return acc + `${curr.x}, ${curr.y} `;
  }, "");

  const bubbles = lineData.map((d, i) => {
    return (
      <circle
        r={bubbleRadius}
        cx={d.x}
        cy={d.y}
        key={i}
        fill={barColor}
        onMouseOver={e => {
          (handleMouseOver as any)(e, <ColumnTooltip datum={d.datum} />);
        }}
        onMouseOut={hideTooltip}
      />
    );
  });

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
      <polyline
        points={polyLineString}
        fill="none"
        stroke={barColor}
        strokeWidth={LINE_WIDTH}
      />
      {bubbles}
    </svg>
  );
}
