import {
  weekIndexFromDate,
  dayIndexFromDate,
  getDifferenceInDays,
  monthNameFromIndex,
  isLeapYear,
  getFirstDayOfYear,
  addDays,
  monthIndexFromDate,
} from "../../scripts/modules/time-helpers";

test("dayIndexFromDate", () => {
  // If the date is a leap year, Feb 28-29 are counted as index 58
  // This makes all years comparable
  const date = new Date("2020-02-28");
  const index = dayIndexFromDate(date);
  expect(index).toBe(58);
  const date2 = new Date("2020-02-29");
  const index2 = dayIndexFromDate(date2);
  expect(index2).toBe(58);
});

test("weekIndexFromDate", () => {
  const date = new Date("2019-01-08");
  const index = weekIndexFromDate(date);
  expect(index).toBe(1);
  const date2 = new Date("2019-02-25");
  const index2 = weekIndexFromDate(date2);
  expect(index2).toBe(7);
});

test("monthIndexFromDate", () => {
  const date = new Date("2019-01-01");
  const index = monthIndexFromDate(date);
  expect(index).toBe(0);
  const date2 = new Date("2019-02-01");
  const index2 = monthIndexFromDate(date2);
  expect(index2).toBe(1);
  const date3 = new Date("2019-03-01");
  const index3 = monthIndexFromDate(date3);
  expect(index3).toBe(2);
});

test("getDifferenceInDays", () => {
  const date1 = new Date("2019-01-08");
  const date2 = new Date("2019-01-09");
  const index = getDifferenceInDays(date1, date2);
  expect(index).toBe(1);
  const date3 = new Date("2019-01-10");
  const index3 = getDifferenceInDays(date3, date1);
  expect(index3).toBe(-2);
  const index4 = getDifferenceInDays(date1, date1);
  expect(index4).toBe(0);
});

test("monthNameFromIndex", () => {
  const index = monthNameFromIndex(0);
  expect(index).toBe("Jan");
  const index2 = monthNameFromIndex(11);
  expect(index2).toBe("Dec");
});

test("isLeapYear", () => {
  const res = isLeapYear(2020);
  expect(res).toBe(true);
  const res2 = isLeapYear(2019);
  expect(res2).toBe(false);
});

test("getFirstDayOfYear", () => {
  const res = getFirstDayOfYear(2020);
  const comparison = new Date("2020-01-01");
  expect(res).toEqual(comparison);
});

test("addDays", () => {
  const date = new Date("2019-01-01");
  const date2 = addDays(date, 1);
  const comparison = new Date("2019-01-02");
  expect(date2).toEqual(comparison);
});

export {};
