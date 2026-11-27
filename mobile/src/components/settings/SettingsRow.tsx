import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from '../AppText';
import { PathIcon } from '../icons';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  /** Right-hand link text, e.g. "Export" */
  action?: string;
  onPress?(): void;
  /** Custom control on the right (toggle, select) */
  right?: ReactNode;
}

/** Rounded row from the V2 Settings sheet. */
export function SettingsRow({ icon, title, subtitle, action, onPress, right }: Props) {
  const theme = useTheme();
  const body = (
    <>
      <PathIcon d={icon} color={theme.colors.onSurface} size={20} />
      <View style={styles.text}>
        <AppText variant="titleSmall" style={{ fontFamily: theme.font('500') }}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {action ? (
        <AppText variant="titleSmall" color="primary" style={{ fontFamily: theme.font('500') }}>
          {action}
        </AppText>
      ) : null}
    </>
  );
  const style = [styles.row, { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 16, gap: theme.spacing.md }];
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={action ? `${title}: ${action}` : title} style={({ pressed }) => [...style, { opacity: pressed ? 0.7 : 1 }]}>
      {body}
    </Pressable>
  ) : (
    <View style={style} accessible={!right} accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 68, paddingHorizontal: 20, paddingVertical: 14 },
  text: { flex: 1, gap: 2 },
});
