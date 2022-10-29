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
} from "./ducks/data";
import { useDispatch } from "react-redux";
import {
  selectActiveGranularity,
  selectFocusedComparison,
  selectShowingGraph,
  setActiveGranularity,
  setFocusedComparison,
  setPrevFocusedComparison,
  setShowingGraph,
} from "./ducks/ui";
import { GraphType } from "./ducks/ui";
import useComponentSize from "@rehooks/component-size";
import { localPoint } from "@visx/event";
import { Padding } from "./modules/ui-types";
import { DreamNewsText } from "./dream-news-text/dream-news-text";
import { ChartOpts } from ".";
import AppInner from "./app-inner";
import { toTitleCase } from "./modules/formatters";

const padding: Padding = {
  LEFT: 50,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 100,
};

const graphtypes: GraphType[] = ["area", "bar", "bubble", "months"];

function GraphTypeToggle({
  onSelectGraphType,
  showingGraph,
}: {
  onSelectGraphType: (graphType: GraphType) => void;
  showingGraph: GraphType;
}) {
  const dispatch = useDispatch();
  return (
    <div className="graph-type-toggle">
      {graphtypes.map(graphType => (
        <button
          key={graphType}
          onClick={() => {
            dispatch<any>(onSelectGraphType(graphType));
            if (graphType === "area") {
              dispatch<any>(setActiveGranularity("day"));
              dispatch<any>(setFocusedComparison(null));
              dispatch<any>(setPrevFocusedComparison(null));
            } else {
              dispatch<any>(setActiveGranularity("month"));
              dispatch<any>(setFocusedComparison(null));
              dispatch<any>(setPrevFocusedComparison(null));
            }
          }}
          className={graphType === showingGraph ? "selected" : ""}
        >
          {toTitleCase(graphType)}
        </button>
      ))}
    </div>
  );
}

function App({ activeChart = "bubble", showAll = true }: ChartOpts) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const bubbleGraphData = useSelector(selectComparisons);
  const activeGranularity = useSelector(selectActiveGranularity);
  const showingGraph = useSelector(selectShowingGraph);
  const differencesData = useSelector(selectDifferences);
  const columnData = useSelector(selectColumnData);
  const barData = useSelector(selectBarData);
  const focusedComparison = useSelector(selectFocusedComparison);

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
    dispatch<any>(fetchDreams());
    dispatch<any>(fetchNews());
  }, [dispatch]);

  // Set the active chart based on props
  useEffect(() => {
    dispatch(setShowingGraph(activeChart));
  }, [dispatch, activeChart]);

  const frameWidth = window.location.href.includes("localhost") ? 20 : 0;
  const maxWidth = window.location.href.includes("localhost")
    ? "calc(100% - 40px)"
    : "90rem";

  return (
    <div style={{ width: "100%" }}>
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
                />
              )}

              {(isLoading || !width || width < 1) && <div>Loading...</div>}
              {!isLoading &&
                bubbleGraphData &&
                differencesData &&
                columnData &&
                barData &&
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
                    padding={padding}
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
      <div style={{ padding: frameWidth, maxWidth: maxWidth }}>
        <DreamNewsText focusedComparison={focusedComparison} />
      </div>
    </div>
  );
}

export default App;
