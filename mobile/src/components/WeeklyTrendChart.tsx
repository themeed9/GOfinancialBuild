import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { formatCompactMoney, formatMoney } from '@/core/money';
import type { WeekTotal } from '@/core/summaries';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface Props {
  weeks: WeekTotal[];
  /** Index into `weeks` of the week containing today; later weeks are not plotted */
  currentIndex: number;
  currency: string;
  locale: string;
}

const PLOT_HEIGHT = 56;
const DOT = 4;

/** Spending per week of this month (W1 … W4/W5/W6), as in the mockup. */
export function WeeklyTrendChart({ weeks, currentIndex, currency, locale }: Props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const plotted = weeks.slice(0, currentIndex + 1);
  const max = Math.max(...plotted.map((w) => w.spentMinor), 1);
  const column = width / Math.max(weeks.length, 1);
  const points = plotted.map((w, i) => ({
    x: column * (i + 0.5),
    // All-zero months draw a flat line through the middle.
    y: plotted.every((p) => p.spentMinor === 0)
      ? PLOT_HEIGHT / 2
      : DOT + (1 - w.spentMinor / max) * (PLOT_HEIGHT - DOT * 2),
  }));

  const summary = weeks
    .map((w, i) =>
      i <= currentIndex ? `Week ${w.index}: ${formatMoney(w.spentMinor, currency, locale)}` : `Week ${w.index}: not yet`,
    )
    .join(', ');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Spending this month by week. ${summary}`}>
      <View style={styles.row}>
        {weeks.map((w, i) => (
          <AppText key={w.index} variant="labelSmall" color="onSurfaceVariant" style={styles.cell} numberOfLines={1}>
            {i <= currentIndex ? formatCompactMoney(w.spentMinor, currency, locale) : '—'}
          </AppText>
        ))}
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: PLOT_HEIGHT }}>
        {width > 0 && (
          <Svg width={width} height={PLOT_HEIGHT}>
            {points.length > 1 && (
              <Polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={theme.colors.chart}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={DOT} fill={theme.colors.chart} />
            ))}
          </Svg>
        )}
      </View>

      <View style={styles.row}>
        {weeks.map((w, i) => (
          <AppText
            key={w.index}
            variant="labelMedium"
            color={i === currentIndex ? 'primary' : 'outline'}
            style={styles.cell}>
            W{w.index}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1, textAlign: 'center' },
});
