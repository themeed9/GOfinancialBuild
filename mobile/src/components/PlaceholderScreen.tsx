import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

interface Props {
  title: string;
  description: string;
}

/** Temporary screen body until each feature screen is built. */
export function PlaceholderScreen({ title, description }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { padding: spacing.xl }]}>
      <Text accessibilityRole="header" style={[typography.headlineMedium, { color: colors.onBackground }]}>
        {title}
      </Text>
      <Text style={[typography.bodyLarge, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
        {description}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
});
