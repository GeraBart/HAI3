/**
 * Header Component
 *
 * Header using @hai3/uikit components.
 */

import React from 'react';
import { Header as HeaderUI } from '@hai3/uikit';

export interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <HeaderUI>
      {children}
      {/* Add user info, settings, etc. here */}
    </HeaderUI>
  );
};

Header.displayName = 'Header';
