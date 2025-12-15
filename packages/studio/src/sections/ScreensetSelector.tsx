import React from 'react';
import { upperFirst } from 'lodash';
import { ButtonVariant } from '@hai3/uikit';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownButton,
} from '@hai3/uikit';
import { useTranslation } from '@hai3/uicore';
import { useStudioContext } from '../StudioProvider';

/**
 * ScreensetSelector Component
 * Redux-aware component for 2-level screenset selection
 * Uses DropdownMenu with DropdownMenuSub for categories
 */

export interface ScreensetOption {
  category: string;
  screensets: Array<{ id: string; name: string }>;
}

export interface ScreensetSelectorProps {
  options: ScreensetOption[];
  currentValue: string; // Format: "category:screensetId"
  onChange: (value: string) => void; // Receives "category:screensetId"
  className?: string;
}

export const ScreensetSelector: React.FC<ScreensetSelectorProps> = ({
  options,
  currentValue,
  onChange,
  className = '',
}) => {
  const { portalContainer } = useStudioContext();
  const { t, direction } = useTranslation();

  // Format names
  const formatName = (name: string): string => {
    return name
      .split(/[-_]/)
      .map((word) => upperFirst(word))
      .join(' ');
  };

  // Get current display value
  const getCurrentDisplay = (): string => {
    const [category, itemId] = currentValue.split(':');
    if (!category || !itemId) return 'Select';
    const categoryGroup = options.find((opt) => opt.category === category);
    const item = categoryGroup?.screensets.find((i) => i.id === itemId);
    return item ? item.name : 'Select';
  };

  const handleItemClick = (category: string, itemId: string): void => {
    onChange(`${category}:${itemId}`);
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        {t('studio:controls.screenset')}
      </label>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <DropdownButton variant={ButtonVariant.Outline}>
            {formatName(getCurrentDisplay())}
          </DropdownButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" container={portalContainer} className="z-[99999] pointer-events-auto">
          {options.map((categoryGroup) => (
            <DropdownMenuSub key={categoryGroup.category}>
              <DropdownMenuSubTrigger disabled={categoryGroup.screensets.length === 0}>
                {formatName(categoryGroup.category)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent container={portalContainer} className="z-[99999] pointer-events-auto">
                {categoryGroup.screensets.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleItemClick(categoryGroup.category, item.id)}
                  >
                    {formatName(item.name)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

ScreensetSelector.displayName = 'ScreensetSelector';
