import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { smoothPath } from '@/core/geometry';
import type { WeekTrend } from '@/core/insights';
import { formatCompactMoney, formatMoney } from '@/core/money';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface Props {
  trend: WeekTrend;
  currency: string;
  locale: string;
}

const HEIGHT = 150;
const TOP = 34; // room for the tooltip
const BOTTOM = 6;

/** Home hero graph (V2 "glow trend"): this week's spending with today highlighted. */
export function GlowTrendChart({ trend, currency, locale }: Props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const { days, todayIndex } = trend;
  const max = Math.max(1, ...days.map((d) => d.spentMinor));
  const xs = (i: number) => 14 + i * ((width - 28) / 6);
  const ys = (v: number) => TOP + (1 - v / max) * (HEIGHT - TOP - BOTTOM);

  const past = days.filter((d) => !d.future);
  const points = past.map((d, i) => [xs(i), ys(d.spentMinor)] as [number, number]);
  const line = smoothPath(points);
  const last = points[points.length - 1];
  const avg = past.length ? past.reduce((s, d) => s + d.spentMinor, 0) / past.length : 0;
  const futurePts: [number, number][] = last ? [last, ...days.slice(past.length).map((_, k) => [xs(past.length + k), ys(avg * 0.6)] as [number, number])] : [];
  const today = todayIndex >= 0 ? days[todayIndex] : null;
  const dayNames = days.map((d) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d.date));

  const summary = days
    .filter((d) => !d.future)
    .map((d) => `${new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d.date)}: ${formatMoney(d.spentMinor, currency, locale)}`)
    .join(', ');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Spending this week. ${summary}`}>
      <View style={{ height: HEIGHT }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && points.length > 0 && (
          <Svg width={width} height={HEIGHT}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.colors.primary} stopOpacity={0.32} />
                <Stop offset="1" stopColor={theme.colors.primary} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#56A2FF" />
                <Stop offset="1" stopColor={theme.colors.primary} />
              </LinearGradient>
            </Defs>
            {points.length > 1 && <Path d={`${line} L${last[0]} ${HEIGHT} L${points[0][0]} ${HEIGHT} Z`} fill="url(#area)" />}
            {futurePts.length > 1 && (
              <Path d={smoothPath(futurePts)} stroke={theme.colors.outlineVariant} strokeWidth={2} strokeDasharray="4 5" fill="none" />
            )}
            {points.length > 1 && <Path d={line} stroke="url(#stroke)" strokeWidth={3.5} fill="none" strokeLinecap="round" />}
            {today && last && (
              <>
                <Line x1={last[0]} y1={last[1]} x2={last[0]} y2={HEIGHT} stroke={theme.colors.primary} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="3 4" />
                <Circle cx={last[0]} cy={last[1]} r={15} fill={theme.colors.primary} fillOpacity={0.15} />
                <Circle cx={last[0]} cy={last[1]} r={5.5} fill={theme.colors.surfaceContainerLowest} stroke={theme.colors.primary} strokeWidth={3} />
              </>
            )}
          </Svg>
        )}
        {width > 0 && today && last && (
          <View
            style={[
              styles.tooltip,
              { backgroundColor: theme.colors.onSurface, left: Math.min(Math.max(last[0] - 55, 0), width - 110), top: Math.max(last[1] - 42, 0) },
            ]}>
            <AppText variant="labelMedium" color="surfaceContainerLowest" style={{ fontFamily: theme.font('600') }} numberOfLines={1}>
              {formatCompactMoney(today.spentMinor, currency, locale)} today
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.days}>
        {dayNames.map((name, i) => (
          <AppText
            key={i}
            variant="labelMedium"
            color={i === todayIndex ? 'primary' : days[i].future ? 'outlineVariant' : 'onSurfaceVariant'}
            style={[styles.day, i === todayIndex && { fontFamily: theme.font('700') }]}>
            {name}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: { position: 'absolute', width: 110, paddingVertical: 5, borderRadius: 10, alignItems: 'center' },
  days: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  day: { width: 14, textAlign: 'center' },
});
