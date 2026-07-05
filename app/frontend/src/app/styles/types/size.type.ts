export const ICON_SIZE = {
  xs: 12,
  sm: 16,
  tn: 18,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export type TypeIconSize = keyof typeof ICON_SIZE;
