import { DifferenceRecord } from "@kannydennedy/dreams-2020-types";

type GraphProps = {
  data: DifferenceRecord[];
  max: number;
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

export function ColumnGraph({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
}: GraphProps) {
  // Width of columns
  const columnWidth = width / (data.length > 0 ? data.length : 1);

  // Midpoint of the graph
  const midpoint = width / 2;

  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const colHeight = d.averageSimilarity * 900000;
        return (
          <rect
            key={i}
            x={midpoint + d.difference * columnWidth}
            y={height - colHeight}
            fill={"hsla(200, 50%, 50%, 0.5)"}
            width={columnWidth}
            height={colHeight}
            onMouseOver={e => {
              (handleMouseOver as any)(
                e,
                <div>
                  <p>Difference: {d.difference}</p>
                  <p>Similarity: {d.averageSimilarity.toFixed(7)}</p>
                </div>
              );
            }}
            onMouseOut={hideTooltip}
          ></rect>
        );
      })}
      {/* GRID */}
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
