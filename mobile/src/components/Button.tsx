import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface Props {
  label: string;
  onPress(): void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** Pill button from the V2 design. */
export function Button({ label, onPress, variant = 'primary', disabled, loading, style, accessibilityHint }: Props) {
  const theme = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.full,
          backgroundColor: primary ? theme.colors.primary : theme.colors.surfaceContainer,
          boxShadow: primary ? theme.elevation.md : undefined,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? theme.colors.onPrimary : theme.colors.primary} />
      ) : (
        <AppText variant="titleMedium" color={primary ? 'onPrimary' : 'onSurfaceVariant'} style={{ fontFamily: theme.font('600') }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
});
