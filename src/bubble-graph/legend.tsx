import { CollectionCheck } from "../ducks/ui";

export type LegendOption = {
  label: string;
  color: string;
};

type LegendProps = {
  options: LegendOption[];
  handleCheck: (labelToToggle: string) => void;
  checkedCollections: CollectionCheck[];
};

const Legend = ({ options, handleCheck, checkedCollections }: LegendProps) => {
  return (
    <div>
      {options.map((option, i) => {
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
              checked={checkedCollections.find(c => c.label === option.label)?.checked}
              onChange={() => handleCheck(option.label)}
              style={{ marginRight: 10 }}
            />
            <span style={{ color: option.color }}>{option.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;