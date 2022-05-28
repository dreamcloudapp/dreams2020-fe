import { GranularityComparisonCollection } from "@kannydennedy/dreams-2020-types";
import { CollectionCheck } from "../ducks/ui";

type LegendProps = {
  data: GranularityComparisonCollection;
  handleCheck: (labelToToggle: string) => void;
  checkedCollections: CollectionCheck[];
};

const Legend = ({ data, handleCheck, checkedCollections }: LegendProps) => {
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
              checked={checkedCollections.find(c => c.label === s.label)?.checked}
              onChange={() => handleCheck(s.label)}
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
