import { useRef } from "react";
import useComponentSize from "@rehooks/component-size";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
// import { Granularity } from "../../types/type";
import { DifferenceByGranularity } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import { selectActiveGranularity } from "../ducks/ui";
// import { useDispatch } from "react-redux";
import { AreaGraph } from "./area-graph";
import { localPoint } from "@visx/event";

type GraphProps = {
  data: DifferenceByGranularity;
};

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
            // <>
            //   {columnDataSets.map((d, i) => {
            //     return (
            <AreaGraph
              // key={i}
              data={columnDataSets}
              // max={d.comparisons.maxAverageSimilarity}
              width={width}
              height={height}
              hideTooltip={hideTooltip}
              handleMouseOver={handleMouseOver}
              // barColor={d.color}
            />
            //     );
            //   })}
            // </>
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
