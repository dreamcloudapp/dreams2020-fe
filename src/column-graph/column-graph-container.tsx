import { useRef, useState } from "react";
import useComponentSize from "@rehooks/component-size";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { MILLISECONDS_IN_YEAR } from "../modules/constants";
import { Granularity } from "../../types/type";
import { DifferenceByGranularity } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  setActiveGranularity,
  toggleCollectionChecked,
} from "../ducks/ui";
import { useDispatch } from "react-redux";
import { reduce } from "d3";
import { Padding } from "../modules/ui-types";
import { ColumnGraph } from "./column-graph";
import { localPoint } from "@visx/event";

type GraphProps = {
  data: DifferenceByGranularity;
};

export type FakeComparison = {
  x: number;
  y: number;
  concepts: string[];
  startRadius: number;
  color: string;
};

const timeLabels: { key: Granularity; label: string }[] = [
  { key: "month", label: "Months" },
  { key: "week", label: "Weeks" },
  { key: "day", label: "Days" },
];

const graphPadding: Padding = { LEFT: 90, RIGHT: 90, TOP: 60, BOTTOM: 60 };

function ColumnGraphContainer({ data }: GraphProps) {
  const dispatch = useDispatch();
  const activeGranularity = useSelector(selectActiveGranularity);

  const columnData = data[activeGranularity].differences;

  const [focusedComparison, setFocusedComparison] = useState<FakeComparison | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  let { width, height } = useComponentSize(chartContainerRef);

  // Width of columns
  const columnWidth = width / (columnData.length > 0 ? columnData.length : 1);

  // Midpoint of the graph
  const midpoint = width / 2;

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
            <ColumnGraph
              data={columnData}
              max={data[activeGranularity].maxSimilarity}
              width={width}
              height={height}
              hideTooltip={hideTooltip}
              handleMouseOver={handleMouseOver}
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

export default ColumnGraphContainer;
