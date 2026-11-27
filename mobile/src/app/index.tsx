import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountDisplay } from '@/components/AmountDisplay';
import { AppText } from '@/components/AppText';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { GlowTrendChart } from '@/components/GlowTrendChart';
import { ChevronIcon, PersonIcon, PlusIcon } from '@/components/icons';
import { TransactionRow } from '@/components/TransactionRow';
import { getCurrency } from '@/core/currencies';
import { formatMoney } from '@/core/money';
import { useAppData } from '@/state/AppDataProvider';
import { useDashboard } from '@/state/useDashboard';
import { useTheme } from '@/theme';

function greeting(now: number): string {
  const h = new Date(now).getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Home (V2). Three controls: avatar → Settings & Profile, "See all" →
 * History, and Add expense. Tap the graph for Insight, a pencil to edit.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const { colors, spacing, radius } = theme;
  const { settings, updateSettings } = useAppData();
  const d = useDashboard();
  const [pickCurrency, setPickCurrency] = useState(false);

  if (settings.username === null) return <Redirect href="/setup/username" />;

  const { trend } = d;
  const peak = trend.peakIndex >= 0 ? trend.days[trend.peakIndex] : null;
  const peakLabel = peak
    ? `${new Intl.DateTimeFormat(d.locale, { weekday: 'short' }).format(peak.date)} was your peak`
    : null;
  const currency = getCurrency(d.currency);

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundImage: colors.pageGradient }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140, gap: spacing.lg }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push({ pathname: '/settings', params: { tab: 'profile' } })}
            accessibilityRole="button"
            accessibilityLabel="Profile and settings"
            style={[styles.profile, { gap: spacing.sm }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
              <PersonIcon color={colors.onPrimaryContainer} />
            </View>
            <View>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                {greeting(d.now)}
              </AppText>
              <AppText variant="titleMedium" style={{ fontFamily: theme.font('600') }}>
                {capitalize(settings.username)}
              </AppText>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setPickCurrency(true)}
            accessibilityRole="button"
            accessibilityLabel={`Currency: ${currency.name}. Change`}
            style={[styles.currency, { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.full, boxShadow: theme.elevation.sm }]}>
            <AppText variant="titleSmall" style={{ fontFamily: theme.font('700') }}>
              {currency.symbol}
            </AppText>
            <ChevronIcon color={colors.onSurface} direction="down" size={16} />
          </Pressable>
        </View>

        {/* Today */}
        <View style={styles.center}>
          <AmountDisplay minor={d.todayMinor} currency={d.currency} locale={d.locale} size={44} />
          <AppText variant="bodyLarge" color="primary" style={{ fontFamily: theme.font('500') }}>
            Total money spent today
          </AppText>
        </View>

        {/* Hero graph → Insight */}
        <Pressable
          onPress={() => router.push('/insights')}
          accessibilityRole="button"
          accessibilityHint="Opens Insight"
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius['2xl'], boxShadow: theme.elevation.lg, padding: spacing.md, gap: spacing.sm, opacity: pressed ? 0.92 : 1 },
          ]}>
          <View style={styles.cardTop}>
            <View>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                This week
              </AppText>
              <AppText variant="headlineSmall" style={{ fontFamily: theme.font('700') }}>
                {formatMoney(trend.totalMinor, d.currency, d.locale, { trimZeroFraction: true })}
              </AppText>
            </View>
            {peakLabel && (
              <View style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
                <AppText variant="labelMedium" color="onPrimaryContainer" style={{ fontFamily: theme.font('600') }}>
                  {peakLabel}
                </AppText>
              </View>
            )}
          </View>
          <GlowTrendChart trend={trend} currency={d.currency} locale={d.locale} />
          <AppText variant="labelLarge" color="primary" style={{ textAlign: 'center', fontFamily: theme.font('600') }}>
            Tap for insights ›
          </AppText>
        </Pressable>

        {/* Recent → History */}
        <View style={{ gap: spacing.sm }}>
          <View style={styles.cardTop}>
            <AppText variant="labelLarge" color="outline" style={{ letterSpacing: 1, fontFamily: theme.font('600') }} accessibilityRole="header">
              RECENT
            </AppText>
            <Pressable onPress={() => router.push('/history')} accessibilityRole="button" accessibilityLabel="See all expenses" hitSlop={12}>
              <AppText variant="titleSmall" color="primary" style={{ fontFamily: theme.font('600') }}>
                See all ›
              </AppText>
            </Pressable>
          </View>
          {d.recent.length === 0 ? (
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ paddingVertical: spacing.sm }}>
              Nothing logged yet. Tap Add expense when you spend — it takes a few seconds.
            </AppText>
          ) : (
            d.recent.map((t) => (
              <TransactionRow key={t.id} transaction={t} locale={d.locale} onEdit={(tx) => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })} />
            ))
          )}
        </View>
      </ScrollView>

      {/* The one primary action */}
      <View pointerEvents="box-none" style={[styles.addWrap, { bottom: spacing.xl }]}>
        <Pressable
          onPress={() => router.push('/add')}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
          style={({ pressed }) => [styles.add, { backgroundColor: colors.primary, boxShadow: theme.elevation.lg, opacity: pressed ? 0.9 : 1 }]}>
          <PlusIcon color={colors.onPrimary} size={22} />
          <AppText variant="titleMedium" color="onPrimary" style={{ fontFamily: theme.font('600') }}>
            Add expense
          </AppText>
        </Pressable>
      </View>

      <CurrencyPicker
        visible={pickCurrency}
        value={d.currency}
        onSelect={(code) => updateSettings({ currency: code })}
        onClose={() => setPickCurrency(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  profile: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  currency: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingHorizontal: 16 },
  center: { alignItems: 'center', gap: 4 },
  card: {},
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  addWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  add: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 58, paddingHorizontal: 40, borderRadius: 29 },
});
