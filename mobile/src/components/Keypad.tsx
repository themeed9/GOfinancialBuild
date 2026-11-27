import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import type { KeypadKey } from '@/core/keypad';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { BackspaceIcon } from './icons';

const ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

interface Props {
  onKey(key: KeypadKey): void;
  /** Hide the decimal key for currencies without minor units */
  allowDecimal: boolean;
}

/** In-app number pad: same layout on every phone, no keyboard jump. */
export function Keypad({ onKey, allowDecimal }: Props) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {ROWS.map((row) => (
        <View key={row.join()} style={[styles.row, { gap: theme.spacing.xs }]}>
          {row.map((key) => {
            const hidden = key === '.' && !allowDecimal;
            const label = key === 'backspace' ? 'Delete' : key === '.' ? 'Decimal point' : key;
            return (
              <Pressable
                key={key}
                disabled={hidden}
                accessibilityElementsHidden={hidden}
                importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
                accessibilityRole="keyboardkey"
                accessibilityLabel={label}
                onPress={() => {
                  Haptics.selectionAsync();
                  onKey(key);
                }}
                style={({ pressed }) => [
                  styles.key,
                  {
                    borderRadius: theme.radius.xl,
                    backgroundColor: pressed ? theme.colors.surfaceContainerHigh : 'transparent',
                    opacity: hidden ? 0 : 1,
                  },
                ]}>
                {key === 'backspace' ? (
                  <BackspaceIcon color={theme.colors.onSurface} />
                ) : (
                  <AppText variant="headlineMedium" style={{ fontFamily: theme.font('500') }}>
                    {key}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  key: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
});
