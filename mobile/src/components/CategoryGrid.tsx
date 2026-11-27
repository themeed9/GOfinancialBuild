import { Pressable, StyleSheet, View } from 'react-native';

import { DEFAULT_CATEGORIES } from '@/core/categories';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  onSelect(categoryId: string): void;
  /** Highlighted category (edit mode) */
  selectedId?: string;
  disabled?: boolean;
  /** Screen reader hint, e.g. "Saves the expense" */
  actionHint: string;
}

export function CategoryGrid({ onSelect, selectedId, disabled, actionHint }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.grid, { gap: theme.spacing.xs }]}>
      {DEFAULT_CATEGORIES.map((c) => {
        const selected = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            disabled={disabled}
            onPress={() => onSelect(c.id)}
            accessibilityRole="button"
            accessibilityLabel={c.name}
            accessibilityHint={actionHint}
            accessibilityState={{ selected, disabled }}
            style={({ pressed }) => [
              styles.cell,
              {
                borderRadius: theme.radius.xl,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                gap: theme.spacing.xs,
                backgroundColor: selected || pressed ? theme.colors.primaryContainer : theme.colors.surfaceContainerLowest,
                borderWidth: selected ? 2 : 0,
                borderColor: theme.colors.primary,
                boxShadow: theme.elevation.sm,
              },
            ]}>
            <CategoryIcon category={c} size={30} />
            <AppText variant="labelLarge" color="onSurfaceVariant" style={styles.label}>
              {c.name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Two columns so long names ("Transportation") never break mid-word,
  // even with large system text.
  cell: { flexBasis: '45%', flexGrow: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center' },
  label: { flexShrink: 1 },
});
