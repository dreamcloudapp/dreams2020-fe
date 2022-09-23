import {
  DifferenceDisplayReccord,
  DifferenceRecord,
} from "@kannydennedy/dreams-2020-types";
import { useSelector } from "react-redux";
import Axes from "../axes/axes";
import { selectActiveGranularity } from "../ducks/ui";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import { ChartPolygon } from "./chart-polygon";
import "../App.css";

const LINE_WIDTH = 2;
const TRIANGLE_HEIGHT = 10;

type ColumnGraphProps = {
  data: DifferenceDisplayReccord[];
  width: number;
  height: number;
  paddedMax: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const padding: Padding = {
  LEFT: 30,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 40,
};

type ColouredDayDifference = {
  color: string;
  label: string;
  datum: DifferenceRecord;
};

function LineTooltip({ data }: { data: ColouredDayDifference[] }) {
  // We assume that all sets of data have the same length
  const sampleData = data[0].datum;

  return (
    <div>
      <h4 style={{ fontWeight: "bold", textDecoration: "underline" }}>
        {sampleData.difference === 0 ? (
          <span>Dreams on same day as news</span>
        ) : (
          <span>
            <span>Dreams {Math.abs(sampleData.difference)} </span>
            <span>{Math.abs(sampleData.difference) === 1 ? "day" : "days"} </span>
            <i>{sampleData.difference >= 0 ? "after" : "before"} </i>
            <span>the news</span>
          </span>
        )}
      </h4>
      {data.map((d, i) => {
        const { datum, label, color } = d;
        return (
          <div key={i}>
            <p style={{ color: color }}>{label}</p>
            <p>Average similarity: {datum.averageSimilarity.toFixed(5)}</p>
            {/* <p>Dreams have been compared to {datum.recordCount} days of news</p> */}
          </div>
        );
      })}
    </div>
  );
}

export function AreaGraph({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
  paddedMax,
}: ColumnGraphProps) {
  const activeGranularity = useSelector(selectActiveGranularity);

  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  const colHeightScale = scaleLinear()
    .domain([0, paddedMax])
    .range([0, height - padding.TOP - padding.BOTTOM]);

  // We assume both sets have the same length
  const dataLength = data.length ? data[0].comparisons.differences.length : 0;

  // Width of columns
  const invisibleColumnWidth =
    (width - padding.LEFT - padding.RIGHT) / (dataLength > 0 ? dataLength : 1);

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
      {data.map(d => {
        return (
          <ChartPolygon
            key={d.key}
            max={paddedMax}
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
            invisibleColumnWidth={invisibleColumnWidth}
          />
        );
      })}
      {/* 'Invisible' columns */}
      {
        <g>
          {[...Array(dataLength)].map((_, i) => {
            return (
              <g className="invisible-column" key={i}>
                <rect
                  key={i}
                  x={padding.LEFT + i * invisibleColumnWidth}
                  y={padding.TOP}
                  width={invisibleColumnWidth}
                  height={height - padding.TOP - padding.BOTTOM}
                  stroke="none"
                  strokeWidth={0}
                  onMouseOver={e => {
                    (handleMouseOver as any)(
                      e,
                      <LineTooltip
                        data={data.map(d => {
                          return {
                            datum: d.comparisons.differences[i],
                            label: d.key,
                            color: d.color,
                          };
                        })}
                      />
                    );
                  }}
                  onMouseOut={hideTooltip}
                />
                {/* Dotted line in middle of rect */}
                <line
                  className="moving-line"
                  x1={padding.LEFT + i * invisibleColumnWidth + invisibleColumnWidth / 2}
                  y1={padding.TOP}
                  x2={padding.LEFT + i * invisibleColumnWidth + invisibleColumnWidth / 2}
                  y2={height - padding.BOTTOM}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              </g>
            );
          })}
        </g>
      }
    </svg>
  );
}
