/**
 * Overlay Component
 *
 * Full-screen overlay for loading states, modals, etc.
 * Replace with your preferred UI library implementation.
 */

import React from 'react';

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
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      {children}
      {/* Loading spinner or overlay content */}
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

Overlay.displayName = 'Overlay';
