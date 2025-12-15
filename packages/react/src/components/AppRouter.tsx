/**
 * AppRouter Component - Renders the active screen
 *
 * React Layer: L3
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useHAI3 } from '../HAI3Context';
import { useNavigation } from '../hooks/useNavigation';
import type { AppRouterProps } from '../types';

/**
 * AppRouter Component
 *
 * Renders the currently active screen based on navigation state.
 * Handles lazy loading and error boundaries.
 *
 * @example
 * ```tsx
 * <HAI3Provider>
 *   <Layout>
 *     <AppRouter
 *       fallback={<LoadingSpinner />}
 *       errorFallback={(error) => <ErrorPage error={error} />}
 *     />
 *   </Layout>
 * </HAI3Provider>
 * ```
 */
export const AppRouter: React.FC<AppRouterProps> = ({
  fallback = null,
  errorFallback,
}) => {
  const app = useHAI3();
  const { currentScreenset, currentScreen } = useNavigation();
  const [ScreenComponent, setScreenComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadScreen = async () => {
      if (!currentScreenset || !currentScreen) {
        setScreenComponent(null);
        return;
      }

      try {
        // Get screen loader from route registry
        const loader = app.routeRegistry.getScreen(currentScreenset, currentScreen);

        if (!loader) {
          throw new Error(
            `Screen "${currentScreen}" not found in screenset "${currentScreenset}".`
          );
        }

        // Load the screen component
        const module = await loader();

        if (!cancelled) {
          setScreenComponent(() => module.default);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setScreenComponent(null);
        }
      }
    };

    loadScreen();

    return () => {
      cancelled = true;
    };
  }, [currentScreenset, currentScreen, app.routeRegistry]);

  // Handle error state
  if (error) {
    if (errorFallback) {
      if (typeof errorFallback === 'function') {
        return <>{errorFallback(error)}</>;
      }
      return <>{errorFallback}</>;
    }
    // Default error display
    return (
      <div className="p-5 text-destructive">
        <h2>Error loading screen</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  // Handle loading state
  if (!ScreenComponent) {
    return <>{fallback}</>;
  }

  // Render the screen component
  return (
    <Suspense fallback={fallback}>
      <ScreenComponent />
    </Suspense>
  );
};

export default AppRouter;
