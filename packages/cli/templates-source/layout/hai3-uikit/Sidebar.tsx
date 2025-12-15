/**
 * Sidebar Component
 *
 * Sidebar using @hai3/uikit components.
 */

import React from 'react';
import { Sidebar as SidebarUI } from '@hai3/uikit';

export interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  // Access sidebar state from Redux
  // const sidebarState = useAppSelector(state => state['layout/sidebar']);
  // const isCollapsed = sidebarState?.collapsed ?? false;

  return (
    <SidebarUI>
      {children}
      {/* Contextual content will be rendered here */}
    </SidebarUI>
  );
};

Sidebar.displayName = 'Sidebar';
