/**
 * useScreenTranslations Hook - Screen-level translation loading
 *
 * React Layer: L3
 */

import { useState, useEffect, useMemo } from 'react';
import { useHAI3 } from '../HAI3Context';
import type { UseScreenTranslationsReturn } from '../types';

/**
 * Translation map type - maps language codes to dynamic import functions.
 * This is what screen components provide.
 */
type TranslationMap = Record<string, () => Promise<{ default: Record<string, string> }>>;

/**
 * Hook for loading screen-level translations.
 * Use this in screen components to lazy-load translations.
 *
 * @param screensetId - The screenset ID
 * @param screenId - The screen ID
 * @param translationMap - Translation map (language code -> import function)
 * @returns Loading state
 *
 * @example
 * ```tsx
 * const translations = {
 *   en: () => import('./i18n/en.json'),
 *   es: () => import('./i18n/es.json'),
 * };
 *
 * export const HomeScreen: React.FC = () => {
 *   const { isLoaded, error } = useScreenTranslations(
 *     'demo',
 *     'home',
 *     translations
 *   );
 *
 *   if (!isLoaded) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return <div>...</div>;
 * };
 * ```
 */
export function useScreenTranslations(
  screensetId: string,
  screenId: string,
  translationMap: TranslationMap
): UseScreenTranslationsReturn {
  const app = useHAI3();
  const { i18nRegistry } = app;

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create a TranslationLoader function from the translation map
  const loader = useMemo(
    () => async (language: string) => {
      const importFn = translationMap[language];
      if (!importFn) {
        // Return empty dictionary if language not in map
        return {};
      }
      const module = await importFn();
      return module.default;
    },
    [translationMap]
  );

  useEffect(() => {
    let cancelled = false;

    const loadTranslations = async () => {
      try {
        const namespace = `screen.${screensetId}.${screenId}`;
        const currentLanguage = i18nRegistry.getLanguage();

        if (!currentLanguage) {
          // No language set yet, wait for it
          setIsLoaded(false);
          return;
        }

        // Register the loader
        i18nRegistry.registerLoader(namespace, loader);

        // Wait a tick for registration to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (!cancelled) {
          setIsLoaded(true);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoaded(false);
        }
      }
    };

    loadTranslations();

    return () => {
      cancelled = true;
    };
  }, [screensetId, screenId, loader, i18nRegistry]);

  return { isLoaded, error };
}
