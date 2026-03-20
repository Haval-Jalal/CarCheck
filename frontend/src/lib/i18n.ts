import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import sv from '@/locales/sv'
import en from '@/locales/en'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { sv: { translation: sv }, en: { translation: en } },
    fallbackLng: 'sv',
    supportedLngs: ['sv', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    // escapeValue: false is correct for React — JSX already escapes HTML by default.
    // Only unsafe if dangerouslySetInnerHTML is used (which we don't do).
    interpolation: { escapeValue: false },
  })

export default i18n
