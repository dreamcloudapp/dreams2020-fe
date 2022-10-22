type TooltipRow = {
  key: string;
  value: string;
  keyColor?: string;
};

type TooltipSection = {
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
                <div key={j} style={{ display: "flex", margin: "0.5rem 0" }}>
                  <span style={{ color: row.keyColor }}>{row.key}&nbsp;</span>
                  <span>{row.value}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
