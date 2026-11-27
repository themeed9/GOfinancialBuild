import { Text, type TextProps } from 'react-native';

import { useTheme, type TextVariant, type ThemeColors } from '@/theme';

interface Props extends TextProps {
  variant?: TextVariant;
  color?: keyof ThemeColors;
}

/**
 * Text that uses the design tokens and scales with the system font size
 * up to 200% (WCAG 1.4.4), as the brief requires.
 */
export function AppText({ variant = 'bodyMedium', color = 'onSurface', style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={2}
      {...rest}
      style={[theme.text[variant], { color: theme.colors[color] }, style]}
    />
  );
}
