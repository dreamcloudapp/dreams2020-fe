import { useMemo } from "react";
import "./App.css";
import { createFakeData } from "./modules/generateFakeData";
import GraphContainer from "./graph/graph-container";
import { MILLISECONDS_IN_YEAR } from "./modules/constants";

function App() {
  const data = useMemo(() => {
    return createFakeData();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: 600,
        padding: window.location.href.includes("localhost") ? 20 : 0,
      }}
    >
      <div
        className="App"
        style={{ height: "100%", width: "100%", border: "1px solid #EEE" }}
      >
        <GraphContainer data={data} maxTimeDistance={MILLISECONDS_IN_YEAR} />
      </div>
    </div>
  );
}

export default App;
