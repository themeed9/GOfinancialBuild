import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { avatarInitial, normalizeUsername, validateUsername } from '@/core/username';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

/** First-run step 1 (V2): choose a username. Finishing it registers an anonymous user. */
export default function UsernameScreen() {
  const theme = useTheme();
  const { completeUsername } = useAppData();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const empty = value === '';

  const submit = async () => {
    const result = validateUsername(value);
    if (!result.ok) return setError(result.error);
    setSaving(true);
    try {
      await completeUsername(result.username);
      router.replace('/setup/budget');
    } catch {
      setSaving(false);
      setError('Could not save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.xl }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.center, { gap: theme.spacing.xs, marginTop: theme.spacing.xl }]}>
            <AppText variant="headlineSmall" accessibilityRole="header" style={styles.centerText}>
              Choose your username
            </AppText>
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.centerText}>
              {"This is how you'll appear in the app."}
            </AppText>
          </View>

          <View style={[styles.center, styles.grow, { gap: theme.spacing['2xl'] }]}>
            <View
              importantForAccessibility="no-hide-descendants"
              style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <AppText style={{ fontFamily: theme.font('700'), fontSize: 32, lineHeight: 40, color: theme.colors.onPrimaryContainer }}>
                {avatarInitial(value)}
              </AppText>
            </View>
            <View style={{ width: 280, gap: theme.spacing.xs }}>
              <View style={[styles.inputRow, { borderBottomColor: error ? theme.colors.error : theme.colors.primary }]}>
                <AppText style={{ fontFamily: theme.font('600'), fontSize: 28, color: theme.colors.onSurfaceVariant }}>@</AppText>
                <TextInput
                  value={value}
                  onChangeText={(t) => {
                    setError(null);
                    setValue(normalizeUsername(t));
                  }}
                  placeholder="username"
                  placeholderTextColor={theme.colors.outlineVariant}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  accessibilityLabel="Username"
                  maxFontSizeMultiplier={1.6}
                  style={[styles.input, { fontFamily: theme.font('600'), color: theme.colors.onSurface }]}
                />
              </View>
              {error && (
                <AppText variant="bodySmall" color="error" accessibilityRole="alert">
                  {error}
                </AppText>
              )}
            </View>
          </View>

          <Button label="Continue" onPress={submit} loading={saving} disabled={empty} style={styles.cta} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  grow: { flex: 1, justifyContent: 'center', paddingVertical: 32 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, paddingBottom: 6 },
  input: { flex: 1, fontSize: 28, paddingVertical: 4 },
  cta: { alignSelf: 'center', minWidth: 160 },
});
