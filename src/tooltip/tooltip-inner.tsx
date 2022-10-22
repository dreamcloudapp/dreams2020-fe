export type TooltipRow = {
  key: string;
  value: string;
  keyColor?: string;
};

export type TooltipSection = {
  sectionTitle?: string;
  sectionColor?: string;
  rows: TooltipRow[];
};

type TooltipProps = {
  tipTitle?: string;
  sections: TooltipSection[];
};

export function Tooltip({ tipTitle, sections }: TooltipProps) {
  return (
    <div>
      {tipTitle && (
        <h4 style={{ fontWeight: "bold", textDecoration: "underline" }}>{tipTitle}</h4>
      )}
      {sections.map((section, i) => {
        return (
          <div key={i}>
            {section.sectionTitle && (
              <h5 style={{ fontWeight: "bold", color: section.sectionColor }}>
                {section.sectionTitle}
              </h5>
            )}
            {section.rows.map((row, j) => {
              return (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    margin: "0.5rem 0",
                  }}
                >
                  <span style={{ color: row.keyColor }}>{row.key}&nbsp;</span>
                  <span style={{ minWidth: 60, textAlign: "left" }}>{row.value}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
