import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
// import { QueryBase } from "../types/queries";
// import { debounce } from "lodash/fp";
import { AppThunk } from "./store";
import { RootState } from "./root-reducer";

type Granularity = "day" | "week" | "month" | "year";

// It's an interesting question how to compare time periods across years
// For months, it's easy -> just compare the month number
// For weeks, we compare the week number, but we have to know that Feb. 29 creates an "8 day week", as does December 31.
// For days, we say that February 28-29 is the same day.
type TimePeriod = {
  granularity: Granularity;
  identifier: string; // something that uniquely identifies the time period. E.g. "March", "Week 40", or "Feb 27"
  index: number; // e.g. 0 for January, 1 for February, 1 for the first of the month, etc.
};

type WikipediaConcept = {
  title: string;
  link: string;
};

// Dream Record or News Record
// type ItemRecord = {
//   id: number;
//   text: String;
//   date: Date;
// };

// Set of records keyed by id
// type RecordDictionary = {
//   [key: number]: ItemRecord;
// };

// type DateTimeRange = {
//   from: Date;
//   to: Date;
// };

type RecordComparison = {
  score: number;
  dreamId: number;
  newsId: number;
  concepts: WikipediaConcept[];
};

type CollectionParams = {
  label: string;
  timePeriod: TimePeriod;
};

type ComparisonSet = {
  id: string;
  granularity: Granularity; // "day", "week", "month", "year"
  label: string; // E.g. "March 2020 Dreams vs. April 2020 News"
  collection1: CollectionParams;
  collection2: CollectionParams;
  similarity: number;
  examples: RecordComparison[];
  concepts: WikipediaConcept[];
};

export type DataState = {
  months: ComparisonSet[];
  loading: boolean;
};

const initialState: DataState = {
  loading: true,
  months: [],
};

const dataSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setMonths(state, action: PayloadAction<ComparisonSet[]>) {
      state.months = action.payload;
    },
  },
});
export default dataSlice;

// ----------------------------------------------------------------------------
// Selectors

export const selectMonths = (state: RootState): ComparisonSet[] | undefined => {
  return state?.data.months;
};

export const selectIsLoading = (state: RootState): boolean | undefined => {
  return state?.data.loading;
};

// ----------------------------------------------------------------------------
// Thunks

export function fetchMonths(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const url = `${process.env.PUBLIC_URL}/data/monthComparisons.json`;
    const response = await fetch(url);
    const data = await response.json();

    dispatch(dataSlice.actions.setMonths(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}
