import { useMemo } from "react";
import "./App.css";
import { createFakeData } from "./modules/generateFakeData";
import Graph from "./graph/graph";
import { MILLISECONDS_IN_YEAR } from "./modules/constants";

function App() {
  const data = useMemo(() => {
    return createFakeData();
  }, []);

  return (
    <div style={{ padding: window.location.href.includes("localhost") ? 20 : 0 }}>
      <div className="App" style={{ height: 600, border: "1px solid #EEE" }}>
        <Graph data={data} maxTimeDistance={MILLISECONDS_IN_YEAR} />
      </div>
    </div>
  );
}

export default App;
