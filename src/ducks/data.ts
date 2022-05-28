import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
// import { QueryBase } from "../types/queries";
// import { debounce } from "lodash/fp";
import { AppThunk } from "./store";
import { RootState } from "./root-reducer";
import {
  Granularity,
  ComparisonSet,
  GranularityComparisonCollection,
} from "@kannydennedy/dreams-2020-types";

export type BigBigThing = { [key in Granularity]: GranularityComparisonCollection };

export type ComparisonSets = {
  granularity: Granularity;
  comparisonSets: ComparisonSet[];
};

// The maximum time index distance for a given granularity
// E.g. for granularity "month", the max distance is 11
export const MAX_DISTANCE_BETWEEN_TIME_PERIODS: { [key in Granularity]: number } = {
  day: 2, // 2 days max between day comparisons
  week: 4, // 3 weeks max between week comparisons
  month: 11, // 11 months max between month comparisons (since we only compare January to December, not January to January)
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

// Get the comparison sets for a given granularity
export const selectComparisonsByGranularity = (
  granularity: Granularity,
  state: RootState
): GranularityComparisonCollection => {
  if (state.data.comparisons) {
    return state.data.comparisons[granularity];
  } else {
    return {
      granularity: granularity,
      maxSimilarity: 1,
      minSimilarity: 0,
      maxWordCount: 100,
      minWordCount: 1,
      comparisonSets: [],
    };
  }
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
