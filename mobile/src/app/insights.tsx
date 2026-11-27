import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Donut } from '@/components/Donut';
import { Heatmap } from '@/components/Heatmap';
import { ChevronIcon, FlameIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { buildLedger } from '@/core/budget/ledger';
import { addDays, nextPeriodStart, periodRange, type PeriodKind } from '@/core/dates';
import { biggestWeekday, categoryBreakdown, heatmap, loggingStreak } from '@/core/insights';
import { formatMoney } from '@/core/money';
import { useAppData } from '@/state/AppDataProvider';
import { useNow } from '@/state/useNow';
import { useTheme } from '@/theme';

type Mode = 'month' | 'week';
const PERIOD_NAMES: Record<PeriodKind, string> = { day: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly' };

/** Insight (V2, "month heatmap + habit streak"), opened from the home graph. */
export default function InsightScreen() {
  const theme = useTheme();
  const { colors, spacing } = theme;
  const { transactions, plans, settings } = useAppData();
  const now = useNow();
  const { currency, locale, weekStart } = settings;
  const money = (m: number) => formatMoney(m, currency, locale, { trimZeroFraction: true });

  const [view, setView] = useState<Mode>('month');
  const [offset, setOffset] = useState(0); // 0 = current period, -1 = previous …

  const data = useMemo(() => {
    let range = periodRange(now, view, weekStart);
    for (let i = 0; i > offset; i--) range = periodRange(addDays(range.start, -1), view, weekStart);
    const asOf = offset === 0 ? now : range.end - 1;
    return {
      range,
      map: heatmap(transactions, range, currency, asOf, weekStart),
      categories: categoryBreakdown(transactions, range, currency),
      biggest: view === 'month' ? biggestWeekday(transactions, range, currency, asOf) : null,
    };
  }, [transactions, now, view, offset, currency, weekStart]);

  const streak = useMemo(() => loggingStreak(transactions, now), [transactions, now]);
  const ledger = useMemo(() => buildLedger({ plans, transactions, now, weekStart }), [plans, transactions, now, weekStart]);
  const current = ledger.current;

  const title =
    view === 'month'
      ? new Intl.DateTimeFormat(locale, { month: 'long', year: offset === 0 ? undefined : 'numeric' }).format(data.range.start)
      : `${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(data.range.start)} – ${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(addDays(data.range.end, -1))}`;
  const weekdayName = data.biggest ? new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(2026, 10, 1 + data.biggest.weekday)) : '';
  const top = data.categories[0];
  const card = { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, boxShadow: theme.elevation.md, padding: 18, gap: spacing.sm } as const;
  const nextExists = nextPeriodStart(data.range.start, view) <= now;

  return (
    <SafeAreaView style={[styles.root, { backgroundImage: colors.pageGradient }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing['2xl'] }}>
        <ScreenHeader title="Insight" />
        <SegmentedControl
          label="Time period"
          value={view}
          onChange={(v) => {
            setView(v);
            setOffset(0);
          }}
          options={[
            { value: 'month', label: 'Month' },
            { value: 'week', label: 'Week' },
          ]}
        />

        {/* Heatmap */}
        <View style={card}>
          <View style={styles.between}>
            <View style={styles.nav}>
              <Pressable onPress={() => setOffset(offset - 1)} accessibilityRole="button" accessibilityLabel={`Previous ${view}`} style={styles.navBtn}>
                <ChevronIcon color={colors.primary} direction="left" size={16} />
              </Pressable>
              <AppText variant="titleSmall" style={{ fontFamily: theme.font('500') }}>
                {title}
              </AppText>
              <Pressable
                onPress={() => setOffset(offset + 1)}
                disabled={!nextExists || offset === 0}
                accessibilityRole="button"
                accessibilityLabel={`Next ${view}`}
                style={styles.navBtn}>
                <ChevronIcon color={offset === 0 ? colors.outlineVariant : colors.primary} size={16} />
              </Pressable>
            </View>
          </View>
          <View style={styles.between}>
            <AppText variant="headlineMedium" style={{ fontFamily: theme.font('700') }}>
              {money(data.map.totalMinor)}
            </AppText>
            {streak >= 2 && (
              <View style={[styles.streak, { backgroundColor: '#FFEDD5' }]}>
                <FlameIcon color="#EA580C" size={14} />
                <AppText variant="labelMedium" style={{ color: '#C2410C', fontFamily: theme.font('600') }}>
                  {streak}-day streak
                </AppText>
              </View>
            )}
          </View>
          <Heatmap data={data.map} currency={currency} locale={locale} />
        </View>

        {/* One-line insight */}
        {data.biggest && (
          <View style={[styles.insight, { backgroundColor: colors.primaryContainer }]}>
            <AppText variant="titleSmall" color="onPrimaryContainer" style={{ fontFamily: theme.font('600') }}>
              {weekdayName}s are your biggest days — {formatMoney(data.biggest.averageMinor, currency, locale, { wholeUnits: true })} on average.
            </AppText>
          </View>
        )}

        {/* Budget */}
        <View style={card}>
          {current ? (
            <>
              <View style={styles.between}>
                <AppText variant="titleMedium" style={{ fontFamily: theme.font('600') }}>
                  {PERIOD_NAMES[current.plan.period]} budget
                </AppText>
                <AppText variant="titleMedium" color={current.closingMinor < 0 ? 'error' : 'primary'} style={{ fontFamily: theme.font('700') }}>
                  {current.closingMinor < 0 ? `${money(-current.closingMinor)} over` : `${money(current.closingMinor)} left`}
                </AppText>
              </View>
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: Math.max(current.availableMinor, 1), now: Math.min(current.spentMinor, current.availableMinor) }}
                style={[styles.track, { backgroundColor: colors.surfaceContainerHigh }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(100, current.availableMinor > 0 ? (current.spentMinor / current.availableMinor) * 100 : 100)}%`,
                      backgroundColor: current.closingMinor < 0 ? colors.error : colors.primary,
                    },
                  ]}
                />
              </View>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                {money(current.spentMinor)} of {money(current.availableMinor)}
                {current.carriedInMinor !== 0 &&
                  ` · includes ${current.carriedInMinor > 0 ? money(current.carriedInMinor) : `-${money(-current.carriedInMinor)}`} carried over`}
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="titleMedium" style={{ fontFamily: theme.font('600') }}>
                Budget
              </AppText>
              <AppText variant="bodyMedium" color="onSurfaceVariant">
                Set a budget — whatever you don’t spend carries into the next period.
              </AppText>
            </>
          )}
          <Button label="Set Budget" onPress={() => router.push({ pathname: '/setup/budget', params: { mode: 'edit' } })} style={styles.budgetBtn} />
        </View>

        {/* Where it went */}
        <View style={card}>
          <AppText variant="titleMedium" style={{ fontFamily: theme.font('600') }} accessibilityRole="header">
            Where it went
          </AppText>
          {data.categories.length === 0 ? (
            <AppText variant="bodyMedium" color="onSurfaceVariant">
              No spending in this {view} yet.
            </AppText>
          ) : (
            <>
              <View style={[styles.donutRow, { gap: spacing.md }]}>
                <Donut
                  segments={data.categories.map((c) => ({ value: c.spentMinor, color: c.category.color }))}
                  centerValue={String(data.categories.length)}
                  centerLabel={data.categories.length === 1 ? 'category' : 'categories'}
                />
                <View style={styles.flex}>
                  <AppText variant="bodySmall" color="onSurfaceVariant">
                    Top category
                  </AppText>
                  <AppText variant="titleLarge" style={{ fontFamily: theme.font('700') }}>
                    {top.category.name}
                  </AppText>
                  <AppText variant="bodyMedium" color="onSurfaceVariant">
                    {top.percent}% of your spending — {money(top.spentMinor)} this {view}
                  </AppText>
                </View>
              </View>
              {data.categories.map((c) => (
                <View key={c.category.id} style={[styles.catRow, { gap: spacing.sm }]}>
                  <CategoryIcon category={c.category} size={36} shape="square" />
                  <View style={[styles.flex, { gap: 6 }]}>
                    <View style={styles.between}>
                      <AppText variant="bodyMedium">{c.category.name}</AppText>
                      <AppText variant="bodyMedium" style={{ fontFamily: theme.font('600') }}>
                        {money(c.spentMinor)}
                      </AppText>
                    </View>
                    <View style={[styles.track, { height: 6, backgroundColor: colors.surfaceContainerHigh }]}>
                      <View style={[styles.fill, { width: `${(c.spentMinor / top.spentMinor) * 100}%`, backgroundColor: c.category.color }]} />
                    </View>
                  </View>
                  <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.pct}>
                    {c.percent}%
                  </AppText>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { flexDirection: 'row', alignItems: 'center', marginLeft: -12 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  insight: { padding: 16, borderRadius: 20 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  budgetBtn: { alignSelf: 'center', minWidth: 160, marginTop: 4 },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  pct: { width: 36, textAlign: 'right' },
});
