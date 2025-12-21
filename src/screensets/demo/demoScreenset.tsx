import { type ScreensetConfig, ScreensetCategory, uikitRegistry, I18nRegistry, Language, apiRegistry, screensetRegistry, i18nRegistry } from '@hai3/react';
import { ACCOUNTS_DOMAIN } from '@/api';
import { DEMO_SCREENSET_ID, HELLO_WORLD_SCREEN_ID, CURRENT_THEME_SCREEN_ID, PROFILE_SCREEN_ID, UI_KIT_ELEMENTS_SCREEN_ID } from './ids';
import { WorldIcon, WORLD_ICON_ID } from './uikit/icons/WorldIcon';
import { PaletteIcon, PALETTE_ICON_ID } from './uikit/icons/PaletteIcon';
import { UserIcon, USER_ICON_ID } from './uikit/icons/UserIcon';
import { ShadcnIcon, SHADCN_ICON_ID } from './uikit/icons/ShadcnIcon';

// Import module augmentation and mocks for accounts service
import './api/accounts/extra';
import { accountsMockMap } from './api/accounts/mocks';

/**
 * Screenset-level translations
 * Register directly with i18nRegistry (not via screenset config)
 * All 36 languages must be provided for type safety
 */
i18nRegistry.registerLoader(
  `screenset.${DEMO_SCREENSET_ID}`,
  I18nRegistry.createLoader({
    [Language.English]: () => import('./i18n/en.json'),
    [Language.Arabic]: () => import('./i18n/ar.json'),
    [Language.Bengali]: () => import('./i18n/bn.json'),
    [Language.Czech]: () => import('./i18n/cs.json'),
    [Language.Danish]: () => import('./i18n/da.json'),
    [Language.German]: () => import('./i18n/de.json'),
    [Language.Greek]: () => import('./i18n/el.json'),
    [Language.Spanish]: () => import('./i18n/es.json'),
    [Language.Persian]: () => import('./i18n/fa.json'),
    [Language.Finnish]: () => import('./i18n/fi.json'),
    [Language.French]: () => import('./i18n/fr.json'),
    [Language.Hebrew]: () => import('./i18n/he.json'),
    [Language.Hindi]: () => import('./i18n/hi.json'),
    [Language.Hungarian]: () => import('./i18n/hu.json'),
    [Language.Indonesian]: () => import('./i18n/id.json'),
    [Language.Italian]: () => import('./i18n/it.json'),
    [Language.Japanese]: () => import('./i18n/ja.json'),
    [Language.Korean]: () => import('./i18n/ko.json'),
    [Language.Malay]: () => import('./i18n/ms.json'),
    [Language.Dutch]: () => import('./i18n/nl.json'),
    [Language.Norwegian]: () => import('./i18n/no.json'),
    [Language.Polish]: () => import('./i18n/pl.json'),
    [Language.Portuguese]: () => import('./i18n/pt.json'),
    [Language.Romanian]: () => import('./i18n/ro.json'),
    [Language.Russian]: () => import('./i18n/ru.json'),
    [Language.Swedish]: () => import('./i18n/sv.json'),
    [Language.Swahili]: () => import('./i18n/sw.json'),
    [Language.Tamil]: () => import('./i18n/ta.json'),
    [Language.Thai]: () => import('./i18n/th.json'),
    [Language.Tagalog]: () => import('./i18n/tl.json'),
    [Language.Turkish]: () => import('./i18n/tr.json'),
    [Language.Ukrainian]: () => import('./i18n/uk.json'),
    [Language.Urdu]: () => import('./i18n/ur.json'),
    [Language.Vietnamese]: () => import('./i18n/vi.json'),
    [Language.ChineseSimplified]: () => import('./i18n/zh.json'),
    [Language.ChineseTraditional]: () => import('./i18n/zh-TW.json'),
  })
);

/**
 * Register mock data for accounts service
 * Demo screenset uses the accounts service for the profile screen
 * The screenset owns the mocks and module augmentation (extras)
 * Type assertion needed because ApiServicesMap module augmentation is defined in screenset
 */
(apiRegistry as { registerMocks(domain: string, mockMap: typeof accountsMockMap): void }).registerMocks(ACCOUNTS_DOMAIN, accountsMockMap);

/**
 * Register screenset-specific icons
 * Screenset is responsible for registering its own icons
 * Screen-level translations are registered by each screen component when it mounts
 */
uikitRegistry.registerIcons({
  [WORLD_ICON_ID]: <WorldIcon />,
  [PALETTE_ICON_ID]: <PaletteIcon />,
  [USER_ICON_ID]: <UserIcon />,
  [SHADCN_ICON_ID]: <ShadcnIcon />,
});

/**
 * Demo Screenset Configuration
 * Self-contained - knows about its own screens, icons, and structure
 * All screens are lazy-loaded for optimal performance
 * Translations are registered directly with i18nRegistry above
 */
export const demoScreenset: ScreensetConfig = {
  id: DEMO_SCREENSET_ID,
  name: 'Demo',
  category: ScreensetCategory.Drafts,
  defaultScreen: HELLO_WORLD_SCREEN_ID,
  menu: [
    {
      menuItem: {
        id: HELLO_WORLD_SCREEN_ID,
        label: `screenset.${DEMO_SCREENSET_ID}:screens.${HELLO_WORLD_SCREEN_ID}.title`,
        icon: WORLD_ICON_ID,
      },
      screen: () => import('./screens/helloworld/HelloWorldScreen'),
    },
    {
      menuItem: {
        id: CURRENT_THEME_SCREEN_ID,
        label: `screenset.${DEMO_SCREENSET_ID}:screens.${CURRENT_THEME_SCREEN_ID}.title`,
        icon: PALETTE_ICON_ID,
      },
      screen: () => import('./screens/theme/CurrentThemeScreen'),
    },
    {
      menuItem: {
        id: PROFILE_SCREEN_ID,
        label: `screenset.${DEMO_SCREENSET_ID}:screens.${PROFILE_SCREEN_ID}.title`,
        icon: USER_ICON_ID,
      },
      screen: () => import('./screens/profile/ProfileScreen'),
    },
    {
      menuItem: {
        id: UI_KIT_ELEMENTS_SCREEN_ID,
        label: `screenset.${DEMO_SCREENSET_ID}:screens.${UI_KIT_ELEMENTS_SCREEN_ID}.title`,
        icon: SHADCN_ICON_ID,
      },
      screen: () => import('./screens/uikit/UIKitElementsScreen'),
    },
  ],
};

/**
 * Self-register screenset
 * Auto-discovered via Vite glob import in screensetRegistry.tsx
 * This side effect runs when the module is imported
 */
screensetRegistry.register(demoScreenset);
