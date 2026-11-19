import { useColorScheme } from 'react-native';

import { darkColors, fontFamily, lightColors, radius, spacing, typography } from './tokens.generated';

export type ThemeColors = Record<keyof typeof lightColors, string>;

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  fontFamily: string;
  /** Minimum touch target from the brief (WCAG 2.1 AA) */
  minTouchTarget: 44;
}

export function makeTheme(dark: boolean): Theme {
  return {
    dark,
    colors: dark ? darkColors : lightColors,
    typography,
    spacing,
    radius,
    fontFamily,
    minTouchTarget: 44,
  };
}

const LIGHT = makeTheme(false);
const DARK = makeTheme(true);

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}
