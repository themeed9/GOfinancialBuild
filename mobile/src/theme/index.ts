import type { TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';

import { fontForWeight } from './fonts';
import { darkColors, elevation, lightColors, radius, spacing, typography } from './tokens.generated';

export type TextVariant = keyof typeof typography;
export type ThemeColors = Record<keyof typeof lightColors, string> & typeof extraLight;

/**
 * Values used by the dashboard mockup that are not in ../tokens yet.
 * Kept here, in one place, so they can be moved into the token files later.
 */
const extraLight = {
  /** Chart line and dots (green in the mockup); ≥3:1 against white */
  chart: 'hsl(130, 60%, 40%)',
  /** Soft page wash behind the main card */
  pageGradient: 'linear-gradient(180deg, hsl(228, 100%, 99%) 0%, hsl(226, 60%, 96%) 100%)',
  /** The large frosted dashboard card */
  cardGradient: 'linear-gradient(160deg, hsl(225, 60%, 97%) 0%, hsl(226, 40%, 93%) 100%)',
  cardHighlight: 'hsla(0, 0%, 100%, 0.9)',
};

const extraDark: typeof extraLight = {
  chart: 'hsl(130, 55%, 55%)',
  pageGradient: 'linear-gradient(180deg, hsl(220, 21%, 10%) 0%, hsl(220, 21%, 8%) 100%)',
  cardGradient: 'linear-gradient(160deg, hsl(223, 17%, 18%) 0%, hsl(220, 21%, 14%) 100%)',
  cardHighlight: 'hsla(0, 0%, 100%, 0.06)',
};

const extraRadius = { xl: 20, '2xl': 28, '3xl': 40 } as const;

/** Token text styles with the matching Inter font file per weight. */
const text = Object.fromEntries(
  Object.entries(typography).map(([name, s]) => [
    name,
    {
      fontFamily: fontForWeight(s.fontWeight),
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
    } satisfies TextStyle,
  ]),
) as Record<TextVariant, TextStyle>;

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  text: Record<TextVariant, TextStyle>;
  font: typeof fontForWeight;
  spacing: typeof spacing;
  radius: typeof radius & typeof extraRadius;
  elevation: typeof elevation;
  /** Minimum touch target from the brief (WCAG 2.1 AA) */
  minTouchTarget: 44;
}

function makeTheme(dark: boolean): Theme {
  return {
    dark,
    colors: { ...(dark ? darkColors : lightColors), ...(dark ? extraDark : extraLight) },
    text,
    font: fontForWeight,
    spacing,
    radius: { ...radius, ...extraRadius },
    elevation,
    minTouchTarget: 44,
  };
}

const LIGHT = makeTheme(false);
const DARK = makeTheme(true);

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}
