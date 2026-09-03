/**
 * useTranslation Hook
 */

import { useState, useCallback } from 'react';
import { t as translate, getLocale, setLocale as setI18nLocale, SupportedLocale, TranslationKey } from '../i18n/i18n';

export const useTranslation = () => {
  const [locale, setLocaleState] = useState<SupportedLocale>(getLocale());

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setI18nLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) => {
      return translate(key, params);
    },
    // re-memoize when locale changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  );

  return { t, locale, setLocale };
};

export { t } from '../i18n/i18n';
