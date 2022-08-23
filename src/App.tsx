import { useEffect } from "react";
import "./App.css";
import GraphContainer from "./graph/graph-container";
import AreaGraphContainer from "./area-graph/area-graph-container";
import { useSelector } from "./ducks/root-reducer";
import {
  fetchBubbleData,
  selectComparisons,
  selectIsLoading,
  fetchAreaData,
  selectDifferences,
  fetchColumnData,
  selectColumnData,
} from "./ducks/data";
import { useDispatch } from "react-redux";
import {
  selectActiveGranularity,
  selectShowingGraph,
  setActiveGranularity,
  setFocusedComparison,
  setPrevFocusedComparison,
  setShowingGraph,
} from "./ducks/ui";
import {
  GranularityComparisonCollection,
  DifferenceByGranularity,
} from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import ColumnGraphContainer from "./column-graph/column-graph-container";

const graphtypes: GraphType[] = ["area", "bubble", "column"];

export type SimilarityDescription = { percent: number; count: number; threshold: number };

export type ColumnGraphData = {
  month: number;
  count: number;
  avgSimilarity: number;
  highSimilarity: SimilarityDescription;
  mediumSimilarity: SimilarityDescription;
  lowSimilarity: SimilarityDescription;
};

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

  // Dummy data for bubbles
  // For when allComparisons hasn't loaded yet
  const defaultData: GranularityComparisonCollection = {
    comparisonSets: [],
    maxSimilarity: 1,
    minSimilarity: 0,
    maxWordCount: 100,
    minWordCount: 1,
    granularity: activeGranularity,
  };

  // Dummy data for columns
  const defaultDifferencesData: DifferenceByGranularity = {
    day: [
      {
        key: "2020",
        color: "#fff",
        comparisons: {
          differences: [],
          maxSimilarity: 1,
          minSimilarity: 0,
          maxAverageSimilarity: 1,
        },
      },
    ],
    week: [
      {
        key: "2020",
        color: "#fff",
        comparisons: {
          differences: [],
          maxSimilarity: 1,
          minSimilarity: 0,
          maxAverageSimilarity: 1,
        },
      },
    ],
    month: [
      {
        key: "2020",
        color: "#fff",
        comparisons: {
          differences: [],
          maxSimilarity: 1,
          minSimilarity: 0,
          maxAverageSimilarity: 1,
        },
      },
    ],
    year: [
      {
        key: "2020",
        color: "#fff",
        comparisons: {
          differences: [],
          maxSimilarity: 1,
          minSimilarity: 0,
          maxAverageSimilarity: 1,
        },
      },
    ],
  };

  const defaultColumnGraphData: ColumnGraphData[] = [
    {
      month: 0,
      count: 961,
      avgSimilarity: 0.010360882948074924,
      highSimilarity: { percent: 0, count: 0, threshold: 0.05 },
      mediumSimilarity: { percent: 0, count: 0, threshold: 0.025 },
      lowSimilarity: { percent: 100, count: 961, threshold: 0 },
    },
  ];

  const data: GranularityComparisonCollection = allComparisons
    ? allComparisons[activeGranularity]
    : defaultData;

  const diffData = differencesData || defaultDifferencesData;
  const columnGraphData = columnData || defaultColumnGraphData;

  // Initial data fetch
  useEffect(() => {
    dispatch<any>(fetchBubbleData());
    dispatch<any>(fetchAreaData());
    dispatch<any>(fetchColumnData());
  }, [dispatch]);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        height: 600,
        padding: window.location.href.includes("localhost") ? 20 : 0,
        maxWidth: window.location.href.includes("localhost")
          ? "calc(100% - 40px)"
          : "90rem",
      }}
    >
      <div
        className="App"
        style={{ height: "100%", width: "100%", border: "1px solid #EEE" }}
      >
        <GraphTypeToggle
          onSelectGraphType={setShowingGraph}
          showingGraph={showingGraph}
        />
        {isLoading && <div>Loading...</div>}
        {!isLoading && showingGraph === "area" && <AreaGraphContainer data={diffData} />}
        {!isLoading && showingGraph === "bubble" && <GraphContainer data={data} />}
        {!isLoading && showingGraph === "column" && (
          <ColumnGraphContainer data={columnGraphData} />
        )}
      </div>
    </div>
  );
}

export default App;
