import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { LanguageContext, type LanguageOption } from './language.context';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', countryCode: 'gb' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', countryCode: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', countryCode: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', countryCode: 'de' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', countryCode: 'pt' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', countryCode: 'sa' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', countryCode: 'in' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', countryCode: 'jp' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', countryCode: 'cn' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', countryCode: 'kr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', countryCode: 'ru' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', countryCode: 'tr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', countryCode: 'it' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', countryCode: 'th' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', countryCode: 'vn' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', countryCode: 'id' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', countryCode: 'my' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', countryCode: 'se' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', countryCode: 'pl' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', countryCode: 'cz' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', countryCode: 'hu' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', countryCode: 'ro' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', countryCode: 'bg' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', countryCode: 'il' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', countryCode: 'ua' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', direction: 'ltr', countryCode: 'is' },
];

const STORAGE_KEY = 'gofinancial_language';

function loadSavedLanguage(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.find(l => l.code === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'en';
}

function saveLanguage(code: string): void {
  localStorage.setItem(STORAGE_KEY, code);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(loadSavedLanguage);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
    saveLanguage(code);
    const lang = LANGUAGES.find(l => l.code === code);
    if (lang) {
      document.documentElement.dir = lang.direction;
      document.documentElement.lang = code;
    }
  }, []);

  const direction = useMemo(() => {
    const lang = LANGUAGES.find(l => l.code === language);
    return lang?.direction || 'ltr';
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages: LANGUAGES,
    direction,
  }), [language, setLanguage, direction]);

  return <LanguageContext value={value}>{children}</LanguageContext>;
}
