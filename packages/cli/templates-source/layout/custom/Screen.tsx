/**
 * Screen Component
 *
 * Main content area that renders the current screen.
 * Replace with your preferred UI library implementation.
 */

import React from 'react';

export interface ScreenProps {
  children?: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="h-full p-6">
        {children}
      </div>
    </main>
  );
};

Screen.displayName = 'Screen';
