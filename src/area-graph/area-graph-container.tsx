import { useEffect } from "react";
import { DifferenceByGranularity } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  CollectionCheck,
  selectActiveGranularity,
  selectCheckedCollections,
  setCheckedCollections,
  toggleCollectionChecked,
} from "../ducks/ui";
import { AreaGraph } from "./area-graph";
import Legend from "../bubble-graph/legend";
import { useDispatch } from "react-redux";
import { Padding } from "../modules/ui-types";

type GraphProps = {
  data: DifferenceByGranularity;
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  onMouseOut: () => void;
  padding: Padding;
};

export function AreaGraphContainer({
  data,
  width,
  height,
  handleMouseOver,
  onMouseOut,
  padding,
}: GraphProps) {
  const dispatch = useDispatch();
  // const dispatch = useDispatch();
  const activeGranularity = useSelector(selectActiveGranularity);
  const checkedCollections = useSelector(selectCheckedCollections);
  const columnDataSets = data[activeGranularity];

  // Set checked collections on mount
  useEffect(() => {
    const checkedCollections: CollectionCheck[] = columnDataSets.map(s => ({
      label: s.key,
      checked: true,
      color: s.color,
    }));
    dispatch(setCheckedCollections(checkedCollections));
  }, [dispatch, columnDataSets]);

  const handleOnChange = (labelToToggle: string) => {
    dispatch(toggleCollectionChecked(labelToToggle));
  };

  // Pad the max a little so the lines aren't always at the top of the chart
  const paddedMax = 0.022;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        {width > 0 && height > 0 && (
          <AreaGraph
            data={columnDataSets.filter(
              d => checkedCollections.find(c => c.label === d.key)?.checked
            )}
            width={width}
            height={height}
            hideTooltip={onMouseOut}
            handleMouseOver={handleMouseOver}
            paddedMax={paddedMax}
            padding={padding}
          />
        )}
      </div>

      {/* Legend */}
      <Legend handleCheck={handleOnChange} checkedCollections={checkedCollections} />
    </div>
  );
}
