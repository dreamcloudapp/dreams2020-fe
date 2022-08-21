// Clamp number between two values with the following line:
const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const changeHslLightness = (hslColor: string, change: number): string => {
  const parts = hslColor.split(" ");
  const lightness = parts[2];
  const lightnessNumber = parseInt(lightness.replace("%)", ""));
  const newNumber = lightnessNumber + change;
  const sanitisedNumber = clamp(newNumber, 0, 100);
  return `${parts[0]} ${[parts[1]]} ${sanitisedNumber}%)`;
};

// Extract hsl values from hsl string:
const hslValues = (hslColor: string): number[] => {
  const parts = hslColor.split(" ");
  const h = parseInt(parts[0].replace("hsl(", ""));
  const s = parseInt(parts[1].replace("%, ", ""));
  const l = parseInt(parts[2].replace("%)", ""));
  return [h, s, l];
};

export const changeHslOpacity = (hslColor: string, opacity: number): string => {
  const vals = hslValues(hslColor);
  return `hsla(${vals[0]}, ${vals[1]}%, ${vals[2]}%, ${opacity})`;
};
