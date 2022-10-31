import { useEffect, useRef } from "react";
import "./App.css";
import { useSelector } from "./ducks/root-reducer";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import {
  fetchBubbleData,
  selectComparisons,
  selectIsLoading,
  fetchAreaData,
  selectDifferences,
  fetchColumnData,
  selectColumnData,
  selectBarData,
  fetchBarData,
  fetchDreams,
  fetchNews,
  selectDreamersData,
  fetchDreamersData,
} from "./ducks/data";
import { useDispatch } from "react-redux";
import {
  CollectionCheck,
  selectActiveGranularity,
  selectCheckedCollections,
  selectFocusedComparison,
  selectShowingGraph,
  setActiveGranularity,
  setCheckedCollections,
  setFocusedComparison,
  setPrevFocusedComparison,
  setShowingGraph,
  toggleCollectionChecked,
} from "./ducks/ui";
import { GraphType } from "./ducks/ui";
import useComponentSize from "@rehooks/component-size";
import { localPoint } from "@visx/event";
import { Padding } from "./modules/ui-types";
import { DreamNewsText } from "./dream-news-text/dream-news-text";
import { ChartOpts } from ".";
import AppInner from "./app-inner";
import { toTitleCase } from "./modules/formatters";
import Legend from "./bubble-graph/legend";

const padding: Padding = {
  LEFT: 50,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 100,
};

const graphtypes: GraphType[] = ["area", "bar", "bubble", "months", "dreamers"];

function GraphTypeToggle({
  onSelectGraphType,
  showingGraph,
  toggleableCharts = graphtypes,
}: {
  onSelectGraphType: (graphType: GraphType) => void;
  showingGraph: GraphType;
  toggleableCharts?: GraphType[];
}) {
  const dispatch = useDispatch();
  return (
    <div
      className="graph-type-toggle"
      style={{ position: "absolute", right: 0, padding: "0 20px", zIndex: 1 }}
    >
      {graphtypes
        .filter(graphType => toggleableCharts.includes(graphType))
        .map(graphType => (
          <button
            key={graphType}
            onClick={() => {
              dispatch<any>(onSelectGraphType(graphType));
              if (graphType === "area") {
                dispatch<any>(setActiveGranularity("day"));
              } else if (graphType === "dreamers") {
                dispatch<any>(setActiveGranularity("day"));
              } else {
                dispatch<any>(setActiveGranularity("month"));
              }
              dispatch<any>(setFocusedComparison(null));
              dispatch<any>(setPrevFocusedComparison(null));
            }}
            className={graphType === showingGraph ? "selected" : ""}
          >
            {toTitleCase(graphType)}
          </button>
        ))}
    </div>
  );
}

function App({
  activeChart = "bubble",
  showAll = true,
  activeLegends,
  toggleableCharts,
}: ChartOpts) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const bubbleGraphData = useSelector(selectComparisons);
  const activeGranularity = useSelector(selectActiveGranularity);
  const showingGraph = useSelector(selectShowingGraph);
  const differencesData = useSelector(selectDifferences);
  const columnData = useSelector(selectColumnData);
  const barData = useSelector(selectBarData);
  const dreamersData = useSelector(selectDreamersData);
  const focusedComparison = useSelector(selectFocusedComparison);
  const checkedCollections = useSelector(selectCheckedCollections);

  // Get width and height
  const graphContainerRef = useRef<HTMLDivElement>(null);
  let { width, height } = useComponentSize(graphContainerRef);

  // Tooltip
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

  // Initial data fetch
  useEffect(() => {
    dispatch<any>(fetchAreaData());
    dispatch<any>(fetchBubbleData());
    dispatch<any>(fetchColumnData());
    dispatch<any>(fetchBarData());
    dispatch<any>(fetchDreamersData());
    dispatch<any>(fetchDreams());
    dispatch<any>(fetchNews());
  }, [dispatch]);

  // Set the active chart based on props
  useEffect(() => {
    dispatch(setShowingGraph(activeChart));
  }, [dispatch, activeChart]);

  // Set checked collections on mount
  // This is a bit of a mess, TODO: clean up
  // This doesn't relate to some chart types
  useEffect(() => {
    const hasDefaultCheckedCollections = activeLegends && activeLegends[showingGraph];

    if (dreamersData && showingGraph === "dreamers") {
      const checkedCollections: CollectionCheck[] = dreamersData.comparisonSets.map(s => {
        const checked = hasDefaultCheckedCollections
          ? !!activeLegends[showingGraph]?.includes(s.label)
          : true;
        return {
          label: s.label,
          checked: checked,
          color: s.color,
        };
      });
      dispatch(setCheckedCollections(checkedCollections));
    } else if (bubbleGraphData && bubbleGraphData[activeGranularity]) {
      const checkedCollections: CollectionCheck[] = bubbleGraphData[
        activeGranularity
      ].comparisonSets.map(s => {
        return {
          label: s.label,
          checked: true,
          color: s.color,
        };
      });
      dispatch(setCheckedCollections(checkedCollections));
    }
  }, [
    dispatch,
    dreamersData,
    showingGraph,
    activeLegends,
    activeGranularity,
    bubbleGraphData,
  ]);

  const frameWidth = window.location.href.includes("localhost") ? 20 : 0;
  const maxWidth = window.location.href.includes("localhost")
    ? "calc(100% - 40px)"
    : "90rem";

  const handleOnChange = (labelToToggle: string) => {
    dispatch(toggleCollectionChecked(labelToToggle));
  };

  return (
    <div style={{ width: "100%" }} className="dreams-2020-chart">
      <div
        style={{
          width: "100%",
          position: "relative",
          height: 600,
          padding: frameWidth,
          maxWidth: maxWidth,
        }}
      >
        <div
          className="App"
          style={{ height: "100%", width: "100%", border: "1px solid #EEE" }}
        >
          <div style={{ height: "100%", width: "100%" }} ref={graphContainerRef}>
            <div
              style={{ height: "100%", width: "100%", position: "relative" }}
              ref={containerRef}
            >
              {showAll && (
                <GraphTypeToggle
                  onSelectGraphType={setShowingGraph}
                  showingGraph={showingGraph}
                  toggleableCharts={toggleableCharts}
                />
              )}

              {(isLoading || !width || width < 1) && <div>Loading...</div>}
              {!isLoading &&
                bubbleGraphData &&
                differencesData &&
                columnData &&
                barData &&
                dreamersData &&
                activeGranularity && (
                  <AppInner
                    height={height}
                    width={width}
                    showingGraph={showingGraph}
                    handleMouseOver={handleMouseOver}
                    hideTooltip={hideTooltip}
                    bubbleData={bubbleGraphData[activeGranularity]}
                    diffData={differencesData}
                    columnGraphData={columnData}
                    barGraphData={barData}
                    dreamersData={dreamersData}
                    padding={padding}
                    activeLegends={activeLegends}
                  />
                )}
            </div>
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
      {focusedComparison && (
        <div style={{ padding: frameWidth, maxWidth: maxWidth }}>
          <DreamNewsText focusedComparison={focusedComparison} />
        </div>
      )}
      {/* Legend - don't show when there's a focused comparison */}
      {!focusedComparison && showingGraph === "dreamers" && (
        <Legend handleCheck={handleOnChange} checkedCollections={checkedCollections} />
      )}
    </div>
  );
}

export default App;
