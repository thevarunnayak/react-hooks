/**
 * Type-Safe Internationalization (i18n) Engine
 */

import { en, TranslationSchema } from './translations/en';

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

export type Leaves<T> = T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T]
  : '';

export type TranslationKey = Leaves<TranslationSchema>;

export type SupportedLocale = 'en';

let currentLocale: SupportedLocale = 'en';
const translations: Record<SupportedLocale, TranslationSchema> = {
  en,
};

/**
 * Get active locale
 */
export const getLocale = (): SupportedLocale => currentLocale;

/**
 * Set active locale
 */
export const setLocale = (locale: SupportedLocale): void => {
  currentLocale = locale;
};

/**
 * Type-safe translation resolution with interpolation
 * Example: t('playground.toolbar.saveTooltip')
 * Example with params: t('playground.alerts.saveMessage', { nodes: 4, conns: 3 })
 */
export function t(key: TranslationKey | string, params?: Record<string, string | number>): string {
  const dict = translations[currentLocale] || en;
  const segments = key.split('.');

  let current: any = dict;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      // Fallback or return key if missing
      return key;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (!params) {
    return current;
  }

  // Interpolate {{paramName}}
  return current.replace(/\{\{(\w+)\}\}/g, (_, match) => {
    return params[match] !== undefined ? String(params[match]) : `{{${match}}}`;
  });
}
