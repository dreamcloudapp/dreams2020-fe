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
