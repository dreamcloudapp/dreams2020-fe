import { useEffect } from "react";
import "./App.css";
import GraphContainer from "./graph/graph-container";
import { useSelector } from "./ducks/root-reducer";
import { BigThing, fetchMonths, selectComparisons, selectIsLoading } from "./ducks/data";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const allComparisons = useSelector(selectComparisons);

  const monthData = allComparisons
    ? allComparisons.month
    : ({ granularity: "month", comparisonSets: [] } as BigThing);

  // Initial data fetch
  useEffect(() => {
    dispatch<any>(fetchMonths());
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
        {isLoading ? <div>Loading...</div> : <GraphContainer data={monthData} />}
      </div>
    </div>
  );
}

export default App;
