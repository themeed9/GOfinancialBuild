import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AuthHeader } from '@/components/AuthHeader';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { FEATURES } from '@/config/features';
import { createEmailAccount } from '@/services/accounts';
import { useTheme } from '@/theme';

const PASSWORD_HINT = 'At least 6 characters';

/**
 * V2 "Create account". Hidden until FEATURES.emailAccounts is on.
 * Creating the account upgrades the user's anonymous account in place.
 */
export default function CreateAccountScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!FEATURES.emailAccounts) return <Redirect href="/" />;

  const submit = async () => {
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Use at least 6 characters for your password.');
    setBusy(true);
    const result = await createEmailAccount(name, email, password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }} keyboardShouldPersistTaps="handled">
          <AuthHeader tagline="Start your financial habit" />

          <Button
            label="Continue with Google"
            onPress={() => Alert.alert('Coming soon', 'Google sign-in will be available in a later update.')}
          />
          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
            <AppText variant="bodySmall" color="outline">
              or
            </AppText>
            <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          <AppText variant="headlineSmall" accessibilityRole="header" style={{ textAlign: 'center' }}>
            Create account
          </AppText>
          <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" textContentType="name" />
          <TextField
            label="Email"
            value={email}
            onChangeText={(t) => {
              setError(null);
              setEmail(t);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={(t) => {
              setError(null);
              setPassword(t);
            }}
            placeholder={PASSWORD_HINT}
            password
            autoComplete="new-password"
            textContentType="newPassword"
          />
          {error && (
            <AppText variant="bodyMedium" color="error" accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <Button label="Create Account" onPress={submit} loading={busy} />

          <View style={styles.switchRow}>
            <AppText variant="bodyMedium" color="onSurfaceVariant">
              Already have an account?
            </AppText>
            <Pressable onPress={() => router.replace('/account/sign-in')} accessibilityRole="link" hitSlop={12}>
              <AppText variant="bodyMedium" color="primary" style={{ fontFamily: theme.font('600') }}>
                Sign in
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, minHeight: 44, alignItems: 'center' },
});
