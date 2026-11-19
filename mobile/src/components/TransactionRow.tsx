import { Pressable, StyleSheet, View } from 'react-native';

import { getCategory } from '@/core/categories';
import { formatMoney } from '@/core/money';
import type { Transaction } from '@/core/types';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { PencilIcon } from './icons';

interface Props {
  transaction: Transaction;
  locale: string;
  onEdit(transaction: Transaction): void;
}

export function TransactionRow({ transaction, locale, onEdit }: Props) {
  const theme = useTheme();
  const category = getCategory(transaction.categoryId);
  const amount = formatMoney(transaction.amountMinor, transaction.currency, locale, { trimZeroFraction: true });

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderRadius: theme.radius.xl,
          boxShadow: theme.elevation.md,
          paddingLeft: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}>
      <View
        importantForAccessibility="no-hide-descendants"
        style={[styles.icon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
        <AppText variant="bodySmall">{category.icon}</AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="bodyLarge" color="onSurfaceVariant" numberOfLines={1}>
          {category.name}
        </AppText>
        {transaction.note !== '' && (
          <AppText variant="bodySmall" color="outline" numberOfLines={1}>
            {transaction.note}
          </AppText>
        )}
      </View>
      <AppText variant="titleMedium" color="onSurfaceVariant" style={{ fontFamily: theme.font('700') }}>
        {amount}
      </AppText>
      <Pressable
        onPress={() => onEdit(transaction)}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${category.name}, ${amount}`}
        hitSlop={4}
        style={({ pressed }) => [styles.edit, { opacity: pressed ? 0.5 : 1 }]}>
        <PencilIcon color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  edit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
