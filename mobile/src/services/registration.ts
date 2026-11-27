/**
 * Counting users without sign-up.
 *
 * - When someone finishes the username step, an anonymous Firebase user is
 *   created (no email or password). Firebase console → Authentication →
 *   Users is the registered-user count.
 * - Once per local day the app writes dailyActive/{YYYY-MM-DD}/users/{uid},
 *   so each day's document count is that day's active users.
 *
 * Only the anonymous id, platform, app version, locale and currency are
 * sent. The username, transactions and budget stay on the phone.
 * Every call is best-effort: failures (offline, not configured) are ignored
 * and retried on a later app open, so they never slow the user down.
 */
import Constants from 'expo-constants';
import { deleteUser, signInAnonymously, type User } from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { localDayKey, shouldReportDailyOpen } from '@/core/activity';
import { firebase } from './firebase';

export interface RegistrationContext {
  locale: string;
  currency: string;
}

const appVersion = Constants.expoConfig?.version ?? 'unknown';

async function currentOrAnonymousUser(): Promise<User | null> {
  const fb = firebase();
  if (!fb) return null;
  await fb.auth.authStateReady();
  if (fb.auth.currentUser) return fb.auth.currentUser;
  const cred = await signInAnonymously(fb.auth);
  return cred.user;
}

/** Called when the username step is completed. */
export async function registerAnonymously(ctx: RegistrationContext): Promise<string | null> {
  try {
    const fb = firebase();
    const user = await currentOrAnonymousUser();
    if (!fb || !user) return null;
    await setDoc(
      doc(fb.db, 'users', user.uid),
      { createdAt: serverTimestamp(), platform: Platform.OS, appVersion, locale: ctx.locale, currency: ctx.currency },
      { merge: true },
    );
    return user.uid;
  } catch {
    return null;
  }
}

/**
 * Reports "opened today" if it has not been reported yet for this local day.
 * Returns the day key that was reported, or null if nothing was sent.
 */
export async function reportDailyOpen(lastReportedDay: string | null, now: number): Promise<string | null> {
  if (!shouldReportDailyOpen(lastReportedDay, now)) return null;
  try {
    const fb = firebase();
    if (!fb) return null;
    await fb.auth.authStateReady();
    const user = fb.auth.currentUser;
    if (!user) return null; // not registered yet (username step not done)
    const day = localDayKey(now);
    await setDoc(doc(fb.db, 'dailyActive', day, 'users', user.uid), { at: serverTimestamp(), platform: Platform.OS });
    return day;
  } catch {
    return null;
  }
}

/** Settings → Delete all data: removes the anonymous account and its record. */
export async function forgetRegistration(): Promise<void> {
  try {
    const fb = firebase();
    if (!fb) return;
    await fb.auth.authStateReady();
    const user = fb.auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(fb.db, 'users', user.uid)).catch(() => undefined);
    await deleteUser(user);
  } catch {
    // Best-effort; the record holds no personal data.
  }
}
