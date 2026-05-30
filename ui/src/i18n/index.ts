import i18nConfig from './config';

export {
  DEFAULT_LOCALE,
  LOCAL_STORAGE_KEY,
  LOCALE_OPTIONS,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from './config';
export type { Locale, LocaleOption } from './config';
export {
  I18nContext,
  I18nProvider,
  getInitialLocale,
} from './provider';
export type { I18nContextValue, TranslationKey } from './provider';
export { useI18n } from './hooks';
export {
  enTranslations,
  esARTranslations,
} from './locales';
export type { TranslationMessages } from './locales';

export default i18nConfig;
