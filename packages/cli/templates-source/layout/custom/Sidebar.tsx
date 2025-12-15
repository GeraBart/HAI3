/**
 * Sidebar Component
 *
 * Placeholder sidebar component for contextual content.
 * Replace with your preferred UI library implementation.
 */

import React from 'react';

export interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  // Access sidebar state from Redux
  // const sidebarState = useAppSelector(state => state['layout/sidebar']);
  // const isCollapsed = sidebarState?.collapsed ?? false;

  const isCollapsed = false; // Default to visible

  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-72 border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Sidebar</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
        {/* Contextual content will be rendered here */}
        <p className="text-sm text-muted-foreground">
          Add contextual information, quick actions, or related content here.
        </p>
      </div>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
