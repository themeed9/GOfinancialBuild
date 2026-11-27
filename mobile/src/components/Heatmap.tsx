import { StyleSheet, View } from 'react-native';

import type { Heatmap as HeatmapData, HeatLevel } from '@/core/insights';
import { formatMoney } from '@/core/money';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

const SHADES: Record<HeatLevel, string> = { 0: '#EEF1F8', 1: '#CFE0FF', 2: '#8DB8FF', 3: '#4C8DF8', 4: '#0E5BDB' };
const SHADES_DARK: Record<HeatLevel, string> = { 0: '#232A38', 1: '#1E3A6B', 2: '#2856A3', 3: '#3B78DB', 4: '#62A0FF' };

interface Props {
  data: HeatmapData;
  currency: string;
  locale: string;
}

/** Calendar of days shaded by how much was spent (Insight, V2). */
export function Heatmap({ data, currency, locale }: Props) {
  const theme = useTheme();
  const shades = theme.dark ? SHADES_DARK : SHADES;
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2026, 10, 2 + i)));
  const cells: (HeatmapData['days'][number] | null)[] = [...Array(data.leadingBlanks).fill(null), ...data.days];
  while (cells.length % 7) cells.push(null);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={styles.row}>
        {weekdays.map((w, i) => (
          <AppText key={i} variant="labelSmall" color="outline" style={styles.headCell}>
            {w}
          </AppText>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((d, c) => {
            if (!d) return <View key={c} style={styles.cell} />;
            const dayNum = new Date(d.date).getDate();
            const strong = !d.future && d.level >= 3;
            return (
              <View
                key={c}
                accessible
                accessibilityLabel={`${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(d.date)}: ${d.future ? 'upcoming' : formatMoney(d.spentMinor, currency, locale)}`}
                style={[
                  styles.cell,
                  styles.box,
                  d.future
                    ? { borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.outlineVariant }
                    : { backgroundColor: shades[d.level] },
                  d.isToday && { borderWidth: 2, borderColor: theme.colors.onSurface },
                ]}>
                <AppText
                  variant="labelSmall"
                  maxFontSizeMultiplier={1.3}
                  style={{ color: strong ? '#FFFFFF' : theme.colors.onSurfaceVariant, fontFamily: theme.font(d.isToday ? '700' : '500') }}>
                  {dayNum}
                </AppText>
              </View>
            );
          })}
        </View>
      ))}
      <View style={[styles.scale, { gap: 6 }]} importantForAccessibility="no-hide-descendants">
        <AppText variant="labelSmall" color="outline">
          Less
        </AppText>
        {([0, 1, 2, 3, 4] as HeatLevel[]).map((l) => (
          <View key={l} style={[styles.swatch, { backgroundColor: shades[l] }]} />
        ))}
        <AppText variant="labelSmall" color="outline">
          More
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  headCell: { flex: 1, textAlign: 'center' },
  cell: { flex: 1, aspectRatio: 1 },
  box: { borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  scale: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
});
