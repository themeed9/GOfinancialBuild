import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AMOUNT_ERRORS, AmountEntry } from '@/components/AmountEntry';
import { CategoryGrid } from '@/components/CategoryGrid';
import { Keypad } from '@/components/Keypad';
import { ModalHeader } from '@/components/ModalHeader';
import { getCurrency } from '@/core/currencies';
import { applyKey } from '@/core/keypad';
import { parseAmountInput } from '@/core/money';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

/**
 * Quick Add — the product's core loop:
 * type the amount, tap a category, and it is saved.
 * The note is optional and can be added later from the dashboard.
 */
export default function QuickAddScreen() {
  const theme = useTheme();
  const { settings, addTransaction } = useAppData();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);

  const saveWithCategory = async (categoryId: string) => {
    if (saving.current) return; // prevent double submission
    const parsed = parseAmountInput(text, settings.currency);
    if (!parsed.ok) {
      setError(AMOUNT_ERRORS[parsed.error]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    saving.current = true;
    try {
      await addTransaction({ amountMinor: parsed.minor, categoryId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      saving.current = false;
      setError('Could not save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ModalHeader title="Add expense" />
      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.md, gap: theme.spacing.md }]}>
        <AmountEntry
          text={text}
          currency={settings.currency}
          locale={settings.locale}
          message={error ?? 'Tap a category to save'}
          isError={error !== null}
        />
        <CategoryGrid onSelect={saveWithCategory} actionHint="Saves the expense in this category" />
        <View style={styles.spacer} />
        <Keypad
          allowDecimal={getCurrency(settings.currency).decimals > 0}
          onKey={(key) => {
            setError(null);
            setText((t) => applyKey(t, key, settings.currency));
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  spacer: { flex: 1 },
});
