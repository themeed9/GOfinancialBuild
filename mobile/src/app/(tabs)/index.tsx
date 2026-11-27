import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountDisplay } from '@/components/AmountDisplay';
import { AppText } from '@/components/AppText';
import { LogoMark } from '@/components/icons';
import { TransactionRow } from '@/components/TransactionRow';
import { WeeklyTrendChart } from '@/components/WeeklyTrendChart';
import { useDashboard } from '@/state/useDashboard';
import { useTheme } from '@/theme';

export default function DashboardScreen() {
  const theme = useTheme();
  const { spacing, radius, colors } = theme;
  const d = useDashboard();

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundImage: colors.pageGradient }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.xl }}>
        <View
          style={{
            backgroundImage: colors.cardGradient,
            borderRadius: radius['3xl'],
            borderWidth: 1,
            borderColor: colors.cardHighlight,
            boxShadow: theme.elevation.lg,
            padding: spacing.md,
            paddingBottom: spacing.lg,
          }}>
          <View
            accessible
            accessibilityLabel="GOfinancial"
            style={[styles.logo, { backgroundColor: colors.surfaceContainerHigh }]}>
            <LogoMark color={colors.primary} size={22} />
          </View>

          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl }}>
            <AmountDisplay minor={d.todayMinor} currency={d.currency} locale={d.locale} size={44} />
            <AppText variant="bodyLarge" color="primary" style={{ marginTop: spacing.xxs }}>
              Total money spent today
            </AppText>
          </View>

          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: radius['2xl'],
              boxShadow: theme.elevation.md,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.sm,
            }}>
            <WeeklyTrendChart
              weeks={d.weeks}
              currentIndex={d.currentWeekIndex}
              currency={d.currency}
              locale={d.locale}
            />
          </View>

          <AppText
            variant="labelLarge"
            color="outline"
            accessibilityRole="header"
            style={{ marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: 'uppercase', fontFamily: theme.font('600') }}>
            Recent transactions
          </AppText>

          {d.recent.length === 0 ? (
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ paddingVertical: spacing.md }}>
              Nothing logged yet. Tap Add when you spend — it takes a few seconds.
            </AppText>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {d.recent.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  locale={d.locale}
                  onEdit={(tx) => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  logo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
