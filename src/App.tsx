import { useMemo } from "react";
import "./App.css";
import { createFakeData } from "./modules/generateFakeData";
import Graph from "./graph/graph";

function App() {
  const data = useMemo(() => {
    return createFakeData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div className="App" style={{ height: 800, border: "1px solid red" }}>
        <Graph data={data} />
      </div>
    </div>
  );
}

export default App;
