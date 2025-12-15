/**
 * Menu Component
 *
 * Navigation menu using @hai3/uikit components.
 */

import React from 'react';
import { Menu as MenuUI } from '@hai3/uikit';

export interface MenuProps {
  children?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  // Access menu state from Redux
  // const menuState = useAppSelector(state => state['layout/menu']);
  // const items = menuState?.items ?? [];

  return (
    <MenuUI>
      {children}
      {/* Menu items will be rendered here based on screenset configuration */}
    </MenuUI>
  );
};

Menu.displayName = 'Menu';
