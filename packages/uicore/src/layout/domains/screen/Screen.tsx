import React, { Suspense, useMemo } from 'react';
import { trim } from 'lodash';
import { useAppSelector } from '../../../hooks/useRedux';
import { screensetRegistry } from '../../../screensets/screensetRegistry';
import { uikitRegistry } from '../../../uikit/uikitRegistry';
import { UiKitComponent } from '@hai3/uikit';

/**
 * Loading fallback component for lazy-loaded screens
 * Uses UIKit Spinner component for better UX
 */
const ScreenLoadingFallback: React.FC = () => {
  const Spinner = uikitRegistry.getComponent(UiKitComponent.Spinner);

  return (
    <div className="flex items-center justify-center h-full">
      <Spinner size="size-8" className="text-primary" />
    </div>
  );
};

/**
 * Core Screen component
 * Main content area for rendering application screens
 * Reads layout.selectedScreen from Redux and renders lazy-loaded component from screenset registry
 * Falls back to children if provided (for apps not using screensets)
 *
 * All screens are lazy-loaded using React.lazy for optimal performance and code-splitting
 */

export interface ScreenProps {
  children?: React.ReactNode;
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({ children, className = '' }) => {
  const currentScreensetValue = useAppSelector((state) => state.uicore.layout.currentScreenset);
  const selectedScreen = useAppSelector((state) => state.uicore.layout.selectedScreen);

  const screenset = screensetRegistry.get(currentScreensetValue);
  const screenId = selectedScreen || screenset?.defaultScreen || '';
  const screens = screensetRegistry.getScreens(currentScreensetValue);
  const screenLoader = screens[screenId];

  // Memoize lazy component to prevent recreation on re-renders
  const LazyScreenComponent = useMemo(() => {
    return screenLoader ? React.lazy(screenLoader) : null;
  }, [screenLoader]);

  // If children provided, use them (legacy/non-screenset apps)
  if (children) {
    return (
      <main className={trim(`flex-1 overflow-auto bg-muted/30 ${className}`)}>
        {children}
      </main>
    );
  }

  return (
    <main className={trim(`flex-1 overflow-auto bg-muted/30 ${className}`)}>
      {LazyScreenComponent ? (
        <Suspense fallback={<ScreenLoadingFallback />}>
          <LazyScreenComponent />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            {screenset ? `Screen not found: ${screenId}` : 'No screenset configured'}
          </p>
        </div>
      )}
    </main>
  );
};

Screen.displayName = 'Screen';
