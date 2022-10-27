import {
  DifferenceDisplayRecord,
  DifferenceRecord,
} from "@kannydennedy/dreams-2020-types";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import { ChartPolygon } from "./chart-polygon";
import "../App.css";
import { XYAxis } from "../axes/xy-axis";
import { Point } from "../../types/types";
import { Tooltip } from "../tooltip/tooltip-inner";

const LINE_WIDTH = 2;

type AreaGraphProps = {
  data: DifferenceDisplayRecord[];
  width: number;
  height: number;
  paddedMax: number;
  padding: Padding;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

type ColouredDayDifference = {
  color: string;
  label: string;
  datum: DifferenceRecord;
};

function LineTooltip({ data }: { data: ColouredDayDifference[] }) {
  // We assume that all sets of data have the same length
  const sampleData = data[0].datum;

  const sameDay = sampleData.difference === 0;
  const beforeDay = sampleData.difference < 0;
  const beforeAfterLabel = beforeDay ? "before" : "after";
  const plural = Math.abs(sampleData.difference) > 1 ? "s" : "";

  const tooltipHeader = sameDay
    ? "Dreams on the same day as the news"
    : `Dreams ${Math.abs(
        sampleData.difference
      )} day${plural} ${beforeAfterLabel} the news`;

  return (
    <Tooltip
      tipTitle={tooltipHeader}
      sections={data.map(d => {
        const { datum, label, color } = d;
        return {
          sectionTitle: label,
          sectionColor: color,
          rows: [
            {
              key: "Average similarity:",
              value: datum.averageSimilarity.toFixed(5),
            },
            {
              key: "Number of dream-news comparisons:",
              value: datum.numComparisons.toLocaleString(),
            },
          ],
        };
      })}
    />
  );
}

export function AreaGraph({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
  paddedMax,
  padding,
}: AreaGraphProps) {
  // Midpoint of the graph
  const midpoint = (width - padding.LEFT - padding.RIGHT) / 2 + padding.LEFT;

  const domainY: Point = [0, paddedMax];
  const colHeightScale = scaleLinear()
    .domain(domainY)
    .range([0, height - padding.TOP - padding.BOTTOM]);

  // We assume both sets have the same length
  const dataLength = data.length ? data[0].comparisons.differences.length : 0;

  // Width of columns
  const invisibleColumnWidth =
    (width - padding.LEFT - padding.RIGHT) / (dataLength > 0 ? dataLength : 1);

  return (
    <svg width={width} height={height}>
      {/* GRID */}
      <XYAxis
        width={width}
        height={height}
        padding={padding}
        hasMidpointLine={true}
        yRange={[0, paddedMax]}
        xRange={[-179, 179]}
        xAxisCenterLabel="Dream-news time difference"
        numTicks={11}
        xTickModulo={10}
        xAxisFormat={d => {
          if (d === 0) {
            return "Same day";
          } else {
            return `${d} days`;
          }
        }}
      />
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
