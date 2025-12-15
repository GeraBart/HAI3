/**
 * Header Component
 *
 * Placeholder header component.
 * Replace with your preferred UI library implementation.
 */

import React from 'react';

export interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4">
      <div className="flex-1">
        {/* Add your logo or title here */}
        <span className="font-semibold">My App</span>
      </div>
      <div className="flex items-center gap-4">
        {children}
        {/* Add user info, settings, etc. here */}
      </div>
    </header>
  );
};

Header.displayName = 'Header';
