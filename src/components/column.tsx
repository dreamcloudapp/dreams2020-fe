import { SimilarityLevelSection } from "@kannydennedy/dreams-2020-types";

type ColumnProps = {
  x: number;
  y: number;
  colWidth: number;
  colHeight: number;
  sections: SimilarityLevelSection[];
  onMouseOut: () => void;
  onMouseOver: (event: any) => void;
  onClick: () => void;
};

export function Column({
  x,
  y,
  colWidth,
  colHeight,
  onMouseOut,
  sections,
  onMouseOver,
  onClick,
}: ColumnProps) {
  return (
    <g
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={onClick}
      style={{ cursor: "pointer" }}
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
            y={sectionY}
            x={x}
            height={sectionHeight}
            width={colWidth}
            fill={s.color}
          />
        );
      })}
    </g>
  );
}
