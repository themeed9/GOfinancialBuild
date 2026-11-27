/** Usernames are display names kept on the device: 3–20 characters, a–z, 0–9, "." or "_". */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

export type UsernameResult = { ok: true; username: string } | { ok: false; error: string };

/** Lower-cases and strips a leading "@" and spaces as the user types. */
export function normalizeUsername(input: string): string {
  return input.replace(/^@+/, '').replace(/\s+/g, '').toLowerCase().slice(0, USERNAME_MAX);
}

export function validateUsername(input: string): UsernameResult {
  const username = normalizeUsername(input);
  if (username.length === 0) return { ok: false, error: 'Choose a username to continue' };
  if (username.length < USERNAME_MIN) return { ok: false, error: `At least ${USERNAME_MIN} characters` };
  if (!/^[a-z0-9._]+$/.test(username)) return { ok: false, error: 'Use letters, numbers, "." or "_" only' };
  if (!/^[a-z]/.test(username)) return { ok: false, error: 'Start with a letter' };
  return { ok: true, username };
}

/** The avatar shows the first letter, or "?" before anything is typed. */
export function avatarInitial(username: string): string {
  const first = normalizeUsername(username).charAt(0);
  return first ? first.toUpperCase() : '?';
}
