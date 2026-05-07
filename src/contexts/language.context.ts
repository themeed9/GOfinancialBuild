import { createContext } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  countryCode: string;
}

export interface LanguageContextValue {
  language: string;
  setLanguage: (code: string) => void;
  languages: LanguageOption[];
  direction: 'ltr' | 'rtl';
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
