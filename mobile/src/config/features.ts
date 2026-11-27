/**
 * Feature switches. Hidden features are fully built but unreachable until
 * their switch is turned on here.
 */
export const FEATURES = {
  /** Create account / Sign in / Reset password with email (V2 design). */
  emailAccounts: false,
} as const;
