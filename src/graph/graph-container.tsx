import { useRef, useEffect } from "react";
import useComponentSize from "@rehooks/component-size";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import Legend from "./legend";
import Graph from "./graph";
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
};

const timeLabels: { key: Granularity; label: string }[] = [
  { key: "month", label: "Months" },
  { key: "week", label: "Weeks" },
];

function GraphContainer({ data }: GraphProps) {
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

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div ref={chartContainerRef} style={{ height: "100%", width: "100%" }}>
        <div
          style={{ height: "100%", width: "100%", position: "relative" }}
          ref={containerRef}
        >
          {width > 0 && height > 0 && (
            <Graph
              data={data}
              checkedCollections={checkedCollections}
              maxTimeDistance={maxTimeDistance}
              width={width}
              height={height}
              handleMouseOver={handleMouseOver}
              hideTooltip={hideTooltip}
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
      </div>
      {/* Legend */}
      <Legend
        data={data}
        handleCheck={handleOnChange}
        checkedCollections={checkedCollections}
      />

      {tooltipOpen && !focusedComparison && (
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

export default GraphContainer;
