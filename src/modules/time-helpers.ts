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

// Turn a date into a pretty string
// (e.g. "Jan 1, 2020")
export const prettyDate = (date: Date): string => {
  console.log("date", date);

  const month = monthNameFromIndex(date.getMonth());
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};
