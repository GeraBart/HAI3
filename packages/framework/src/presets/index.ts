/**
 * Presets - Pre-configured plugin combinations
 *
 * Framework Layer: L2
 */

import type { HAI3Plugin, Presets } from '../types';
import { screensets } from '../plugins/screensets';
import { themes } from '../plugins/themes';
import { layout } from '../plugins/layout';
import { navigation } from '../plugins/navigation';
import { routing } from '../plugins/routing';
import { i18n } from '../plugins/i18n';
import { effects } from '../plugins/effects';

/**
 * Full preset - All plugins for the complete HAI3 experience.
 * This is the default for `hai3 create` projects.
 *
 * Includes:
 * - screensets (screenset registry, screen slice)
 * - themes (theme registry, changeTheme action)
 * - layout (all layout domain slices and effects)
 * - navigation (navigateToScreen, navigateToScreenset actions)
 * - routing (route registry auto-synced from screensets)
 * - i18n (i18n registry, setLanguage action)
 * - effects (effect coordination)
 */
export function full(): HAI3Plugin[] {
  return [
    effects(),
    screensets({ autoDiscover: true }),
    themes(),
    layout(),
    routing(),
    navigation(),
    i18n(),
  ];
}

/**
 * Minimal preset - Screensets + themes only.
 * For users who want basic HAI3 patterns without full layout management.
 *
 * Includes:
 * - screensets (screenset registry, screen slice)
 * - themes (theme registry, changeTheme action)
 */
export function minimal(): HAI3Plugin[] {
  return [
    screensets({ autoDiscover: true }),
    themes(),
  ];
}

/**
 * Headless preset - Screensets only.
 * For external platform integration where you only need screenset orchestration.
 * The external platform provides its own menu, header, navigation, etc.
 *
 * Includes:
 * - screensets (screenset registry, screen slice)
 */
export function headless(): HAI3Plugin[] {
  return [
    screensets(),
  ];
}

/**
 * Presets collection
 */
export const presets: Presets = {
  full,
  minimal,
  headless,
};
