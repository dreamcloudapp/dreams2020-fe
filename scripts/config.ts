import { SimilarityLevel } from "@kannydennedy/dreams-2020-types";

// This is where the actual data is
export const SRC_FOLDER = "../source-data-all";
export const DREAMERS_SRC_FOLDER = "../source-data-dreamers";

// These are just the names of the src files
// When they're first processed by Sheldon on the backend
export const SET2020 = "./all-dreams-final-2020.csv";
export const CONTROL_SET = "./all-dreams-control.csv";

export const SET_2020_NAME = "2020 Dreams vs 2020 News Items";
export const CONTROL_SET_NAME = "Pre-2020 Dreams vs 2020 News Items";

export const NUM_CONCEPTS_PER_COMPARISON = 3;
export const NUM_EXAMPLES_PER_COMPARISON = 100;
export const VERY_LARGE_NUMBER = 999 * 999 * 999;
export const NEWS_YEAR = 2020;

// We're going to choose some arbitrary figures here
// We just want to make sure there's some of each
export const HIGH_SIMILARITY = 0.03;
export const MEDIUM_SIMILARITY = 0.015;

export const SIMILARITY_CUTOFFS: { [key in SimilarityLevel]: number } = {
  high: 0.175,
  medium: 0.07,
  low: 0.05,
  indiscernible: 0,
};

export const palette = [
  "hsl(10, 80%, 61%)",
  "hsl(28, 91%, 65%)",
  "hsl(190, 35%, 60%)",
  "hsl(45, 93%, 37%)",
  "hsl(115, 28%, 42%)",
  "hsl(203, 31%, 46%)",
  "hsl(0, 0%, 57%)",
  "hsl(340, 84%, 40%)",
  "hsl(135, 35%, 63%)",
  "hsl(15, 30%, 60%)",
  "hsl(280, 30%, 60%)",
  "hsl(270, 10%, 70%)",
];
