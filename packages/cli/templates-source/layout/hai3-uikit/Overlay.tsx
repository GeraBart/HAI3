/**
 * Overlay Component
 *
 * Full-screen overlay using @hai3/uikit components.
 */

import React from 'react';
import { Overlay as OverlayUI } from '@hai3/uikit';

export interface OverlayProps {
  children?: React.ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  // Access overlay state from Redux
  // const overlayState = useAppSelector(state => state['layout/overlay']);
  // const isVisible = overlayState?.isVisible ?? false;

  const isVisible = false; // Default to hidden

  if (!isVisible) {
    return null;
  }

  return (
    <OverlayUI>
      {children}
    </OverlayUI>
  );
};

Overlay.displayName = 'Overlay';
