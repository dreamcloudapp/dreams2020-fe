import {
  ComparisonSet,
  GranularityComparisonCollection,
  ColoredSetWithinGranularity,
  Granularity,
  ExamplesWithSimilarityLevel,
  ExampleRecordComparison,
} from "@kannydennedy/dreams-2020-types";
import { consolidateExampleList, consolidateWikipediaConceptList } from "./mergers";
import { monthNameFromIndex } from "./time-helpers";

const VERY_LARGE_NUMBER = 999 * 999 * 999;
// The maximum time index distance for a given granularity
// E.g. month: 6 would be 6 months
// This is duplicated in ducks/data.ts
export const MAX_DISTANCE_BETWEEN_TIME_PERIODS: { [key in Granularity]: number } = {
  day: 2,
  week: 3,
  month: 6,
  year: 30,
};

const generateTooltipLabel = (
  dreamIndex: number,
  newsIndex: number,
  granularity: Granularity
): string => {
  if (granularity === "month") {
    // e.g. "March Dreams vs. April News"
    // Convert dreamIndex and newsIndex to month names
    const dreamMonth = monthNameFromIndex(dreamIndex);
    const newsMonth = monthNameFromIndex(newsIndex);
    return `${dreamMonth} Dreams vs. ${newsMonth} News`;
  } else if (granularity === "week") {
    // e.g. "Week 1 Dreams vs. Week 2 News"
    // Convert dreamIndex and newsIndex to week numbers
    return `Week ${dreamIndex} Dreams vs. Week ${newsIndex} News`;
  } else {
    return "Error in generateLabel";
  }
};

