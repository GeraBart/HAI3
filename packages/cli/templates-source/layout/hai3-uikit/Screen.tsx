/**
 * Screen Component
 *
 * Main content area using @hai3/uikit components.
 */

import React from 'react';
import { Screen as ScreenUI } from '@hai3/uikit';

export interface ScreenProps {
  children?: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ children }) => {
  return (
    <ScreenUI>
      {children}
    </ScreenUI>
  );
};

Screen.displayName = 'Screen';
