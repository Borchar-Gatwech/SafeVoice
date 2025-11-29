const i18next = require('i18next');
const path = require('path');
const fs = require('fs');

// Simple i18next configuration for Node.js
const translations = {
  en: require('../locales/en.json'),
  sw: require('../locales/sw.json'),
  fr: require('../locales/fr.json'),
  zu: require('../locales/zu.json'),
  ny: require('../locales/ny.json')
};

// Initialize i18next
i18next.init({
  resources: translations,
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false
  }
});

// Helper function to translate
function t(key, options = {}) {
  const language = options.lng || 'en';
  return i18next.getFixedT(language)(key, options);
}

module.exports = { t, i18next };

