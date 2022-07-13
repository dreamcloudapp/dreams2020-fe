import { DifferenceRecord } from "@kannydennedy/dreams-2020-types";
import { ColorTheme } from "../modules/theme";
import { Padding } from "../modules/ui-types";

type GraphProps = {
  data: DifferenceRecord[];
  max: number;
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const padding: Padding = {
  LEFT: 90,
  RIGHT: 90,
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
      <g>
        <line
          x1={midpoint}
          y1={0}
          x2={midpoint}
          y2={height}
          stroke={"#444"}
          strokeWidth={1}
        />
        <line x1={0} y1={height} x2={width} y2={height} stroke={"#444"} strokeWidth={2} />
      </g>
    </svg>
  );
}
