import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Current time, refreshed every minute and whenever the app returns to
 * the foreground, so "today" and "this week" roll over without a restart.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [intervalMs]);

  return now;
}
