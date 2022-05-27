const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const FEB_28_INDEX = 58;

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
export const getDayIndexFromDate = (date: Date): number => {
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
