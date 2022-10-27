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
