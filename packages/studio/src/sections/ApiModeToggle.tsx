import React, { useState } from 'react';
import { useTranslation, apiRegistry, MockPlugin, type MockMap } from '@hai3/react';
import { Switch } from '@hai3/uikit';

/**
 * API Mode Toggle Component
 * Toggles between mock and real API by adding/removing MockPlugin
 */

export interface ApiModeToggleProps {
  className?: string;
  /** Mock map to use when enabling mock mode */
  mockMap?: MockMap;
  /** Delay to use when enabling mock mode */
  mockDelay?: number;
}

export const ApiModeToggle: React.FC<ApiModeToggleProps> = ({
  className,
  mockMap = {},
  mockDelay = 500,
}) => {
  // Check if MockPlugin is currently registered
  const [useMockApi, setUseMockApi] = useState(() => apiRegistry.plugins.has(MockPlugin));
  const { t } = useTranslation();

  const handleToggle = (checked: boolean) => {
    setUseMockApi(checked);
    if (checked) {
      // Enable mock mode - add MockPlugin if not already present
      if (!apiRegistry.plugins.has(MockPlugin)) {
        apiRegistry.plugins.add(new MockPlugin({ mockMap, delay: mockDelay }));
      }
    } else {
      // Disable mock mode - remove MockPlugin
      if (apiRegistry.plugins.has(MockPlugin)) {
        apiRegistry.plugins.remove(MockPlugin);
      }
    }
  };

  return (
    <div className={`flex items-center justify-between h-9 ${className}`}>
      <label
        htmlFor="api-mode-toggle"
        className="text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap"
      >
        {t('studio:controls.mockApi')}
      </label>
      <Switch
        id="api-mode-toggle"
        checked={useMockApi}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};

ApiModeToggle.displayName = 'ApiModeToggle';
