import { BubbleGraph } from "./bubble-graph";
import { MILLISECONDS_IN_YEAR } from "../modules/constants";
import { Granularity } from "../../types/type";
import { GranularityComparisonCollection } from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  setActiveGranularity,
  selectFocusedComparison,
  selectPrevFocusedComparison,
  selectShowingGraph,
} from "../ducks/ui";
import { useDispatch } from "react-redux";
import { Padding } from "../modules/ui-types";

type GraphProps = {
  data: GranularityComparisonCollection;
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  onMouseOut: () => void;
  padding: Padding;
};

const timeLabels: { key: Granularity; label: string }[] = [
  { key: "month", label: "Months" },
  { key: "week", label: "Weeks" },
];

export function BubbleGraphContainer({
  data,
  width,
  height,
  handleMouseOver,
  onMouseOut,
  padding,
}: GraphProps) {
  const dispatch = useDispatch();
  const activeGranularity = useSelector(selectActiveGranularity);

  const focusedComparison = useSelector(selectFocusedComparison);
  const prevFocusedComparison = useSelector(selectPrevFocusedComparison);
  const showingGraph = useSelector(selectShowingGraph);

  // We only show comparisons that fall within this range
  // const [maxTimeDistance, setMaxTimeDistance] = useState<number>(MILLISECONDS_IN_YEAR);

  const maxTimeDistance = MILLISECONDS_IN_YEAR;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        {width > 0 && height > 0 && (
          <BubbleGraph
            data={data}
            maxTimeDistance={maxTimeDistance}
            width={width}
            height={height}
            handleMouseOver={handleMouseOver}
            hideTooltip={onMouseOut}
            focusedComparison={focusedComparison}
            prevFocusedComparison={prevFocusedComparison}
            padding={padding}
          />
        )}
        {/* Select active time period - don't show when there's a focused comparison */}
        {!focusedComparison && showingGraph === "bubble" && (
          <div style={{ position: "absolute", left: 100, top: 0 }}>
            <span>View: </span>
            {timeLabels.map(({ key, label }) => {
              const isActive = key === activeGranularity;
              return (
                <button
                  key={key}
                  className={isActive ? "selected" : "unselected"}
                  onClick={() => {
                    dispatch(setActiveGranularity(key));
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
