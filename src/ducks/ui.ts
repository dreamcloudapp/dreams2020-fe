import { Granularity } from "@kannydennedy/dreams-2020-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./root-reducer";

export type CollectionCheck = {
  label: string;
  color: string;
  checked: boolean;
};

export type GraphType = "column" | "bubble" | "area" | "bar" | "radar";

export type VisComparison = {
  x: number;
  y: number;
  index: number;
  concepts: string[];
  startRadius: number;
  color: string;
  label: string;
  subLabel?: string;
  dreamId?: string;
  newsId?: string;
};

export type UIState = {
  activeGranularity: Granularity;
  checkedCollections: CollectionCheck[];
  showingGraph: GraphType;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
  activeComparisonSet: VisComparison[];
};

const initialState: UIState = {
  activeGranularity: "day",
  checkedCollections: [],
  showingGraph: "bar",
  focusedComparison: null,
  prevFocusedComparison: null,
  activeComparisonSet: [],
};

const uiSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setActiveGranularity(state, action: PayloadAction<Granularity>) {
      state.activeGranularity = action.payload;
    },
    setCheckedCollections(state, action: PayloadAction<CollectionCheck[]>) {
      state.checkedCollections = action.payload;
    },
    setShowingGraph(state, action: PayloadAction<GraphType>) {
      state.showingGraph = action.payload;
      // Also reset some things
      state.activeComparisonSet = [];
    },
    setFocusedComparison(state, action: PayloadAction<VisComparison | null>) {
      state.focusedComparison = action.payload;
    },
    setPrevFocusedComparison(state, action: PayloadAction<VisComparison | null>) {
      state.prevFocusedComparison = action.payload;
    },
    setActiveComparisonSet(state, action: PayloadAction<VisComparison[]>) {
      state.activeComparisonSet = action.payload;
    },
    incrementFocusedComparison(state) {
      if (state.focusedComparison) {
        const index = state.focusedComparison.index;
        const nextIndex =
          index + 1 > state.activeComparisonSet.length - 1 ? 0 : index + 1;
        const nextComparison = state.activeComparisonSet[nextIndex];
        if (nextComparison) {
          state.focusedComparison = { ...nextComparison };
        }
      }
    },
    decrementFocusedComparison(state) {
      if (state.focusedComparison) {
        const index = state.focusedComparison.index;
        const nextIndex =
          index - 1 < 0 ? state.activeComparisonSet.length - 1 : index - 1;
        const nextComparison = state.activeComparisonSet[nextIndex];
        if (nextComparison) {
          state.focusedComparison = { ...nextComparison };
        }
      }
    },
    toggleCollectionChecked(state, action: PayloadAction<string>) {
      const collection = state.checkedCollections.find(c => c.label === action.payload);
      if (collection) {
        collection.checked = !collection.checked;
      }
    },
  },
});

export const {
  setActiveGranularity,
  setCheckedCollections,
  toggleCollectionChecked,
  setShowingGraph,
  setFocusedComparison,
  setPrevFocusedComparison,
  setActiveComparisonSet,
  incrementFocusedComparison,
  decrementFocusedComparison,
} = uiSlice.actions;

export const selectActiveGranularity = (state: RootState): Granularity => {
  return state?.ui.activeGranularity;
};

export const selectCheckedCollections = (state: RootState): CollectionCheck[] => {
  return state?.ui.checkedCollections;
};

export const selectShowingGraph = (state: RootState): GraphType => {
  return state?.ui.showingGraph;
};

export const selectFocusedComparison = (state: RootState): VisComparison | null => {
  return state?.ui.focusedComparison;
};

export const selectPrevFocusedComparison = (state: RootState): VisComparison | null => {
  return state?.ui.prevFocusedComparison;
};

export const selectActiveComparisonSet = (state: RootState): VisComparison[] => {
  return state?.ui.activeComparisonSet;
};

export default uiSlice;
