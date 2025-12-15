/**
 * Menu Component
 *
 * Placeholder navigation menu component.
 * Replace with your preferred UI library implementation.
 */

import React from 'react';

export interface MenuProps {
  children?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  // Access menu state from Redux
  // const menuState = useAppSelector(state => state['layout/menu']);

  return (
    <nav className="w-64 border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        {/* Logo or brand */}
        <h2 className="font-bold text-lg">Navigation</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {children}
        {/* Menu items will be rendered here */}
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-foreground"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-foreground"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-foreground"
            >
              Settings
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

Menu.displayName = 'Menu';
