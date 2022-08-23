import { useEffect, useRef } from "react";
import useComponentSize from "@rehooks/component-size";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
// import { Granularity } from "../../types/type";
import { DifferenceByGranularity } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  CollectionCheck,
  selectActiveGranularity,
  selectCheckedCollections,
  setCheckedCollections,
  toggleCollectionChecked,
} from "../ducks/ui";
// import { useDispatch } from "react-redux";
import { AreaGraph } from "./area-graph";
import { localPoint } from "@visx/event";
import Legend from "../graph/legend";
import { useDispatch } from "react-redux";

type GraphProps = {
  data: DifferenceByGranularity;
};

function AreaGraphContainer({ data }: GraphProps) {
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
    }));
    dispatch(setCheckedCollections(checkedCollections));
  }, [dispatch, columnDataSets]);

  const handleOnChange = (labelToToggle: string) => {
    dispatch(toggleCollectionChecked(labelToToggle));
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width, height } = useComponentSize(chartContainerRef);

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip();

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  const handleMouseOver = (event: any, datum: any) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: datum,
    });
  };

  // Pad the max a little so the lines aren't always at the top of the chart
  const realMax = Math.max(
    ...columnDataSets.map(d => d.comparisons.maxAverageSimilarity)
  );
  const paddedMax = realMax * 1.3;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div ref={chartContainerRef} style={{ height: "100%", width: "100%" }}>
        <div
          style={{ height: "100%", width: "100%", position: "relative" }}
          ref={containerRef}
        >
          {width > 0 && height > 0 && (
            <AreaGraph
              data={columnDataSets.filter(
                d => checkedCollections.find(c => c.label === d.key)?.checked
              )}
              width={width}
              height={height}
              hideTooltip={hideTooltip}
              handleMouseOver={handleMouseOver}
              paddedMax={paddedMax}
            />
          )}
        </div>
      </div>
      {/* Legend */}
      <Legend
        options={columnDataSets.map(s => ({ label: s.key, color: s.color }))}
        handleCheck={handleOnChange}
        checkedCollections={checkedCollections}
      />

      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div style={{ maxWidth: 300, fontFamily: "Lato", fontWeight: 400 }}>
            <strong>{tooltipData}</strong>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default AreaGraphContainer;
