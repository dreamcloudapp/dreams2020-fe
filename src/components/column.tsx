import { SimilarityLevelSection } from "@kannydennedy/dreams-2020-types";

type ColumnProps = {
  x: number;
  y: number;
  colWidth: number;
  colHeight: number;
  sections: SimilarityLevelSection[];
  onMouseOut: () => void;
  handleMouseOver: (event: any, datum: any) => void;
  tooltipData: any;
  renderTooltip: (data: any) => JSX.Element;
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
