import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCAL_STORAGE_KEY,
  type Locale,
  isSupportedLocale,
} from '../config';
import translations from '../locales';
import type { TranslationMessages } from '../locales';

type DotPath<TValue> = TValue extends string
  ? never
  : {
      [TKey in Extract<keyof TValue, string>]: TValue[TKey] extends string
        ? TKey
        : `${TKey}.${DotPath<TValue[TKey]>}`;
    }[Extract<keyof TValue, string>];

export type TranslationKey = DotPath<TranslationMessages>;

export type I18nContextValue = {
  locale: Locale;
  setLocale(locale: Locale): void;
  t(key: TranslationKey): string;
  translations: TranslationMessages;
};

type I18nProviderProps = {
  children: ReactNode;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

function readPersistedLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

function detectNavigatorLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const candidates = [navigator.language, ...navigator.languages];
  const exactMatch = candidates.find(isSupportedLocale);

  if (exactMatch) {
    return exactMatch;
  }

  const languageMatch = candidates.find((candidate) =>
    candidate.toLowerCase().startsWith('es'),
  );

  return languageMatch ? 'es-AR' : DEFAULT_LOCALE;
}

export function getInitialLocale(): Locale {
  return readPersistedLocale() ?? detectNavigatorLocale();
}

function getTranslationValue(key: TranslationKey, messages: TranslationMessages) {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment];
    }

    return undefined;
  }, messages);
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, locale);
    } catch {
      undefined;
    }

    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const contextValue = useMemo<I18nContextValue>(() => {
    const currentTranslations = translations[locale];

    return {
      locale,
      setLocale,
      translations: currentTranslations,
      t(key) {
        const value = getTranslationValue(key, currentTranslations);
        return typeof value === 'string' ? value : key;
      },
    };
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export default I18nProvider;
