import { SimilarityLevel } from "@kannydennedy/dreams-2020-types";

export const prettyNumber = (n: number, decimals: number): string => {
  if (n === 0) {
    return "0";
  } else if (n > 1000) {
    return n.toLocaleString();
  } else {
    return n.toFixed(decimals);
  }
};

// String to title case
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Format similarity level
export const formatSimilarityLabel = (similarity: SimilarityLevel): string => {
  switch (similarity) {
    case "medium":
      return "Indicative";
    default:
      return toTitleCase(similarity);
  }
};

// Truncate text to x characters
export const truncateText = (text: string, length: number): string => {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  } else {
    return text;
  }
};
