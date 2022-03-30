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
