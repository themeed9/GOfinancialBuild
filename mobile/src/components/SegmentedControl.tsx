import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange(value: T): void;
  label: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[styles.row, { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 14, boxShadow: theme.elevation.sm }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.item, { borderRadius: 11, backgroundColor: selected ? theme.colors.primary : 'transparent' }]}>
            <AppText variant="titleSmall" color={selected ? 'onPrimary' : 'onSurfaceVariant'} style={{ fontFamily: theme.font('600') }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 4 },
  item: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
});
