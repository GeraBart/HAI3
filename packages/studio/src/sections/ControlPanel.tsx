import React, { useState, useEffect } from 'react';
import { useNavigation, screensetRegistry, useTranslation, ScreensetCategory } from '@hai3/react';
import { ThemeSelector } from './ThemeSelector';
import { ScreensetSelector, type ScreensetOption } from './ScreensetSelector';
import { LanguageSelector } from './LanguageSelector';
import { ApiModeToggle } from './ApiModeToggle';

/**
 * All possible screenset categories
 */
const ALL_CATEGORIES: ScreensetCategory[] = [ScreensetCategory.Drafts, ScreensetCategory.Mockups, ScreensetCategory.Production];

/**
 * Build screenset options for selector
 * Returns all categories, even if empty
 */
const buildScreensetOptions = (): ScreensetOption[] => {
  const allScreensets = screensetRegistry.getAll();
  return ALL_CATEGORIES.map((category) => ({
    category,
    screensets: allScreensets
      .filter(s => s.category === category)
      .map(s => ({
        id: s.id,
        name: s.name,
      })),
  }));
};

export const ControlPanel: React.FC = () => {
  const { currentScreenset, navigateToScreenset } = useNavigation();
  const [screensetOptions, setScreensetOptions] = useState<ScreensetOption[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const options = buildScreensetOptions();
    setScreensetOptions(options);
  }, []);

  // Build current value in "category:screensetId" format
  const getCurrentValue = (): string => {
    if (!currentScreenset) return '';
    const screenset = screensetRegistry.get(currentScreenset);
    if (!screenset) return '';
    return `${screenset.category}:${screenset.id}`;
  };

  // Handle screenset selection - extract screensetId from "category:screensetId"
  const handleScreensetChange = (value: string): void => {
    const [, screensetId] = value.split(':');
    if (screensetId) {
      navigateToScreenset(screensetId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('studio:controls.heading')}
        </h3>

        <div className="space-y-3">
          {screensetOptions.length > 0 && (
            <ScreensetSelector
              options={screensetOptions}
              currentValue={getCurrentValue()}
              onChange={handleScreensetChange}
            />
          )}
          <ApiModeToggle />
          <ThemeSelector />
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

ControlPanel.displayName = 'ControlPanel';
