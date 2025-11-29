import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';
import fr from './locales/fr.json';
import zu from './locales/zu.json';
import ny from './locales/ny.json';

// Get saved language from localStorage or browser default
const getSavedLanguage = () => {
  const saved = localStorage.getItem('safecircle-language');
  if (saved) return saved;
  
  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  const supported = ['en', 'sw', 'fr', 'zu', 'ny'];
  if (supported.includes(browserLang)) {
    return browserLang;
  }
  
  return 'en'; // Default to English
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
      fr: { translation: fr },
      zu: { translation: zu },
      ny: { translation: ny }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    debug: false
  })
  .catch((err) => {
    console.error('i18n initialization error:', err);
  });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('safecircle-language', lng);
  // Force a re-render by triggering a custom event
  window.dispatchEvent(new Event('languageChanged'));
});

export default i18n;

