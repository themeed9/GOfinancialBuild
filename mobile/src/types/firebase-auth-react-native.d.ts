// firebase/auth's type entry omits the React Native build's extra export,
// although Metro bundles that build at runtime (via @firebase/auth's
// "react-native" export condition). Declare it so TypeScript sees it.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
