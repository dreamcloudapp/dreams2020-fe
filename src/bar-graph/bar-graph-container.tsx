import {
  DifferenceDisplayRecord,
  DifferenceRecord,
} from "@kannydennedy/dreams-2020-types";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import "../App.css";
import { BeforeAfterAxis } from "../axes/before-after-axis";
import { prettyNumber } from "../modules/formatters";

type BarGraphProps = {
  data: DifferenceDisplayRecord;
  width: number;
  height: number;
  onMouseOut: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const padding: Padding = {
  LEFT: 30,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 40,
};

const renderTooltip = (d: DifferenceRecord) => {
  const { difference } = d;
  const absoluteDifference = Math.abs(difference);

  let tooltipHeader = "";
  if (difference === 0) {
    tooltipHeader = "Dreams within 1 week after the news";
  } else if (difference > 0) {
    tooltipHeader = `Dreams within ${absoluteDifference + 1} weeks after the news`;
  } else if (difference === -1) {
    tooltipHeader = `Dreams within 1 week before the news`;
  } else if (difference < -1) {
    tooltipHeader = `Dreams within ${absoluteDifference} weeks before the news`;
  }

  //   const tooltipHeader =

  //     absoluteDifference === 0
  //       ? "Dreams within 1 week after the news"
  //       : `Dreams within ${absoluteDifference} weeks ${temporal} the news`;

  return (
    <div className="tooltip">
      <p>{tooltipHeader}</p>
      <p>
        <b>Average similarity: </b>
        {prettyNumber(d.averageSimilarity, 5)}
      </p>
    </div>
  );
};

export function BarGraphContainer({
  data,
  height,
  width,
  onMouseOut,
  handleMouseOver,
}: BarGraphProps) {
  const barWidth =
    (width - padding.LEFT - padding.RIGHT) / data.comparisons.differences.length;

  const max = data.comparisons.maxAverageSimilarity;
  const yPad = height * 0.1;
  const scaleY = scaleLinear()
    .domain([0, max])
    .range([0, height - padding.TOP - padding.BOTTOM - yPad]);

  return (
    <svg width={width} height={height}>
      <BeforeAfterAxis width={width} height={height} padding={padding} />
      {data.comparisons.differences.map((difference, index) => {
        const x = barWidth * index + padding.LEFT;
        const barHeight = scaleY(difference.averageSimilarity);
        console.log(barHeight, "barHeight");

        const y = height - padding.BOTTOM - barHeight;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="blue"
            onMouseOver={e => {
              (handleMouseOver as any)(e, renderTooltip(difference));
            }}
            onMouseOut={onMouseOut}
          />
        );
      })}
    </svg>
  );
}
