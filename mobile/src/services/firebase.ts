/**
 * Firebase is optional: without the EXPO_PUBLIC_FIREBASE_* values the app
 * runs exactly as before and every service here is a no-op.
 *
 * The values are the public web config from the Firebase console
 * (Project settings → Your apps → Web app). They are not secrets; access is
 * controlled by the Firestore rules in mobile/firebase/firestore.rules.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let services: FirebaseServices | null = null;

/** Lazily starts Firebase; returns null when the app is not configured. */
export function firebase(): FirebaseServices | null {
  if (!isFirebaseConfigured()) return null;
  if (services) return services;
  const app = getApps().length ? getApp() : initializeApp(config);
  let auth: Auth;
  try {
    // Keeps the anonymous user signed in across app restarts.
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app); // already initialised (fast refresh)
  }
  services = { app, auth, db: getFirestore(app) };
  return services;
}
