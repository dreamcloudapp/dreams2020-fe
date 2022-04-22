import { useRef, useState } from "react";
import useComponentSize from "@rehooks/component-size";
import { ComparisonSets } from "../../types/types";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import Legend from "./legend";
import Graph from "./graph";
import { MILLISECONDS_IN_YEAR } from "../modules/constants";
import { Granularity } from "../../types/type";

type GraphProps = {
  data: ComparisonSets;
};

export type FakeComparison = {
  x: number;
  y: number;
  concepts: string[];
  startRadius: number;
  color: string;
};

const timeLabels: { key: Granularity; label: string }[] = [
  { key: "year", label: "Years" },
  { key: "month", label: "Months" },
  { key: "week", label: "Weeks" },
  { key: "day", label: "Days" },
];

function GraphContainer({ data }: GraphProps) {
  const [activeTimePeriod, setActiveTimePeriod] = useState<Granularity>("month");

  const comparisonSetLabels: String[] = data.comparisonSets.map(s => s.label);

  const [focusedComparison, setFocusedComparison] = useState<FakeComparison | null>(null);
  const [prevFocusedComparison, setPrevFocusedComparison] =
    useState<FakeComparison | null>(null);

  // console.log(`max time distance is ${millisecondsToYear(maxTimeDistance)} year(s)`);

  const [checkedState, setCheckedState] = useState(
    [...new Array(comparisonSetLabels.length)].map(_ => true)
  );

  // We only show comparisons that fall within this range
  const [maxTimeDistance, setMaxTimeDistance] = useState<number>(MILLISECONDS_IN_YEAR);

  console.log(setMaxTimeDistance);

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
        <div
          style={{ height: "100%", width: "100%", position: "relative" }}
          ref={containerRef}
        >
          {width > 0 && height > 0 && (
            <Graph
              data={data}
              maxTimeDistance={maxTimeDistance}
              width={width}
              height={height}
              handleMouseOver={handleMouseOver}
              checkedState={checkedState}
              hideTooltip={hideTooltip}
              focusedComparison={focusedComparison}
              prevFocusedComparison={prevFocusedComparison}
              setFocusedComparison={setFocusedComparison}
              setPrevFocusedComparison={setPrevFocusedComparison}
            />
          )}
          {/* Select active time period */}
          <div style={{ position: "absolute", right: 10, bottom: 10 }}>
            <span>View: </span>
            {timeLabels.map(({ key, label }) => {
              const isActive = key === activeTimePeriod;
              return (
                <button
                  key={key}
                  className={isActive ? "selected" : "unselected"}
                  onClick={() => {
                    setActiveTimePeriod(key);
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
      <Legend data={data} handleCheck={handleOnChange} checkedState={checkedState} />

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
