/**
 * Popup Component
 *
 * Modal/dialog component for popups.
 * Replace with your preferred UI library implementation (e.g., shadcn Dialog).
 */

import React from 'react';

export interface PopupProps {
  children?: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ children }) => {
  // Access popup state from Redux
  // const popupState = useAppSelector(state => state['layout/popup']);
  // const isOpen = popupState?.isOpen ?? false;
  // const title = popupState?.title ?? '';
  // const content = popupState?.content ?? null;

  const isOpen = false; // Default to closed

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div className="relative bg-background rounded-lg shadow-lg max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Popup Title</h2>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div>
          {children}
          {/* Popup content will be rendered here */}
        </div>
      </div>
    </div>
  );
};

Popup.displayName = 'Popup';
