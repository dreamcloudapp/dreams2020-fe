import { useMemo } from "react";
import "./App.css";
import { createFakeData } from "./modules/generateFakeData";
import Graph from "./graph/graph";

function App() {
  const data = useMemo(() => {
    return createFakeData();
  }, []);

  return (
    <div className="App">
      <Graph data={data} />
    </div>
  );
}

export default App;
