import type { Locale } from '../config';
import enTranslations, { type TranslationMessages } from './en';
import esARTranslations from './es-AR';

export type { TranslationMessages } from './en';
export { default as enTranslations } from './en';
export { default as esARTranslations } from './es-AR';

const translations: Record<Locale, TranslationMessages> = {
  en: enTranslations,
  'es-AR': esARTranslations,
};

export default translations;
