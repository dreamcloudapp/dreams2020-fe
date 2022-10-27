import { SimilarityLevel } from "@kannydennedy/dreams-2020-types";

// This is duplicated in the backend

export enum ColorTheme {
  BLUE = "hsl(220, 90%, 70%)",
  DULLER_BLUE = "hsl(220, 50%, 55%)",
  EVEN_DULLER_BLUE = "hsl(220, 50%, 40%)",
  DULLEST_BLUE = "hsl(220, 20%, 25%)",
  GRAY = "hsl(0, 0%, 50%)",
  RED = "hsl(24, 84%, 56%)",
  DULLER_RED = "hsl(24, 84%, 46%)",
  EVEN_DULLER_RED = "hsl(24, 84%, 36%)",
  DULLEST_RED = "hsl(24, 84%, 25%)",
}

export const SIMILARITY_COLORS: { [key in SimilarityLevel]: string } = {
  low: ColorTheme.EVEN_DULLER_BLUE,
  medium: ColorTheme.DULLER_BLUE,
  high: ColorTheme.BLUE,
  indiscernible: ColorTheme.DULLEST_BLUE,
};

export const RED_SIMILARITY_COLORS: { [key in SimilarityLevel]: string } = {
  low: ColorTheme.EVEN_DULLER_RED,
  medium: ColorTheme.DULLER_RED,
  high: ColorTheme.RED,
  indiscernible: ColorTheme.DULLEST_RED,
};
