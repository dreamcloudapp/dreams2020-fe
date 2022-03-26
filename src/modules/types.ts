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

export type Comparison = {
  score: number;
  dreamId: number;
  newsId: number;
  dataLabel: string;
};

export type ComparisonData = {
  comparisons: Comparison[];
  dreams: DreamRecordDictionary;
  news: NewsRecordDictionary;
};
