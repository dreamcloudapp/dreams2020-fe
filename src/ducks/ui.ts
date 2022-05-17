import { Granularity } from "@kannydennedy/dreams-2020-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./root-reducer";

export type UIState = {
  activeGranularity: Granularity;
};

const initialState: UIState = {
  activeGranularity: "month",
};

const uiSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setActiveGranularity(state, action: PayloadAction<Granularity>) {
      state.activeGranularity = action.payload;
    },
  },
});

export const { setActiveGranularity } = uiSlice.actions;

export const selectActiveGranularity = (state: RootState): Granularity => {
  return state?.ui.activeGranularity;
};

export default uiSlice;
