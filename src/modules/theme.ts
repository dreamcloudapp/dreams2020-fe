import { SimilarityLevel } from "@kannydennedy/dreams-2020-types";

export enum ColorTheme {
  BLUE = "hsl(220, 90%, 60%)",
  DULLER_BLUE = "hsl(220, 50%, 45%)",
  DULLEST_BLUE = "hsl(220, 20%, 30%)",
  GRAY = "hsl(0, 0%, 50%)",
  RED = "hsl(24, 84%, 56%)",
}

export const SIMILARITY_COLORS: { [key in SimilarityLevel]: string } = {
  low: ColorTheme.DULLEST_BLUE,
  medium: ColorTheme.DULLER_BLUE,
  high: ColorTheme.BLUE,
};
