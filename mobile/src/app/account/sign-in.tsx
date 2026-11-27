import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AuthHeader } from '@/components/AuthHeader';
import { Button } from '@/components/Button';
import { CloseIcon } from '@/components/icons';
import { TextField } from '@/components/TextField';
import { FEATURES } from '@/config/features';
import { sendPasswordReset, signInWithEmail } from '@/services/accounts';
import { useTheme } from '@/theme';

/** V2 "Welcome back" + "Reset password" sheet. Hidden until FEATURES.emailAccounts is on. */
export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!FEATURES.emailAccounts) return <Redirect href="/" />;

  const submit = async () => {
    if (!email.includes('@') || password === '') return setError('Enter your email and password.');
    setBusy(true);
    const result = await signInWithEmail(email, password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }} keyboardShouldPersistTaps="handled">
          <AuthHeader tagline="Frictionless expense tracking" />
          <AppText variant="headlineSmall" accessibilityRole="header" style={{ textAlign: 'center' }}>
            Welcome back
          </AppText>
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
            placeholder="Enter your password"
            password
            autoComplete="current-password"
            textContentType="password"
          />
          <Pressable onPress={() => setResetOpen(true)} accessibilityRole="button" style={styles.forgot} hitSlop={8}>
            <AppText variant="bodyMedium" color="primary" style={{ fontFamily: theme.font('500') }}>
              Forgot password?
            </AppText>
          </Pressable>
          {error && (
            <AppText variant="bodyMedium" color="error" accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <Button label="Sign In" onPress={submit} loading={busy} />
          <View style={styles.switchRow}>
            <AppText variant="bodyMedium" color="onSurfaceVariant">
              {"Don't have an account?"}
            </AppText>
            <Pressable onPress={() => router.replace('/account/create')} accessibilityRole="link" hitSlop={12}>
              <AppText variant="bodyMedium" color="primary" style={{ fontFamily: theme.font('600') }}>
                Create one
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ResetPasswordSheet visible={resetOpen} initialEmail={email} onClose={() => setResetOpen(false)} />
    </SafeAreaView>
  );
}

function ResetPasswordSheet({ visible, initialEmail, onClose }: { visible: boolean; initialEmail: string; onClose(): void }) {
  const theme = useTheme();
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!email.includes('@')) return setMessage({ text: 'Enter a valid email address.', error: true });
    setBusy(true);
    const result = await sendPasswordReset(email);
    setBusy(false);
    setMessage(result.ok ? { text: 'Check your inbox for a link to reset your password.', error: false } : { text: result.error, error: true });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.colors.background, padding: theme.spacing.xl, gap: theme.spacing.md, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
        ]}>
        <View style={styles.sheetTitle}>
          <AppText variant="titleLarge" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
            Reset Password
          </AppText>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
            <CloseIcon color={theme.colors.onSurface} />
          </Pressable>
        </View>
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          {"Enter the email address linked to your account and we'll send you a link to reset your password."}
        </AppText>
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        {message && (
          <AppText variant="bodyMedium" color={message.error ? 'error' : 'primary'} accessibilityLiveRegion="polite">
            {message.text}
          </AppText>
        )}
        <Button label="Send reset link" onPress={send} loading={busy} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, minHeight: 44, alignItems: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { paddingBottom: 40 },
  sheetTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
