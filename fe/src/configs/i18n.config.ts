import type { InitOptions } from 'i18next';

export const defaultNS = 'common';
export const fallbackLng = 'id';

export const languages = ['en', 'id'] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = 'id';

export const i18nConfig: InitOptions = {
  defaultNS,
  fallbackLng,
  supportedLngs: languages,
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};

// Helper function to get the language name
export const getLanguageName = (lang: Language) => {
  const names: Record<Language, string> = {
    en: 'English',
    id: 'Indonesia',
  };
  return names[lang];
};

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'app-language-preference';
