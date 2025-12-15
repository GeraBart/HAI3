import { useTranslation, LanguageDisplayMode, TextDirection } from '@hai3/uicore';
import { ButtonVariant } from '@hai3/uikit';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@hai3/uikit';
import { useStudioContext } from '../StudioProvider';

/**
 * LanguageSelector constants
 */
const FALLBACK_SELECT_LANGUAGE_TEXT = 'Select language';
const RTL_INDICATOR_SUFFIX = ' (RTL)';

export interface LanguageSelectorProps {
  /**
   * Show language names in their native script or English
   * @default LanguageDisplayMode.Native
   */
  displayMode?: LanguageDisplayMode;
}

/**
 * Language Selector Component
 *
 * Allows users to switch between supported languages
 * Changes apply immediately without page reload
 * Automatically updates HTML dir attribute for RTL support
 */
export function LanguageSelector({
  displayMode = LanguageDisplayMode.Native
}: LanguageSelectorProps = {}) {
  const { t, language, changeLanguage, getSupportedLanguages } = useTranslation();
  const { portalContainer } = useStudioContext();

  const languages = getSupportedLanguages();
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        {t('studio:controls.language')}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={ButtonVariant.Outline}>
            {currentLanguage
              ? (displayMode === LanguageDisplayMode.Native ? currentLanguage.name : currentLanguage.englishName)
              : FALLBACK_SELECT_LANGUAGE_TEXT
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" container={portalContainer} className="z-[99999] pointer-events-auto">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
            >
              {displayMode === LanguageDisplayMode.Native ? lang.name : lang.englishName}
              {lang.direction === TextDirection.RightToLeft && RTL_INDICATOR_SUFFIX}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
