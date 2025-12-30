import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, RestProtocol, RestMockPlugin, type RestMockConfig } from '@hai3/react';
import { Switch } from '@hai3/uikit';

/**
 * API Mode Toggle Component
 * Toggles between mock and real API by adding/removing RestMockPlugin globally
 *
 * Uses protocol-level plugin management (RestProtocol.globalPlugins) for
 * cross-cutting mock behavior that affects all REST API services.
 */

export interface ApiModeToggleProps {
  className?: string;
  /** Mock config to use when enabling mock mode */
  mockConfig?: RestMockConfig;
  /** Delay to use when enabling mock mode (deprecated: use mockConfig.delay) */
  mockDelay?: number;
}

export const ApiModeToggle: React.FC<ApiModeToggleProps> = ({
  className,
  mockConfig,
  mockDelay = 500,
}) => {
  // Track the mock plugin instance we create
  const mockPluginRef = useRef<RestMockPlugin | null>(null);

  // Check if our mock plugin is currently registered
  const [useMockApi, setUseMockApi] = useState(() => {
    return mockPluginRef.current !== null && RestProtocol.globalPlugins.has(mockPluginRef.current);
  });
  const { t } = useTranslation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mockPluginRef.current) {
        RestProtocol.globalPlugins.remove(mockPluginRef.current);
        mockPluginRef.current = null;
      }
    };
  }, []);

  const handleToggle = (checked: boolean) => {
    setUseMockApi(checked);
    if (checked) {
      // Enable mock mode - add RestMockPlugin if not already present
      if (!mockPluginRef.current) {
        const config: RestMockConfig = mockConfig ?? { mockMap: {}, delay: mockDelay };
        mockPluginRef.current = new RestMockPlugin(config);
        RestProtocol.globalPlugins.add(mockPluginRef.current);
      }
    } else {
      // Disable mock mode - remove RestMockPlugin
      if (mockPluginRef.current) {
        RestProtocol.globalPlugins.remove(mockPluginRef.current);
        mockPluginRef.current = null;
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
