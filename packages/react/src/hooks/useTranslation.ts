/**
 * useTranslation Hook - Translation utilities
 *
 * React Layer: L3
 */

import { useMemo, useCallback, useSyncExternalStore } from 'react';
import type { Language } from '@hai3/framework';
import { useHAI3 } from '../HAI3Context';
import type { UseTranslationReturn } from '../types';

/**
 * Hook for accessing translation utilities.
 *
 * @returns Translation utilities
 *
 * @example
 * ```tsx
 * const { t, language, setLanguage, isRTL } = useTranslation();
 *
 * return (
 *   <div dir={isRTL ? 'rtl' : 'ltr'}>
 *     <h1>{t('common:app.title')}</h1>
 *     <p>{t('common:app.welcome', { name: 'John' })}</p>
 *   </div>
 * );
 * ```
 */
export function useTranslation(): UseTranslationReturn {
  const app = useHAI3();
  const { i18nRegistry } = app;

  // Subscribe to language changes using useSyncExternalStore
  const language = useSyncExternalStore(
    useCallback(
      (_callback: () => void) => {
        // The i18n registry doesn't have a built-in subscription mechanism,
        // so we poll on re-renders. In a full implementation, this would
        // use an event subscription.
        return () => {};
      },
      []
    ),
    () => i18nRegistry.getLanguage(),
    () => i18nRegistry.getLanguage()
  );

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number | boolean>) => {
      return i18nRegistry.t(key, params);
    },
    [i18nRegistry]
  );

  // Set language function
  const setLanguage = useCallback(
    async (lang: Language) => {
      await i18nRegistry.setLanguage(lang);
    },
    [i18nRegistry]
  );

  // Check RTL - recomputes when language changes
  const isRTL = useMemo(() => {
    // Reference language to trigger recalculation on language change
    void language;
    return i18nRegistry.isRTL();
  }, [i18nRegistry, language]);

  return {
    t,
    language,
    setLanguage,
    isRTL,
  };
}
