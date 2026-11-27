import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { ChevronIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TransactionRow } from '@/components/TransactionRow';
import { addDays, startOfDay } from '@/core/dates';
import { formatMoney } from '@/core/money';
import { spentInRange } from '@/core/summaries';
import { useAppData } from '@/state/AppDataProvider';
import { useNow } from '@/state/useNow';
import { useTheme } from '@/theme';

/** Expense History (V2): one day at a time, opened from "See all". */
export default function HistoryScreen() {
  const theme = useTheme();
  const { transactions, settings } = useAppData();
  const now = useNow();
  const today = startOfDay(now);
  const [day, setDay] = useState(today);
  const range = { start: day, end: addDays(day, 1) };

  const entries = useMemo(
    () => transactions.filter((t) => t.occurredAt >= day && t.occurredAt < addDays(day, 1)).sort((a, b) => b.occurredAt - a.occurredAt),
    [transactions, day],
  );
  const total = spentInRange(transactions, range, settings.currency);
  const label = new Intl.DateTimeFormat(settings.locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(day);
  const isToday = day === today;

  return (
    <SafeAreaView style={[styles.root, { backgroundImage: theme.colors.pageGradient }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <ScreenHeader title="Expense History" />
        <View style={styles.switcher}>
          <Pressable onPress={() => setDay(addDays(day, -1))} accessibilityRole="button" accessibilityLabel="Previous day" style={styles.arrow}>
            <ChevronIcon color={theme.colors.primary} direction="left" />
          </Pressable>
          <View style={styles.dateBox} accessibilityLiveRegion="polite">
            <AppText variant="titleSmall" style={{ fontFamily: theme.font('600') }}>
              {isToday ? `Today · ${label}` : label}
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {formatMoney(total, settings.currency, settings.locale, { trimZeroFraction: true })} spent
            </AppText>
          </View>
          <Pressable
            onPress={() => setDay(addDays(day, 1))}
            disabled={isToday}
            accessibilityRole="button"
            accessibilityLabel="Next day"
            accessibilityState={{ disabled: isToday }}
            style={styles.arrow}>
            <ChevronIcon color={isToday ? theme.colors.outlineVariant : theme.colors.primary} />
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ textAlign: 'center', paddingVertical: theme.spacing['2xl'] }}>
            No entries on this day.
          </AppText>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            {entries.map((t) => (
              <TransactionRow key={t.id} transaction={t} locale={settings.locale} onEdit={(tx) => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  switcher: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  dateBox: { alignItems: 'center', flex: 1 },
});
