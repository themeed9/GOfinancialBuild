import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { EyeIcon } from './icons';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  /** Adds a show/hide toggle and hides the text by default */
  password?: boolean;
}

/** Labelled input from the V2 account screens. */
export function TextField({ label, error, password, ...input }: Props) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="labelLarge" color="onSurfaceVariant">
        {label}
      </AppText>
      <View
        style={[
          styles.field,
          {
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surfaceContainerLow,
            borderColor: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.surfaceContainerLow,
            paddingHorizontal: theme.spacing.md,
          },
        ]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.outline}
          maxFontSizeMultiplier={2}
          secureTextEntry={password && hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...input}
          style={[theme.text.bodyLarge, styles.input, { color: theme.colors.onSurface }]}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            style={styles.eye}>
            <EyeIcon color={theme.colors.onSurfaceVariant} crossed={!hidden} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="bodySmall" color="error" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1.5 },
  input: { flex: 1, paddingVertical: 12 },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
});
