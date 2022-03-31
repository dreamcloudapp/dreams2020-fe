import { useRef, useState } from "react";
import useComponentSize from "@rehooks/component-size";
import { ComparisonSets } from "../modules/types";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import Legend from "./legend";
import Graph from "./graph";

type GraphProps = {
  data: ComparisonSets;
  maxTimeDistance: number; // We only show comparisons that fall within this range
};

function GraphContainer({ data, maxTimeDistance }: GraphProps) {
  const comparisonSetLabels: String[] = data.comparisonSets.map(s => s.label);

  // console.log(`max time distance is ${millisecondsToYear(maxTimeDistance)} year(s)`);

  const [checkedState, setCheckedState] = useState(
    [...new Array(comparisonSetLabels.length)].map(_ => true)
  );

  const handleOnChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
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
        <div style={{ height: "100%", width: "100%" }} ref={containerRef}>
          {width > 0 && height > 0 && (
            <Graph
              data={data}
              maxTimeDistance={maxTimeDistance}
              width={width}
              height={height}
              handleMouseOver={handleMouseOver}
              checkedState={checkedState}
              hideTooltip={hideTooltip}
            />
          )}
        </div>
      </div>
      {/* Legend */}
      <Legend data={data} handleCheck={handleOnChange} checkedState={checkedState} />

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

export default GraphContainer;
