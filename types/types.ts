import { ColorTheme } from "../src/modules/theme";

export type Point = [number, number];
export type Focus = "focused" | "unfocused";

export type DreamRecord = {
  id: number;
  text: String;
  date: Date;
};

export type NewsRecord = {
  id: number;
  text: String;
  date: Date;
};

// Set of DreamRecords keyed by id
export type DreamRecordDictionary = {
  [key: number]: DreamRecord;
};

// Set of news records keyed by id
export type NewsRecordDictionary = {
  [key: number]: NewsRecord;
};

// A collection of dreams with a label
// E.g. "2020 Dreams"
export type DreamCollection = {
  label: String;
  collectionStartDate: Date;
  collectionEndDate: Date;
  timePeriodStartDate: Date;
  timePeriodEndDate: Date;
  year: String;
  dreams: DreamRecordDictionary;
};

export type NewsCollection = {
  label: String;
  collectionStartDate: Date;
  collectionEndDate: Date;
  timePeriodStartDate: Date;
  timePeriodEndDate: Date;
  year: String;
  news: NewsRecordDictionary;
};

export type Comparison = {
  score: number;
  dreamId: number;
  newsId: number;
  dataLabel: string;
  topCommonConceptIds: string[];
};

export type WikipediaConcept = {
  title: string;
  link: string;
};

// Set of wikipedia articles keyed by title
export type WikipediaConceptDictionary = {
  [key: string]: WikipediaConcept;
};

// A comparison set should be between one dream collection one news collection
// In our case, 2020 dreams / 2020 News, and e.g. 2010 dreams / 2020 News
export type ComparisonSet = {
  label: String;
  comparisons: Comparison[];
  color: ColorTheme;
  dreamCollection: DreamCollection;
  newsCollection: NewsCollection;
};

//
export type ComparisonSets = {
  comparisonSets: ComparisonSet[];
};
