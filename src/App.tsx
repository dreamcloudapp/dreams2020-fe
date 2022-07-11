import { useEffect } from "react";
import "./App.css";
import GraphContainer from "./graph/graph-container";
import ColumnGraphContainer from "./column-graph/column-graph-container";
import { useSelector } from "./ducks/root-reducer";
import {
  fetchMonths,
  selectComparisons,
  selectIsLoading,
  fetchDifferences,
  selectDifferences,
} from "./ducks/data";
import { useDispatch } from "react-redux";
import { selectActiveGranularity, selectShowingGraph, setShowingGraph } from "./ducks/ui";
import {
  GranularityComparisonCollection,
  DifferenceByGranularity,
} from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";

const graphtypes: GraphType[] = ["column", "bubble"];

function GraphTypeToggle({
  onSelectGraphType,
}: {
  onSelectGraphType: (graphType: GraphType) => void;
}) {
  const dispatch = useDispatch();
  return (
    <div className="graph-type-toggle">
      {graphtypes.map(graphType => (
        <button
          key={graphType}
          onClick={() => {
            dispatch<any>(onSelectGraphType(graphType));
          }}
          className={graphType === "column" ? "active" : ""}
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

  // For when allComparisons hasn't loaded yet
  const defaultData: GranularityComparisonCollection = {
    comparisonSets: [],
    maxSimilarity: 1,
    minSimilarity: 0,
    maxWordCount: 100,
    minWordCount: 1,
    granularity: activeGranularity,
  };

  const defaultDifferencesData: DifferenceByGranularity = {
    day: {
      differences: [],
      maxSimilarity: 1,
      minSimilarity: 0,
    },
    week: {
      differences: [],
      maxSimilarity: 1,
      minSimilarity: 0,
    },
    month: {
      differences: [],
      maxSimilarity: 1,
      minSimilarity: 0,
    },
    year: {
      differences: [],
      maxSimilarity: 1,
      minSimilarity: 0,
    },
  };

  const data: GranularityComparisonCollection = allComparisons
    ? allComparisons[activeGranularity]
    : defaultData;

  const diffData = differencesData || defaultDifferencesData;

  // Initial data fetch
  useEffect(() => {
    dispatch<any>(fetchMonths());
    dispatch<any>(fetchDifferences());
  }, [dispatch]);

  return (
    <div
      style={{
        width: "100%",
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
        <GraphTypeToggle onSelectGraphType={setShowingGraph} />
        {isLoading ? (
          <div>Loading...</div>
        ) : showingGraph === "column" ? (
          <ColumnGraphContainer data={diffData} />
        ) : (
          <GraphContainer data={data} />
        )}
      </div>
    </div>
  );
}

export default App;
