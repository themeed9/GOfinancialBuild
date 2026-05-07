import { useContext } from 'react';
import { LanguageContext } from '../contexts/language.context';
import type { LanguageOption } from '../contexts/language.context';

export type { LanguageOption };

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
