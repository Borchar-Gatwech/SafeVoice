/**
 * Language detection middleware
 * Checks Accept-Language header and ?lang query parameter
 * Defaults to English
 */
module.exports = (req, res, next) => {
  let language = 'en';

  // Check query parameter first (e.g., ?lang=sw)
  if (req.query.lang) {
    language = req.query.lang.toLowerCase();
  } else if (req.headers['accept-language']) {
    // Parse Accept-Language header
    const acceptedLanguages = req.headers['accept-language']
      .split(',')
      .map(lang => {
        const [code, q = 'q=1.0'] = lang.trim().split(';');
        const quality = parseFloat(q.split('=')[1]);
        return { code: code.toLowerCase().split('-')[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Map browser language codes to our supported languages
    const languageMap = {
      'en': 'en',
      'sw': 'sw', // Swahili
      'fr': 'fr', // French
      'zu': 'zu', // Zulu
      'ny': 'ny'  // Chichewa (Nyanja)
    };

    // Find first supported language
    for (const { code } of acceptedLanguages) {
      if (languageMap[code]) {
        language = languageMap[code];
        break;
      }
    }
  }

  // Validate language code
  const supportedLanguages = ['en', 'sw', 'fr', 'zu', 'ny'];
  if (!supportedLanguages.includes(language)) {
    language = 'en';
  }

  req.language = language;
  res.setHeader('Content-Language', language);
  next();
};

