import { ColumnGraphData } from "../App";

// Quick fix
const width = 1000;
const height = 500;

const RED = "hsl(24, 84%, 56%)";
const BLUE = "hsl(220, 90%, 60%)";
const GREEN = "hsl(120, 70%, 60%)";

type GraphProps = {
  data: ColumnGraphData[];
};

function ColumnGraphContainer({ data }: GraphProps) {
  const columnWidth = width / data.length;
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        console.log(d);

        const colHeight = d.avgSimilarity * 18000;
        // const highSimilarityHeight = (colHeight / 100) * d.highSimilarity.percent;
        const mediumSimilarityHeight = (colHeight / 100) * d.mediumSimilarity.percent;
        const lowSimilarityHeight = (colHeight / 100) * d.lowSimilarity.percent;

        return (
          <g>
            <rect
              x={i * columnWidth}
              y={height - colHeight}
              key={i}
              width={columnWidth}
              height={colHeight}
              fill={RED}
            ></rect>
            <rect
              x={i * columnWidth}
              y={height - lowSimilarityHeight}
              key={i + "low"}
              width={columnWidth}
              height={lowSimilarityHeight}
              fill={BLUE}
            ></rect>
            <rect
              x={i * columnWidth}
              y={height - mediumSimilarityHeight - lowSimilarityHeight}
              key={i + "medium"}
              width={columnWidth}
              height={mediumSimilarityHeight}
              fill={GREEN}
            ></rect>
          </g>
        );
      })}
    </svg>
  );
}

export default ColumnGraphContainer;
