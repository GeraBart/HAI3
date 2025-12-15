import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementScreenTranslationsVersion } from '../app/appSlice';
import { i18nRegistry } from './i18nRegistry';
import { selectActiveScreen } from '@hai3/layout';
import type { Language, TranslationDictionary } from './types';

// Legacy root state interface for backward compatibility
interface LegacyRootState {
  uicore?: {
    app?: { language?: Language };
    layout?: { selectedScreen?: string };
  };
  'layout/app'?: { language?: Language };
  'layout/screen'?: { activeScreen?: string };
}

// Legacy-compatible language selector
const selectLanguage = (state: LegacyRootState): Language | undefined => {
  // Try new path first
  if (state['layout/app']?.language) {
    return state['layout/app'].language;
  }
  // Fall back to legacy path
  return state.uicore?.app?.language;
};

// Legacy-compatible screen selector
const selectScreen = (state: LegacyRootState): string | undefined => {
  // Try new selector first
  try {
    const result = selectActiveScreen(state as Parameters<typeof selectActiveScreen>[0]);
    if (result) return result;
  } catch {
    // Fall through to legacy
  }
  // Fall back to legacy path
  return state.uicore?.layout?.selectedScreen;
};

/**
 * Hook to register screen-level translations
 *
 * This hook should be called at the top level of screen components to register
 * their translations lazily. Translations are only loaded when the screen is navigated to.
 *
 * @param screensetId - ID of the screenset (e.g., 'demo', 'chat')
 * @param screenId - ID of the screen (e.g., 'helloworld', 'profile')
 * @param loader - Translation loader function that imports translation files
 *
 * @example
 * ```typescript
 * export const HelloWorldScreen: React.FC = () => {
 *   useScreenTranslations('demo', 'helloworld', createTranslationLoader({
 *     [Language.English]: () => import('./i18n/en.json'),
 *     [Language.Spanish]: () => import('./i18n/es.json'),
 *     // ... all 36 languages
 *   }));
 *
 *   const { t } = useTranslation();
 *   return <div>{t('screen.demo.helloworld:title')}</div>;
 * };
 * ```
 */
export function useScreenTranslations(
  screensetId: string,
  screenId: string,
  loader: (language: Language) => Promise<TranslationDictionary>
): void {
  const registered = useRef(false);
  const loadedLanguage = useRef<Language | null>(null);
  const [, setLoaded] = useState(0);
  const language = useSelector(selectLanguage);
  const selectedScreen = useSelector(selectScreen);
  const dispatch = useDispatch();

  // Register loader once
  useEffect(() => {
    if (!registered.current) {
      const namespace = `screen.${screensetId}.${screenId}`;
      i18nRegistry.registerLoader(namespace, loader);
      registered.current = true;
    }
  }, [screensetId, screenId, loader]);

  // Load translations only if this is the selected screen and language changed
  useEffect(() => {
    const isSelectedScreen = selectedScreen === screenId;
    const languageChanged = language && loadedLanguage.current !== language;

    if (language && registered.current && isSelectedScreen && languageChanged) {
      const namespace = `screen.${screensetId}.${screenId}`;

      loader(language).then(translations => {
        i18nRegistry.register(namespace, language, translations);
        loadedLanguage.current = language; // Mark this language as loaded
        setLoaded(prev => prev + 1); // Force local re-render
        dispatch(incrementScreenTranslationsVersion()); // Notify all components
      }).catch(error => {
        console.error(`[i18n] Failed to load screen translations for ${namespace}:`, error);
      });
    }
  }, [language, selectedScreen, screensetId, screenId, loader, dispatch]);
}
