import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
// import { QueryBase } from "../types/queries";
// import { debounce } from "lodash/fp";
import { AppThunk } from "./store";
import { RootState } from "./root-reducer";
import { Granularity } from "@kannydennedy/dreams-2020-types";
import { ColorTheme } from "../modules/theme";

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

type Thing = {
  label: string;
  color: ColorTheme;
  comparisons: ComparisonSet[];
};

export type BigThing = {
  granularity: Granularity;
  comparisonSets: Thing[];
};

export type BigBigThing = { [key in Granularity]: BigThing };

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
  score: number;
  wordCount: number;
  examples: RecordComparison[];
  concepts: WikipediaConcept[];
};

export type ComparisonSets = {
  granularity: Granularity;
  comparisonSets: ComparisonSet[];
};

// The maximum time index distance for a given granularity
// E.g. for granularity "month", the max distance is 11
export const MAX_DISTANCE_BETWEEN_TIME_PERIODS: { [key in Granularity]: number } = {
  day: 2, // 2 days max between day comparisons
  week: 4, // 3 weeks max between week comparisons
  month: 12, // 12 months max between month comparisons
  year: 30, // 30 years max between year comparisons
};

export type DataState = {
  loading: boolean;
  comparisons?: BigBigThing;
};

const initialState: DataState = {
  loading: true,
  comparisons: undefined,
};

const dataSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setComparisons(state, action: PayloadAction<BigBigThing>) {
      state.comparisons = action.payload;
    },
  },
});

export default dataSlice;

// ----------------------------------------------------------------------------
// Selectors

export const selectComparisons = (state: RootState): BigBigThing | undefined => {
  return state?.data.comparisons;
};

export const selectIsLoading = (state: RootState): boolean => {
  return state?.data.loading;
};

// ----------------------------------------------------------------------------
// Thunks

// Files and their associated granularity
const files = [
  {
    name: "monthComparisons.json",
    granularity: "month",
  },
  {
    name: "weekComparisons.json",
    granularity: "week",
  },
  {
    name: "dayComparisons.json",
    granularity: "day",
  },
  {
    name: "yearComparisons.json",
    granularity: "year",
  },
];

// Loads the data from the files
export function fetchMonths(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    // Months
    const allData = await Promise.all(
      files.map(async file => {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${file.name}`);
        const data = await response.json();
        return data;
      })
    );

    const allComparisonsMap: BigBigThing = allData.reduce((acc, curr, i) => {
      return {
        ...acc,
        [files[i].granularity]: curr,
      };
    }, {} as BigBigThing);

    dispatch(dataSlice.actions.setComparisons(allComparisonsMap));
    dispatch(dataSlice.actions.setLoading(false));
  };
}
