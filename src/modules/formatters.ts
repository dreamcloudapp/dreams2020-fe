export const prettyNumber = (n: number, decimals: number): string => {
  if (n === 0) {
    return "0";
  }
  return n.toFixed(decimals);
};
