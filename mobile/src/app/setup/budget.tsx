import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AMOUNT_ERRORS } from '@/components/AmountEntry';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { getCurrency } from '@/core/currencies';
import type { PeriodKind } from '@/core/dates';
import { parseAmountInput } from '@/core/money';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

const PERIODS: { kind: PeriodKind; label: string }[] = [
  { kind: 'day', label: 'Daily' },
  { kind: 'week', label: 'Weekly' },
  { kind: 'month', label: 'Monthly' },
  { kind: 'year', label: 'Yearly' },
];

/** First-run step 2 (V2): optional budget. Skip goes straight to the dashboard. */
export default function BudgetSetupScreen() {
  const theme = useTheme();
  const { settings, setBudget } = useAppData();
  const currency = getCurrency(settings.currency);
  const [text, setText] = useState('');
  const [period, setPeriod] = useState<PeriodKind>('month');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const done = () => router.replace('/');

  const save = async () => {
    const parsed = parseAmountInput(text.replace(',', '.'), currency.code);
    if (!parsed.ok) return setError(AMOUNT_ERRORS[parsed.error]);
    setSaving(true);
    try {
      await setBudget(parsed.minor, period);
      done();
    } catch {
      setSaving(false);
      setError('Could not save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.xl }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.center, { gap: theme.spacing.xs, marginTop: theme.spacing.xl }]}>
            <AppText variant="headlineSmall" accessibilityRole="header" style={styles.centerText}>
              Set Your Budget
            </AppText>
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.centerText}>
              Track your spending against a budget. Leftover money carries into the next period.
            </AppText>
          </View>

          <View style={[styles.center, styles.grow, { gap: theme.spacing.lg }]}>
            <AppText variant="labelLarge" color="onSurfaceVariant" style={{ letterSpacing: 1 }}>
              BUDGET AMOUNT
            </AppText>
            <View style={{ width: 280, gap: theme.spacing.xs }}>
              <View style={[styles.inputRow, { borderBottomColor: error ? theme.colors.error : theme.colors.primary }]}>
                <AppText style={{ fontFamily: theme.font('700'), fontSize: 26, color: theme.colors.primary }}>{currency.symbol}</AppText>
                <TextInput
                  value={text}
                  onChangeText={(t) => {
                    setError(null);
                    setText(t.replace(/[^\d.,]/g, ''));
                  }}
                  placeholder={currency.decimals > 0 ? `0.${'0'.repeat(currency.decimals)}` : '0'}
                  placeholderTextColor={theme.colors.outlineVariant}
                  keyboardType="decimal-pad"
                  accessibilityLabel={`Budget amount in ${currency.name}`}
                  maxFontSizeMultiplier={1.6}
                  style={[styles.input, { fontFamily: theme.font('600'), color: theme.colors.onSurface }]}
                />
              </View>
              {error && (
                <AppText variant="bodySmall" color="error" accessibilityRole="alert">
                  {error}
                </AppText>
              )}
            </View>

            <AppText variant="bodyLarge">This is my budget for:</AppText>
            <View style={[styles.grid, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
              {PERIODS.map((p) => {
                const selected = p.kind === period;
                return (
                  <Pressable
                    key={p.kind}
                    onPress={() => setPeriod(p.kind)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.option,
                      {
                        borderRadius: theme.radius.lg,
                        backgroundColor: selected ? theme.colors.primary : theme.colors.background,
                        borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                      },
                    ]}>
                    <AppText variant="titleSmall" color={selected ? 'onPrimary' : 'onSurface'} style={{ fontFamily: theme.font('600') }}>
                      {p.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.actions, { gap: theme.spacing.sm }]}>
            <Button label="Skip" variant="secondary" onPress={done} accessibilityHint="Set a budget later from Insights" />
            <Button label="Continue" onPress={save} loading={saving} disabled={text === ''} style={{ minWidth: 160 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  grow: { flex: 1, justifyContent: 'center', paddingVertical: 32 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 2, paddingBottom: 6 },
  input: { flex: 1, fontSize: 30, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 288, justifyContent: 'center' },
  option: { width: 138, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center' },
});
