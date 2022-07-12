import { Granularity } from "@kannydennedy/dreams-2020-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./root-reducer";

export type CollectionCheck = {
  label: string;
  checked: boolean;
};

export type GraphType = "column" | "bubble";

export type VisComparison = {
  x: number;
  y: number;
  concepts: string[];
  startRadius: number;
  color: string;
};

export type UIState = {
  activeGranularity: Granularity;
  checkedCollections: CollectionCheck[];
  showingGraph: GraphType;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
};

const initialState: UIState = {
  activeGranularity: "day",
  checkedCollections: [],
  showingGraph: "column",
  focusedComparison: null,
  prevFocusedComparison: null,
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
    },
    setFocusedComparison(state, action: PayloadAction<VisComparison | null>) {
      state.focusedComparison = action.payload;
    },
    setPrevFocusedComparison(state, action: PayloadAction<VisComparison | null>) {
      state.prevFocusedComparison = action.payload;
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

export default uiSlice;
