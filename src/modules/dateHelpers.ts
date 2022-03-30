import { MILLISECONDS_IN_YEAR } from "./constants";

// Slightly naive implementations
export const yearStartDate = (year: String): Date => {
  return new Date(`${year}-01-01T00:00:01`);
};

export const yearEndDate = (year: String): Date => {
  return new Date(`${year}-12-31T23:59:59`);
};

export const millisecondsToYear = (milliseconds: number): String => {
  return (milliseconds / MILLISECONDS_IN_YEAR).toFixed(2);
};
