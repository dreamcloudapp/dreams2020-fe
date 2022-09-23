import { useEffect } from "react";
import Legend from "./legend";
import Graph from "./bubble-graph";
import { MILLISECONDS_IN_YEAR } from "../modules/constants";
import { Granularity } from "../../types/type";
import { GranularityComparisonCollection } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  setActiveGranularity,
  setCheckedCollections,
  CollectionCheck,
  toggleCollectionChecked,
  selectCheckedCollections,
  selectFocusedComparison,
  selectPrevFocusedComparison,
} from "../ducks/ui";
import { useDispatch } from "react-redux";

type GraphProps = {
  data: GranularityComparisonCollection;
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  onMouseOut: () => void;
};

const timeLabels: { key: Granularity; label: string }[] = [
  { key: "month", label: "Months" },
  { key: "week", label: "Weeks" },
];

function GraphContainer({
  data,
  width,
  height,
  handleMouseOver,
  onMouseOut,
}: GraphProps) {
  const dispatch = useDispatch();
  const activeGranularity = useSelector(selectActiveGranularity);
  const checkedCollections = useSelector(selectCheckedCollections);
  const focusedComparison = useSelector(selectFocusedComparison);
  const prevFocusedComparison = useSelector(selectPrevFocusedComparison);

  // Set checked collections on mount
  useEffect(() => {
    const checkedCollections: CollectionCheck[] = data.comparisonSets.map(s => ({
      label: s.label,
      checked: true,
    }));
    dispatch(setCheckedCollections(checkedCollections));
  }, [dispatch, data.comparisonSets]);

  // We only show comparisons that fall within this range
  // const [maxTimeDistance, setMaxTimeDistance] = useState<number>(MILLISECONDS_IN_YEAR);

  const maxTimeDistance = MILLISECONDS_IN_YEAR;

  const handleOnChange = (labelToToggle: string) => {
    dispatch(toggleCollectionChecked(labelToToggle));
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        {width > 0 && height > 0 && (
          <Graph
            data={data}
            checkedCollections={checkedCollections}
            maxTimeDistance={maxTimeDistance}
            width={width}
            height={height}
            handleMouseOver={handleMouseOver}
            hideTooltip={onMouseOut}
            focusedComparison={focusedComparison}
            prevFocusedComparison={prevFocusedComparison}
          />
        )}
        {/* Select active time period */}
        <div style={{ position: "absolute", right: 10, bottom: 10 }}>
          <span>View: </span>
          {timeLabels.map(({ key, label }) => {
            const isActive = key === activeGranularity;
            return (
              <button
                key={key}
                className={isActive ? "selected" : "unselected"}
                onClick={() => {
                  dispatch(setActiveGranularity(key));
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Legend */}
      <Legend
        options={data.comparisonSets.map(s => ({ label: s.label, color: s.color }))}
        handleCheck={handleOnChange}
        checkedCollections={checkedCollections}
      />
    </div>
  );
}

export default GraphContainer;
