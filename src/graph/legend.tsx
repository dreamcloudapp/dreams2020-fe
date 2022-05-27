import { GranularityComparisonCollection } from "@kannydennedy/dreams-2020-types";

type LegendProps = {
  data: GranularityComparisonCollection;
  handleCheck: (index: number) => void;
  checkedState: Array<boolean>;
};

const Legend = ({ data, handleCheck, checkedState }: LegendProps) => {
  return (
    <div>
      {data.comparisonSets.map((s, i) => {
        return (
          <div
            key={`legend-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0px",
            }}
          >
            <input
              type="checkbox"
              id={`custom-checkbox-${i}`}
              checked={checkedState[i]}
              onChange={() => handleCheck(i)}
              style={{ marginRight: 10 }}
            />
            <span style={{ color: s.color }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
