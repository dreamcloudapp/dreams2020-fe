export const linkToTitle = (link: string): string => {
  const parts = link.split("/");
  return parts[parts.length - 1].replace("_", " ");
};

// Truncate to x chars
export const truncateString = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + "...";
};

// Get word count of a string
export const wordCount = (text: string): number => {
  return text.split(" ").length;
};
