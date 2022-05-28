import { Granularity } from "@kannydennedy/dreams-2020-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./root-reducer";

export type CollectionCheck = {
  label: string;
  checked: boolean;
};

export type UIState = {
  activeGranularity: Granularity;
  checkedCollections: CollectionCheck[];
};

const initialState: UIState = {
  activeGranularity: "month",
  checkedCollections: [],
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
    toggleCollectionChecked(state, action: PayloadAction<string>) {
      const collection = state.checkedCollections.find(c => c.label === action.payload);
      if (collection) {
        collection.checked = !collection.checked;
      }
    },
  },
});

export const { setActiveGranularity, setCheckedCollections, toggleCollectionChecked } =
  uiSlice.actions;

export const selectActiveGranularity = (state: RootState): Granularity => {
  return state?.ui.activeGranularity;
};

export const selectCheckedCollections = (state: RootState): CollectionCheck[] => {
  return state?.ui.checkedCollections;
};

export default uiSlice;
