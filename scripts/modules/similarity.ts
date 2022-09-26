// We check if a particular dream day / news day combination

import { SimilarityLevel } from "@kannydennedy/dreams-2020-types";
import { HIGH_SIMILARITY, MEDIUM_SIMILARITY } from "../config";

export const getSimilarityLevel = (similarity: number): SimilarityLevel => {
  const isHigh = similarity >= HIGH_SIMILARITY;
  const isMedium = similarity >= MEDIUM_SIMILARITY && similarity < HIGH_SIMILARITY;
  const isLow = similarity < MEDIUM_SIMILARITY;

  if (isHigh) {
    return "high";
  } else if (isMedium) {
    return "medium";
  } else if (isLow) {
    return "low";
  } else {
    throw new Error("Something bad happened in getSimilarityLevel");
  }
};
