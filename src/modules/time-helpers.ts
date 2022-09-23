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

// Turn a month index into a month name
export const monthNameFromIndex = (index: number): string => {
  if (shortMonths[index]) {
    return shortMonths[index];
  } else {
    throw new Error("Invalid month index");
  }
};
