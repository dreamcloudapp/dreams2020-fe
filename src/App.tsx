import { useEffect, useRef } from "react";
import "./App.css";
import { BubbleGraphContainer } from "./bubble-graph/bubble-graph-container";
import { AreaGraphContainer } from "./area-graph/area-graph-container";
import { ColumnGraphContainer } from "./column-graph/column-graph-container";
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
  selectRadarData,
  fetchRadarData,
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
import { GranularityComparisonCollection } from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import {
  defaultBarData,
  defaultColumnGraphData,
  defaultData,
  defaultDifferencesData,
  defaultRadarData,
} from "./initial-dummy-data";
import useComponentSize from "@rehooks/component-size";
import { localPoint } from "@visx/event";
import { BarGraphContainer } from "./bar-graph/bar-graph-container";
import { Padding } from "./modules/ui-types";
import { DreamNewsText } from "./dream-news-text/dream-news-text";
import { RadarGraph } from "./radar-graph/radar-graph";

const padding: Padding = {
  LEFT: 50,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 100,
};

const graphtypes: GraphType[] = ["area", "bar", "bubble", "column", "radar"];

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
          {graphType}
        </button>
      ))}
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const allComparisons = useSelector(selectComparisons);
  const activeGranularity = useSelector(selectActiveGranularity);
  const showingGraph = useSelector(selectShowingGraph);
  const differencesData = useSelector(selectDifferences);
  const columnData = useSelector(selectColumnData);
  const barData = useSelector(selectBarData);
  const radarData = useSelector(selectRadarData);
  const focusedComparison = useSelector(selectFocusedComparison);

  const data: GranularityComparisonCollection = allComparisons
    ? allComparisons[activeGranularity]
    : defaultData;

  const diffData = differencesData || defaultDifferencesData;
  const columnGraphData = columnData || defaultColumnGraphData;
  const barGraphData = barData || defaultBarData;
  const radarGraphData = radarData || defaultRadarData;

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
    dispatch<any>(fetchBubbleData());
    dispatch<any>(fetchAreaData());
    dispatch<any>(fetchColumnData());
    dispatch<any>(fetchBarData());
    dispatch<any>(fetchDreams());
    dispatch<any>(fetchNews());
    dispatch<any>(fetchRadarData());
  }, [dispatch]);

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
          height: showingGraph === "radar" ? "auto" : 600,
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
              <GraphTypeToggle
                onSelectGraphType={setShowingGraph}
                showingGraph={showingGraph}
              />
              {(isLoading || !width || width < 1) && <div>Loading...</div>}
              {!isLoading && showingGraph === "area" && (
                <AreaGraphContainer
                  data={diffData}
                  width={width}
                  height={height}
                  handleMouseOver={handleMouseOver}
                  onMouseOut={hideTooltip}
                  padding={padding}
                />
              )}
              {!isLoading && showingGraph === "bubble" && (
                <BubbleGraphContainer
                  data={data}
                  width={width}
                  height={height}
                  handleMouseOver={handleMouseOver}
                  onMouseOut={hideTooltip}
                  padding={padding}
                />
              )}
              {!isLoading && showingGraph === "column" && (
                <ColumnGraphContainer
                  data={columnGraphData}
                  width={width}
                  height={height}
                  handleMouseOver={handleMouseOver}
                  onMouseOut={hideTooltip}
                  padding={padding}
                />
              )}
              {!isLoading && showingGraph === "bar" && (
                <BarGraphContainer
                  data={barGraphData}
                  width={width}
                  height={height}
                  handleMouseOver={handleMouseOver}
                  onMouseOut={hideTooltip}
                  padding={padding}
                />
              )}
              {!isLoading && showingGraph === "radar" && (
                <RadarGraph data={radarGraphData} width={width} />
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
