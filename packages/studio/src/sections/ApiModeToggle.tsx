import React, { useState } from 'react';
import { useTranslation, apiRegistry } from '@hai3/react';
import { Switch } from '@hai3/uikit';

/**
 * API Mode Toggle Component
 * Toggles between mock and real API using apiRegistry
 */

export interface ApiModeToggleProps {
  className?: string;
}

export const ApiModeToggle: React.FC<ApiModeToggleProps> = ({ className }) => {
  // Local state since mock mode is managed by apiRegistry, not Redux
  const [useMockApi, setUseMockApi] = useState(true);
  const { t } = useTranslation();

  const handleToggle = (checked: boolean) => {
    setUseMockApi(checked);
    apiRegistry.setMockMode(checked);
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
