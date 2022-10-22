export const prettyNumber = (n: number, decimals: number): string => {
  if (n === 0) {
    return "0";
  } else if (n > 1000) {
    return n.toLocaleString();
  } else {
    return n.toFixed(decimals);
  }
};
