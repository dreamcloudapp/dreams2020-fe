import { useRef } from "react";
import useComponentSize from "@rehooks/component-size";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
// import { Granularity } from "../../types/type";
import { DifferenceByGranularity } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import { selectActiveGranularity } from "../ducks/ui";
// import { useDispatch } from "react-redux";
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

// const timeLabels: { key: Granularity; label: string }[] = [
//   { key: "month", label: "Months" },
//   { key: "week", label: "Weeks" },
//   { key: "day", label: "Days" },
// ];

function ColumnGraphContainer({ data }: GraphProps) {
  // const dispatch = useDispatch();
  const activeGranularity = useSelector(selectActiveGranularity);

  const columnDataSets = data[activeGranularity];

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
            <>
              {columnDataSets.map((d, i) => {
                return (
                  <ColumnGraph
                    data={d.comparisons.differences}
                    max={d.comparisons.maxAverageSimilarity}
                    width={width}
                    height={height}
                    hideTooltip={hideTooltip}
                    handleMouseOver={handleMouseOver}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

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

export default ColumnGraphContainer;
