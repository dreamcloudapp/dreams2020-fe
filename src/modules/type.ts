export type WikipediaConcept = {
  title: string;
  link: string;
};

export type DateTimeRange = {
  startDate: Date;
  endDate: Date;
};

export type Comparison = {
  score: number;
  dreamId: number;
  newsId: number;
  relatedConcepts: WikipediaConcept[];
};

export type ComparisonSet = {
  label: string; // e.g. "March 2020 Dreams vs. March 2020 News"
  dreamDates: DateTimeRange;
  newsDates: DateTimeRange;
  similarity: number;
  examples: Comparison[];
  relatedConcepts: WikipediaConcept[];
};
