export const SUPPORTED_LOCALES = ['en', 'es-AR'] as const;
export const DEFAULT_LOCALE = 'en';
export const LOCAL_STORAGE_KEY = 'hotel-management.locale';

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleOption = {
  label: string;
  locale: Locale;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { label: 'English', locale: 'en' },
  { label: 'Español (Argentina)', locale: 'es-AR' },
];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

const i18nConfig = {
  defaultLocale: DEFAULT_LOCALE,
  localStorageKey: LOCAL_STORAGE_KEY,
  localeOptions: LOCALE_OPTIONS,
  supportedLocales: SUPPORTED_LOCALES,
} as const;

export default i18nConfig;
