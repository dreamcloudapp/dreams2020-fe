import { useMemo } from "react";
import "./App.css";
import { createFakeData } from "./modules/generateFakeData";
import GraphContainer from "./graph/graph-container";

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
        maxWidth: window.location.href.includes("localhost")
          ? "calc(100% - 40px)"
          : "90rem",
      }}
    >
      <div
        className="App"
        style={{ height: "100%", width: "100%", border: "1px solid #EEE" }}
      >
        <GraphContainer data={data} />
      </div>
    </div>
  );
}

export default App;
