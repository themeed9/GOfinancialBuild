import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { CloseIcon } from './icons';

export function ModalHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { paddingHorizontal: theme.spacing.xs }]}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={styles.close}>
        <CloseIcon color={theme.colors.onSurface} />
      </Pressable>
      <AppText variant="titleLarge" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
