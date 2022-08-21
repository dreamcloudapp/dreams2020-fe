const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const FEB_28_INDEX = 58;
const LAST_DAY_OF_YEAR_INDEX = 364;
const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Get the difference between two dates in days
// If the second date is after the first, the result is positive
// If the second date is before the first, the result is negative
// If the second date is the same as the first, the result is 0
export function getDifferenceInDays(date1: Date, date2: Date): number {
  const difference = date2.getTime() - date1.getTime();
  return Math.floor(difference / MILLISECONDS_IN_DAY);
}

// Turn a month index into a month name
export const monthNameFromIndex = (index: number): string => {
  if (shortMonths[index]) {
    return shortMonths[index];
  } else {
    throw new Error("Invalid month index");
  }
};

// Determine if a year is a leap year
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// Get the first day of a year
export const getFirstDayOfYear = (year: number): Date => {
  return new Date(year, 0, 1);
};

// Add a specified number of days to a date
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Basically, get "what number day in the year is this date?" (0-365)
// Except, Feb 28-29 are counted as index 58
export const dayIndexFromDate = (date: Date): number => {
  // Determine if the date is a leap year
  const year = date.getFullYear();
  const isLeap = isLeapYear(year);

  // Get what number day in the year it is
  const firstDayOfTheYear = getFirstDayOfYear(year);
  const diff = date.getTime() - firstDayOfTheYear.getTime();
  const dayIndex = Math.floor(diff / MILLISECONDS_IN_DAY);

  if (isLeap) {
    if (dayIndex === FEB_28_INDEX || dayIndex === FEB_28_INDEX + 1) {
      return FEB_28_INDEX;
    } else if (dayIndex > FEB_28_INDEX) {
      return dayIndex - 1;
    } else {
      return dayIndex;
    }
  } else {
    return dayIndex;
  }
};

// Basically, get "what number week in the year is this date?" (0-52)
export const weekIndexFromDate = (date: Date): number => {
  const dayIndex = dayIndexFromDate(date);

  // 365 days in a year (366 in a leap year, but this is normalised by getDayIndexFromDate)
  // 364 is divisible by 7, so we just need to count December 30 and 31 as one 'day'.
  const normalisedDayIndex =
    dayIndex === LAST_DAY_OF_YEAR_INDEX ? LAST_DAY_OF_YEAR_INDEX - 1 : dayIndex;

  return Math.floor(normalisedDayIndex / 7);
};

// Get "what number month in the year is this date?" (0-11)
export const monthIndexFromDate = (date: Date): number => {
  return date.getMonth();
};
