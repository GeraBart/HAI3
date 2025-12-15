import { TextDirection } from '@hai3/i18n';

/**
 * I18n configuration constants
 */
export const I18N_NAMESPACE_SEPARATOR = ':';
export const I18N_PATH_SEPARATOR = '.';
export const I18N_DEFAULT_NAMESPACE = 'app';

/**
 * HTML attributes for i18n
 */
export const HTML_LANG_ATTRIBUTE = 'lang';
export const HTML_DIR_ATTRIBUTE = 'dir';

/**
 * Text direction for languages
 * Re-exported from @hai3/i18n for convenience
 */
export { TextDirection };

/**
 * Display mode for language names
 */
export enum LanguageDisplayMode {
  Native = 'native',
  English = 'english',
}

/**
 * Language enum - all supported languages
 * Based on major platforms (Google, Facebook, Microsoft, Apple)
 * Now supports 36 languages with complete coverage of major tech platforms
 */
export enum Language {
  // Western European
  English = 'en',
  Spanish = 'es',
  French = 'fr',
  German = 'de',
  Italian = 'it',
  Portuguese = 'pt',
  Dutch = 'nl',

  // Eastern European
  Russian = 'ru',
  Polish = 'pl',
  Ukrainian = 'uk',
  Czech = 'cs',

  // Middle East & North Africa (RTL)
  Arabic = 'ar',
  Hebrew = 'he',
  Persian = 'fa',
  Urdu = 'ur',
  Turkish = 'tr',

  // Asian
  ChineseSimplified = 'zh',
  ChineseTraditional = 'zh-TW',
  Japanese = 'ja',
  Korean = 'ko',
  Vietnamese = 'vi',
  Thai = 'th',
  Indonesian = 'id',
  Hindi = 'hi',
  Bengali = 'bn',

  // Nordic
  Swedish = 'sv',
  Danish = 'da',
  Norwegian = 'no',
  Finnish = 'fi',

  // Other
  Greek = 'el',
  Romanian = 'ro',
  Hungarian = 'hu',

  // Additional major languages
  Malay = 'ms',
  Tagalog = 'tl',
  Tamil = 'ta',
  Swahili = 'sw',
}

/**
 * Language metadata
 */
export interface LanguageMetadata {
  code: Language;
  name: string;          // Native name (e.g., 'English', 'العربية')
  englishName: string;   // English name for settings UI
  direction: TextDirection;
  region?: string;       // Optional region (e.g., 'US', 'GB')
}

export const SUPPORTED_LANGUAGES: LanguageMetadata[] = [
  // Western European
  { code: Language.English, name: 'English', englishName: 'English', direction: TextDirection.LeftToRight },
  { code: Language.Spanish, name: 'Español', englishName: 'Spanish', direction: TextDirection.LeftToRight },
  { code: Language.French, name: 'Français', englishName: 'French', direction: TextDirection.LeftToRight },
  { code: Language.German, name: 'Deutsch', englishName: 'German', direction: TextDirection.LeftToRight },
  { code: Language.Italian, name: 'Italiano', englishName: 'Italian', direction: TextDirection.LeftToRight },
  { code: Language.Portuguese, name: 'Português', englishName: 'Portuguese', direction: TextDirection.LeftToRight },
  { code: Language.Dutch, name: 'Nederlands', englishName: 'Dutch', direction: TextDirection.LeftToRight },

  // Eastern European
  { code: Language.Russian, name: 'Русский', englishName: 'Russian', direction: TextDirection.LeftToRight },
  { code: Language.Polish, name: 'Polski', englishName: 'Polish', direction: TextDirection.LeftToRight },
  { code: Language.Ukrainian, name: 'Українська', englishName: 'Ukrainian', direction: TextDirection.LeftToRight },
  { code: Language.Czech, name: 'Čeština', englishName: 'Czech', direction: TextDirection.LeftToRight },

  // Middle East & North Africa (RTL)
  { code: Language.Arabic, name: 'العربية', englishName: 'Arabic', direction: TextDirection.RightToLeft },
  { code: Language.Hebrew, name: 'עברית', englishName: 'Hebrew', direction: TextDirection.RightToLeft },
  { code: Language.Persian, name: 'فارسی', englishName: 'Persian', direction: TextDirection.RightToLeft },
  { code: Language.Urdu, name: 'اردو', englishName: 'Urdu', direction: TextDirection.RightToLeft },
  { code: Language.Turkish, name: 'Türkçe', englishName: 'Turkish', direction: TextDirection.LeftToRight },

  // Asian
  { code: Language.ChineseSimplified, name: '中文', englishName: 'Chinese (Simplified)', direction: TextDirection.LeftToRight },
  { code: Language.ChineseTraditional, name: '繁體中文', englishName: 'Chinese (Traditional)', direction: TextDirection.LeftToRight, region: 'TW' },
  { code: Language.Japanese, name: '日本語', englishName: 'Japanese', direction: TextDirection.LeftToRight },
  { code: Language.Korean, name: '한국어', englishName: 'Korean', direction: TextDirection.LeftToRight },
  { code: Language.Vietnamese, name: 'Tiếng Việt', englishName: 'Vietnamese', direction: TextDirection.LeftToRight },
  { code: Language.Thai, name: 'ไทย', englishName: 'Thai', direction: TextDirection.LeftToRight },
  { code: Language.Indonesian, name: 'Bahasa Indonesia', englishName: 'Indonesian', direction: TextDirection.LeftToRight },
  { code: Language.Hindi, name: 'हिन्दी', englishName: 'Hindi', direction: TextDirection.LeftToRight },
  { code: Language.Bengali, name: 'বাংলা', englishName: 'Bengali', direction: TextDirection.LeftToRight },

  // Nordic
  { code: Language.Swedish, name: 'Svenska', englishName: 'Swedish', direction: TextDirection.LeftToRight },
  { code: Language.Danish, name: 'Dansk', englishName: 'Danish', direction: TextDirection.LeftToRight },
  { code: Language.Norwegian, name: 'Norsk', englishName: 'Norwegian', direction: TextDirection.LeftToRight },
  { code: Language.Finnish, name: 'Suomi', englishName: 'Finnish', direction: TextDirection.LeftToRight },

  // Other major languages
  { code: Language.Greek, name: 'Ελληνικά', englishName: 'Greek', direction: TextDirection.LeftToRight },
  { code: Language.Romanian, name: 'Română', englishName: 'Romanian', direction: TextDirection.LeftToRight },
  { code: Language.Hungarian, name: 'Magyar', englishName: 'Hungarian', direction: TextDirection.LeftToRight },

  // Additional major languages
  { code: Language.Malay, name: 'Bahasa Melayu', englishName: 'Malay', direction: TextDirection.LeftToRight },
  { code: Language.Tagalog, name: 'Tagalog', englishName: 'Tagalog', direction: TextDirection.LeftToRight },
  { code: Language.Tamil, name: 'தமிழ்', englishName: 'Tamil', direction: TextDirection.LeftToRight },
  { code: Language.Swahili, name: 'Kiswahili', englishName: 'Swahili', direction: TextDirection.LeftToRight },
];

// Total: 36 languages - complete coverage of major tech platform languages

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface I18nConfig {
  fallbackLanguage: LanguageCode;
  defaultLanguage: LanguageCode;
}

/**
 * Translation loader function
 * Returns translations for a given language using dynamic import()
 * Must implement ALL languages from Language enum (enforced by Record type)
 */
export type TranslationLoader = (language: Language) => Promise<TranslationDictionary>;
