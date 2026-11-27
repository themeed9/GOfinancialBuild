import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { BackIcon } from './icons';

/** "‹ Title" header for screens opened from home (V2). */
export function ScreenHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.back}>
        <BackIcon color={theme.colors.onSurface} />
      </Pressable>
      <AppText variant="headlineSmall" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -10 },
});
