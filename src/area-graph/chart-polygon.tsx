import { DifferenceRecord } from "@kannydennedy/dreams-2020-types";
import { Padding } from "../modules/ui-types";
import { ScaleLinear } from "d3";
import { changeHslOpacity } from "../modules/colorHelpers";

type ChartPolylineProps = {
  data: DifferenceRecord[];
  max: number;
  width: number;
  height: number;
  hideTooltip: () => void;
  handleMouseOver: (event: any, datum: any) => void;
  barColor: string;
  padding: Padding;
  strokeWidth: number;
  midpoint: number;
  colHeightScale: ScaleLinear<number, number>;
};

// function LineTooltip({ datum }: { datum: DifferenceRecord }) {
//   return (
//     <div>
//       <p>
//         {datum.difference === 0 ? (
//           <span>Dreams on same day as news</span>
//         ) : (
//           <span>
//             <span>Dreams {Math.abs(datum.difference)} </span>
//             <span>{Math.abs(datum.difference) === 1 ? "day" : "days"} </span>
//             <i>{datum.difference >= 0 ? "after" : "before"} </i>
//             <span>the news</span>
//           </span>
//         )}
//       </p>
//       <p>Average similarity: {datum.averageSimilarity.toFixed(5)}</p>
//       <p>Dreams have been compared to {datum.recordCount} days of news</p>
//     </div>
//   );
// }

export function ChartPolygon({
  data,
  height,
  width,
  hideTooltip,
  handleMouseOver,
  barColor,
  padding,
  strokeWidth,
  midpoint,
  colHeightScale,
}: ChartPolylineProps) {
  // Width of columns
  const columnWidth =
    (width - padding.LEFT - padding.RIGHT) / (data.length > 0 ? data.length : 1);
  // const bubbleRadius = columnWidth * 0.6;

  const lineData = data.map((d, i) => {
    return {
      x: midpoint + d.difference * columnWidth,
      y: height - colHeightScale(d.averageSimilarity) - padding.BOTTOM,
      datum: d,
    };
  });

  // E.g. <polyline points="100,100 150,25 150,75 200,0" fill="none" stroke="black" />
  const polyLineString = lineData.reduce((acc, curr) => {
    return acc + `${curr.x}, ${curr.y} `;
  }, "");

  const polygonString = `${padding.LEFT},${height - padding.BOTTOM} ${polyLineString} ${
    width - padding.RIGHT
  },${height - padding.BOTTOM}`;

  // const bubbles = lineData.map((d, i) => {
  //   return (
  //     <circle
  //       r={bubbleRadius}
  //       cx={d.x}
  //       cy={d.y}
  //       key={i}
  //       fill={barColor}
  //       onMouseOver={e => {
  //         (handleMouseOver as any)(e, <LineTooltip datum={d.datum} />);
  //       }}
  //       onMouseOut={hideTooltip}
  //     />
  //   );
  // });

  return (
    <>
      <polygon
        points={polygonString}
        fill={changeHslOpacity(barColor, 0.2)}
        stroke={barColor}
        strokeWidth={strokeWidth}
      />
      {/* {bubbles} */}
    </>
  );
}
