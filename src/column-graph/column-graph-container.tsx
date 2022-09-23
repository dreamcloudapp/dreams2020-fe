import { ColumnGraphData } from "../App";
import { changeHslOpacity } from "../modules/colorHelpers";
import { monthNameFromIndex } from "../modules/time-helpers";

const STROKE_WIDTH = 2;
const COLUMN_GAP = 10;

type GraphProps = {
  data: ColumnGraphData[];
  width: number;
  height: number;
};

function ColumnGraphContainer({ data, width, height }: GraphProps) {
  const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        console.log(d);

        const colHeight = d.avgSimilarity * 18000;
        const highSimilarityHeight = (colHeight / 100) * d.highSimilarity.percent;
        const mediumSimilarityHeight = (colHeight / 100) * d.mediumSimilarity.percent;
        const lowSimilarityHeight = (colHeight / 100) * d.lowSimilarity.percent;

        const x = i * (columnWidth + COLUMN_GAP);
        return (
          <g key={i}>
            {/* High Similarity */}
            <rect
              x={x}
              y={height - colHeight}
              key={i}
              width={columnWidth}
              height={highSimilarityHeight}
              fill={changeHslOpacity(d.highSimilarity.color, 0.2)}
              stroke={d.highSimilarity.color}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Medium similarity */}
            <rect
              x={x}
              y={height - mediumSimilarityHeight - lowSimilarityHeight}
              key={i + "medium"}
              width={columnWidth}
              height={mediumSimilarityHeight}
              fill={changeHslOpacity(d.mediumSimilarity.color, 0.2)}
              stroke={d.mediumSimilarity.color}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Low Similarity*/}
            <rect
              x={x}
              y={height - lowSimilarityHeight}
              key={i + "low"}
              width={columnWidth}
              height={lowSimilarityHeight}
              fill={changeHslOpacity(d.lowSimilarity.color, 0.2)}
              stroke={d.lowSimilarity.color}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Label */}
            <text
              x={x + columnWidth / 2}
              y={height - colHeight - 10}
              textAnchor="middle"
              fill="black"
              fontSize="12px"
            >
              {monthNameFromIndex(d.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default ColumnGraphContainer;
