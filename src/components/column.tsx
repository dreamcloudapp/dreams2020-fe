// import { ColumnGraphData } from "../App";
// import { changeHslOpacity } from "../modules/colorHelpers";
// import { prettyNumber } from "../modules/formatters";
// import { monthNameFromIndex } from "../modules/time-helpers";

import { SimilarityLevelSection } from "@kannydennedy/dreams-2020-types";

type ColumnProps = {
  x: number;
  y: number;
  colWidth: number;
  colHeight: number;
  sections: SimilarityLevelSection[];
  //   strokeWidth: number;
  onMouseOut: () => void;
  handleMouseOver: (event: any, datum: any) => void;
  tooltipData: any;
  renderTooltip: (data: any) => JSX.Element;
  //   handleMouseOver: (event: any, datum: any) => void;
  //   onMouseOut: () => void;
};

export function Column({
  x,
  y,
  colWidth,
  colHeight,
  handleMouseOver,
  onMouseOut,
  renderTooltip,
  tooltipData,
  sections,
}: ColumnProps) {
  return (
    <g
      onMouseOver={e => {
        (handleMouseOver as any)(e, renderTooltip(tooltipData));
      }}
      onMouseOut={onMouseOut}
    >
      {/* High Similarity */}
      {/* <rect
        x={x}
        y={y}
        width={colWidth}
        height={colHeight}
        fill="blue"
        onMouseOver={e => {
          (handleMouseOver as any)(e, renderTooltip(tooltipData));
        }}
        onMouseOut={onMouseOut}
      /> */}
      {sections.map((s, i) => {
        const sectionProportion = s.percent / 100;
        const sectionHeight = colHeight * sectionProportion;

        // Work out the top (y) of the section
        const sectionY = sections
          .filter((_, j) => j <= i)
          .reduce((acc, curr) => acc - colHeight * (curr.percent / 100), y + colHeight);

        return (
          <rect
            key={i}
            height={sectionHeight}
            width={colWidth}
            y={sectionY}
            x={x}
            fill={s.color}
          />
        );
      })}
    </g>
  );
}

{
  /* <rect
x={x}
y={height - colHeight}
key={i}
width={columnWidth}
height={highSimilarityHeight}
fill={changeHslOpacity(d.highSimilarity.color, 0.2)}
stroke={d.highSimilarity.color}
strokeWidth={STROKE_WIDTH}
/>
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
<text
x={x + columnWidth / 2}
y={height - colHeight - 10}
textAnchor="middle"
fill="black"
fontSize="12px"
>
{monthNameFromIndex(d.month)}
</text> */
}
