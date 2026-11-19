import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AMOUNT_ERRORS, AmountEntry } from '@/components/AmountEntry';
import { AppText } from '@/components/AppText';
import { CategoryGrid } from '@/components/CategoryGrid';
import { Keypad } from '@/components/Keypad';
import { ModalHeader } from '@/components/ModalHeader';
import { getCurrency } from '@/core/currencies';
import { applyKey, minorToInputText } from '@/core/keypad';
import { parseAmountInput } from '@/core/money';
import type { Transaction } from '@/core/types';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

const MAX_NOTE_LENGTH = 120;

export default function EditTransactionScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, settings } = useAppData();
  const transaction = transactions.find((t) => t.id === id);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ModalHeader title="Edit expense" />
      {transaction ? (
        <EditForm transaction={transaction} locale={settings.locale} />
      ) : (
        <AppText variant="bodyLarge" style={{ padding: theme.spacing.md }}>
          This expense no longer exists.
        </AppText>
      )}
    </SafeAreaView>
  );
}

function EditForm({ transaction, locale }: { transaction: Transaction; locale: string }) {
  const theme = useTheme();
  const { updateTransaction, deleteTransaction } = useAppData();
  const { currency } = transaction;
  const [text, setText] = useState(() => minorToInputText(transaction.amountMinor, currency));
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [note, setNote] = useState(transaction.note);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const parsed = parseAmountInput(text, currency);
    if (!parsed.ok) return setError(AMOUNT_ERRORS[parsed.error]);
    try {
      await updateTransaction({ ...transaction, amountMinor: parsed.minor, categoryId, note: note.trim() });
      router.back();
    } catch {
      setError('Could not save. Please try again.');
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete this expense?', 'It will be removed from your totals.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id);
            router.back();
          } catch {
            setError('Could not delete. Please try again.');
          }
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
      <AmountEntry text={text} currency={currency} locale={locale} message={error ?? ''} isError={error !== null} />
      <CategoryGrid selectedId={categoryId} onSelect={setCategoryId} actionHint="Selects this category" />

      <TextInput
        value={note}
        onChangeText={setNote}
        maxLength={MAX_NOTE_LENGTH}
        placeholder="Note (optional)"
        placeholderTextColor={theme.colors.outline}
        accessibilityLabel="Note"
        maxFontSizeMultiplier={2}
        style={[
          theme.text.bodyLarge,
          {
            color: theme.colors.onSurface,
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
            paddingHorizontal: theme.spacing.md,
            minHeight: 52,
          },
        ]}
      />

      <Keypad
        allowDecimal={getCurrency(currency).decimals > 0}
        onKey={(key) => {
          setError(null);
          setText((t) => applyKey(t, key, currency));
        }}
      />

      <View style={{ gap: theme.spacing.xs }}>
        <Pressable
          onPress={save}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, opacity: pressed ? 0.85 : 1 },
          ]}>
          <AppText variant="titleMedium" color="onPrimary" style={{ fontFamily: theme.font('600') }}>
            Save changes
          </AppText>
        </Pressable>
        <Pressable onPress={confirmDelete} accessibilityRole="button" style={styles.button}>
          <AppText variant="titleMedium" color="error" style={{ fontFamily: theme.font('600') }}>
            Delete expense
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
});
