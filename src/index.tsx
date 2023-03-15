import React from "react";
import ReactDOM from "react-dom";
import store from "./ducks/store";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GraphType } from "./ducks/ui";

export type ChartOpts = {
  activeChart?: GraphType;
  showAll?: boolean;
  activeLegends?: { [key in GraphType]?: string[] };
  toggleableCharts?: GraphType[];
  darkMode?: boolean | undefined;
};

declare global {
  interface Window {
    embedDreamChart: Function;
  }
}

window.embedDreamChart = function (
  htmlTagId: keyof HTMLElementTagNameMap,
  opts: ChartOpts = {}
) {
  const { activeChart, showAll, activeLegends, toggleableCharts, darkMode } = opts;

  const el = document.querySelector(htmlTagId);
  const render = () => {
    ReactDOM.render(
      <React.StrictMode>
        <Provider store={store}>
          <App
            activeChart={activeChart}
            showAll={showAll}
            activeLegends={activeLegends}
            toggleableCharts={toggleableCharts}
            darkMode={!!darkMode}
          />
        </Provider>
      </React.StrictMode>,
      el
    );
  };
  render();
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
