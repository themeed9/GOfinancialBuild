/**
 * Email accounts (hidden behind FEATURES.emailAccounts).
 *
 * Creating an account *upgrades* the anonymous user in place, so the same
 * user id — and therefore the registered-user count and daily activity —
 * carries over. "Continue with Google" will link the same way once the
 * native Google sign-in is configured.
 */
import {
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { firebase } from './firebase';

export type AccountResult = { ok: true } | { ok: false; error: string };

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/credential-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/weak-password': 'Use at least 6 characters.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/network-request-failed': 'No internet connection. Try again when you are online.',
};

function fail(error: unknown): AccountResult {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  return { ok: false, error: MESSAGES[code] ?? 'Something went wrong. Please try again.' };
}

const NOT_READY: AccountResult = { ok: false, error: 'Accounts are not available yet.' };

export async function createEmailAccount(name: string, email: string, password: string): Promise<AccountResult> {
  const fb = firebase();
  if (!fb) return NOT_READY;
  try {
    await fb.auth.authStateReady();
    const user = fb.auth.currentUser ?? (await signInAnonymously(fb.auth)).user;
    const cred = EmailAuthProvider.credential(email.trim(), password);
    const linked = await linkWithCredential(user, cred);
    if (name.trim()) await updateProfile(linked.user, { displayName: name.trim() });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AccountResult> {
  const fb = firebase();
  if (!fb) return NOT_READY;
  try {
    await signInWithEmailAndPassword(fb.auth, email.trim(), password);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Firebase emails a reset link (the V2 design says "OTP"; see note in mobile/AGENTS.md). */
export async function sendPasswordReset(email: string): Promise<AccountResult> {
  const fb = firebase();
  if (!fb) return NOT_READY;
  try {
    await sendPasswordResetEmail(fb.auth, email.trim());
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
