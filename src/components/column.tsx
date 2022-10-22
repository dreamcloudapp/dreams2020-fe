import { SimilarityLevelSection } from "@kannydennedy/dreams-2020-types";
import { SIMILARITY_COLORS } from "../modules/theme";

type ColumnProps = {
  x: number;
  y: number;
  colWidth: number;
  colHeight: number;
  sections: SimilarityLevelSection[];
  onMouseOut: () => void;
  onMouseOver: (event: any) => void;
  onClick: () => void;
  focused?: boolean;
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
  focused,
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
      {/* Little circle on top of the column if it's focused */}
      {focused && (
        <circle
          cx={x + colWidth / 2}
          cy={y}
          r={colWidth / 6 < 10 ? 3 : 10}
          fill={SIMILARITY_COLORS["high"]}
          stroke={SIMILARITY_COLORS["low"]}
          strokeWidth={1}
          opacity={1}
        />
      )}
    </g>
  );
}
