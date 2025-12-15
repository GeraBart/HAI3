/**
 * I18n Plugin - Provides i18n registry wiring and setLanguage action
 *
 * Framework Layer: L2
 */

import { createAction, eventBus } from '@hai3/events';
import { createI18nRegistry, Language } from '@hai3/i18n';
import type { HAI3Plugin, SetLanguagePayload } from '../types';

// Define i18n events for module augmentation
declare module '@hai3/events' {
  interface EventPayloadMap {
    'i18n/language/changed': SetLanguagePayload;
  }
}

/**
 * I18n plugin factory.
 *
 * @returns I18n plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(i18n())
 *   .build();
 *
 * app.actions.setLanguage({ language: 'de' });
 * ```
 */
export function i18n(): HAI3Plugin {
  const i18nRegistry = createI18nRegistry({
    defaultLanguage: Language.English,
    fallbackLanguage: Language.English,
  });
  const setLanguage = createAction<'i18n/language/changed'>('i18n/language/changed');

  return {
    name: 'i18n',
    dependencies: [],

    provides: {
      registries: {
        i18nRegistry,
      },
      actions: {
        setLanguage,
      },
    },

    onInit(_app) {
      // Language change effect
      eventBus.on('i18n/language/changed', async (payload: SetLanguagePayload) => {
        await i18nRegistry.setLanguage(payload.language as Language);
      });
    },
  };
}
