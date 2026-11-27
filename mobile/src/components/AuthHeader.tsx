import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { BackIcon, LogoMark } from './icons';

/** Back button + logo + product name, shared by the account screens. */
export function AuthHeader({ tagline }: { tagline: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <BackIcon color={theme.colors.onSurface} />
      </Pressable>
      <View style={[styles.center, { gap: theme.spacing.xxs }]}>
        <LogoMark color={theme.colors.primary} size={64} />
        <AppText variant="headlineMedium" style={{ fontFamily: theme.font('700'), marginTop: theme.spacing.xs }}>
          GOfinancial
        </AppText>
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          {tagline}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -8 },
  center: { alignItems: 'center' },
});
