// import { useDispatch } from "react-redux";
// import { SIMILARITY_COLORS } from "../modules/theme";
// import { BasedAxis } from "../axes/before-after-axis";
// import { BallOverlay } from "../ball/ball-overlay";
// import { Column } from "../components/column";
// import { useSelector } from "../ducks/root-reducer";
// import {
//   selectActiveComparisonSet,
//   selectFocusedComparison,
//   selectPrevFocusedComparison,
//   setActiveComparisonSet,
//   setFocusedComparison,
//   VisComparison,
// } from "../ducks/ui";
// import { prettyNumber } from "../modules/formatters";
// import { monthNameFromIndex } from "../modules/time-helpers";
// import { Padding } from "../modules/ui-types";
// import { ColumnGraphData, SimilarityLevel } from "@kannydennedy/dreams-2020-types";
import { RadarPersonData } from "../ducks/data";

type RadarGraphProps = {
  data: RadarPersonData[];
  //   width: number;
  //   height: number;
  //   padding: Padding;
  //   handleMouseOver: (event: any, datum: any) => void;
  //   onMouseOut: () => void;
};

export function RadarGraph({
  data,
}: //   width,
//   height,
//   handleMouseOver,
//   onMouseOut,
//   padding,
RadarGraphProps) {
  // const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return <div>Radar graph</div>;
}
