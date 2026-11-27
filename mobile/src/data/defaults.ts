import { CURRENCIES, DEFAULT_CURRENCY_CODE } from '../core/currencies';
import { DEFAULT_WEEK_START, type WeekStart } from '../core/dates';
import type { Settings } from './repository';

export interface DeviceLocaleInfo {
  languageTag: string | null;
  currencyCode: string | null;
  /** expo-localization's firstWeekday: 1 = Sunday … 7 = Saturday */
  firstWeekday: number | null;
}

export const FALLBACK_LOCALE = 'en-NG';

/**
 * First-launch settings taken from the phone, so there are no onboarding
 * screens: currency, number format and week start follow the device.
 */
export function settingsFromDevice(info: DeviceLocaleInfo): Settings {
  const currency =
    info.currencyCode && CURRENCIES.some((c) => c.code === info.currencyCode)
      ? info.currencyCode
      : DEFAULT_CURRENCY_CODE;

  const weekStart =
    info.firstWeekday && info.firstWeekday >= 1 && info.firstWeekday <= 7
      ? ((info.firstWeekday - 1) as WeekStart)
      : DEFAULT_WEEK_START;

  return { currency, locale: info.languageTag || FALLBACK_LOCALE, weekStart, username: null };
}
