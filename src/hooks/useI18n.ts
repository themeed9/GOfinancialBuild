import { useMemo } from 'react';
import { useLanguage } from './useLanguage';
import { getTranslationSet, type TranslationSet } from '../data/translations';

export function useI18n(): TranslationSet {
  const { language } = useLanguage();

  const translationSet = useMemo(() => getTranslationSet(language), [language]);

  return translationSet;
}
