/**
 * HAI3 Context - React context for HAI3 application
 *
 * React Layer: L3 (Depends on @hai3/framework)
 */

import { createContext, useContext } from 'react';
import type { HAI3App } from '@hai3/framework';

// ============================================================================
// Context Definition
// ============================================================================

/**
 * HAI3 Context
 * Holds the HAI3 app instance for the application.
 */
export const HAI3Context = createContext<HAI3App | null>(null);

/**
 * Use the HAI3 context.
 * Throws if used outside of HAI3Provider.
 *
 * @returns The HAI3 app instance
 */
export function useHAI3(): HAI3App {
  const context = useContext(HAI3Context);

  if (!context) {
    throw new Error(
      'useHAI3 must be used within a HAI3Provider. ' +
      'Wrap your application with <HAI3Provider> to access HAI3 features.'
    );
  }

  return context;
}