// We have the 'day comparisons', and we need to change these
// to week comparisons or month comparisons
export const getBroaderGranularity = (
  granularity: Granularity,
  indexFromDateFn: (date: Date | undefined) => number,
  dayComparisonDictionaries: ColoredSetWithinGranularity[],
  numExamplesPerComparison: number
): GranularityComparisonCollection => {
  // Turn the day comparison dictionaries into week comparison dictionaries
  let maxTimePeriodSimilarity = 0;
  let minTimePeriodSimilarity = 1;
  let maxWordCount = 0;
  let minWordCount = VERY_LARGE_NUMBER;
  const timePeriodComparisonDictionaries: ColoredSetWithinGranularity[] =
    dayComparisonDictionaries.map(dict => {
      // Label and color are the same between day, week and month
      // Just need to change the comparisons
      // We need an object keyed by index-index (dream week index, news week index)
      // We can just concat the top concepts and examples for now,
      // Then deal with ordering and consolidating them later

      const consolidatedDictionary: { [key: string]: ComparisonSet } =
        dict.comparisons.reduce((acc, comparison, i) => {
          // Get the index from the date & the granularity
          // E.g. if the granularity is week and the date is Jan 8, then the index is 1.
          const dreamTimeIndex = indexFromDateFn(
            comparison.dreamCollection.timePeriod.start
          );
          const newsTimeIndex = indexFromDateFn(
            comparison.newsCollection.timePeriod.start
          );
          const key = `${granularity}-${dreamTimeIndex}-${newsTimeIndex}`;

          if (!acc[key]) {
            // If we don't have this key yet, add a new comparison
            // The 'Comparison Set' is basically one 'bubble'
            const comp: ComparisonSet = {
              id: key,
              granularity: granularity,
              label: generateTooltipLabel(dreamTimeIndex, newsTimeIndex, granularity),

              dreamCollection: {
                label: "Dreams",
                timePeriod: {
                  granularity: granularity,
                  index: dreamTimeIndex,
                  identifier: `${granularity} ${dreamTimeIndex}`,
                  // start: new Date(), // TODO
                  // end: new Date(), // TODO
                },
              },
              newsCollection: {
                label: "News",
                timePeriod: {
                  granularity: granularity,
                  index: newsTimeIndex,
                  identifier: `${granularity} ${newsTimeIndex}`,
                  // start: new Date(), // TODO
                  // end: new Date(), // TODO
                },
              },
              score: comparison.score,
              wordCount: comparison.wordCount,
              examples: [...comparison.examples],
              concepts: [...comparison.concepts],
              numDayComparisons: 1,
            };

            return {
              ...acc,
              [key]: comp,
            };
          } else {
            // We already have a week comparison here, we need to consolidate it
            const compToMerge = acc[key];

            const mergedComp: ComparisonSet = {
              ...compToMerge,
              // We'll calculate the average later
              score: compToMerge.score + comparison.score,
              wordCount: compToMerge.wordCount + comparison.wordCount,
              concepts: [...compToMerge.concepts, ...comparison.concepts],
              examples: [...compToMerge.examples, ...comparison.examples],
              numDayComparisons: compToMerge.numDayComparisons + 1,
            };

            return {
              ...acc,
              [key]: mergedComp,
            };
          }
        }, {} as { [key: string]: ComparisonSet });

      // Now we just squash down those pesky long lists
      const longComparisons: ComparisonSet[] = Object.values(consolidatedDictionary)
        // And also turn the score into an average
        .map(comparison => {
          const avgScore = comparison.score / comparison.numDayComparisons;
          return {
            ...comparison,
            score: avgScore,
          };
        });

      // Now, we filter out anything that's too far apart
      const filteredComparisons = longComparisons.filter(comp => {
        const absDistance = Math.abs(
          comp.dreamCollection.timePeriod.index - comp.newsCollection.timePeriod.index
        );
        return !(absDistance > MAX_DISTANCE_BETWEEN_TIME_PERIODS[granularity]);
      });

      const shortenedComparisons = filteredComparisons.map(comp => {
        // Ugly!
        if (comp.score > maxTimePeriodSimilarity) maxTimePeriodSimilarity = comp.score;
        if (comp.score < minTimePeriodSimilarity) minTimePeriodSimilarity = comp.score;
        if (comp.wordCount > maxWordCount) maxWordCount = comp.wordCount;
        if (comp.wordCount < minWordCount) minWordCount = comp.wordCount;

        return {
          ...comp,
          // We're not using this any more
          // concepts: consolidateWikipediaConceptList(comp.concepts, 5),
          concepts: [],
          // We're not using this any more
          // examples: consolidateExampleList(comp.examples, numExamplesPerComparison),
          examples: [],
          similarityExamples: consolidateExamplesToExamplesWithSimilarityLevel(
            comp.examples
          ),
        };
      });

      return {
        label: dict.label,
        color: dict.color,
        comparisons: shortenedComparisons,
      };
    });

  const ret: GranularityComparisonCollection = {
    granularity: granularity,
    maxSimilarity: maxTimePeriodSimilarity,
    minSimilarity: minTimePeriodSimilarity,
    maxWordCount: maxWordCount,
    minWordCount: minWordCount,
    comparisonSets: timePeriodComparisonDictionaries,
  };

  return ret;
};

// This is basically the same as consolidateDreamNewsComparisonExampleList
// So much duplication
// We need a blank example, in case there's none
const blankExample: ExampleRecordComparison = {
  score: 0,
  dreamId: "-1",
  newsId: "-1",
  concepts: [],
};

function consolidateExamplesToExamplesWithSimilarityLevel(
  bigList: ExampleRecordComparison[]
): ExamplesWithSimilarityLevel {
  // We can't show things when there's no concepts in common
  const listWithRealThings = bigList.filter(example => example.concepts.length > 0);
  // Order list items by score
  // So we get the most relevant items first

  const sortedList = listWithRealThings.sort((a, b) => b.score - a.score);

  // High is the top, low is the bottom, med is the one in the middle
  const highEx = sortedList[0] || blankExample;
  const lowEx = sortedList[sortedList.length - 1] || blankExample;
  const mediumEx = sortedList[Math.floor(sortedList.length / 2)] || blankExample;

  const high: ExampleRecordComparison = {
    ...highEx,
    dreamId: highEx.dreamId,
    newsId: highEx.newsId,
    concepts: highEx.concepts,
  };
  const low: ExampleRecordComparison = {
    ...lowEx,
    dreamId: lowEx.dreamId,
    newsId: lowEx.newsId,
    concepts: lowEx.concepts,
  };
  const medium: ExampleRecordComparison = {
    ...mediumEx,
    dreamId: mediumEx.dreamId,
    newsId: mediumEx.newsId,
    concepts: mediumEx.concepts,
  };

  return {
    high,
    medium,
    low,
  };
}
