import { StyleSheet, Text, View } from 'react-native';

import { formatMoney, moneyParts } from '@/core/money';
import { useTheme, type ThemeColors } from '@/theme';

interface Props {
  minor: number;
  currency: string;
  locale: string;
  /** Size of the whole-number part; the decimals are drawn at half size */
  size?: number;
  color?: keyof ThemeColors;
}

/** Large amount with smaller decimals, e.g. ₦6,000.05 on the dashboard. */
export function AmountDisplay({ minor, currency, locale, size = 44, color = 'primary' }: Props) {
  const theme = useTheme();
  const p = moneyParts(minor, currency, locale);
  const tint = theme.colors[color];

  return (
    <View
      accessible
      accessibilityLabel={formatMoney(minor, currency, locale)}
      style={styles.row}>
      <Text
        maxFontSizeMultiplier={1.6}
        style={{ fontFamily: theme.font('700'), fontSize: size, lineHeight: size * 1.2, color: tint, letterSpacing: -0.5 }}>
        {p.sign}
        {p.symbol}
        {p.whole}
      </Text>
      {p.fraction !== '' && (
        <Text
          maxFontSizeMultiplier={1.6}
          style={{ fontFamily: theme.font('600'), fontSize: size / 2, lineHeight: size * 0.75, color: tint }}>
          {p.separator}
          {p.fraction}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', justifyContent: 'center' },
});
