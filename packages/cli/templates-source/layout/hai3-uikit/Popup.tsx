/**
 * Popup Component
 *
 * Modal/dialog using @hai3/uikit components.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@hai3/uikit';

export interface PopupProps {
  children?: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ children }) => {
  // Access popup state from Redux
  // const popupState = useAppSelector(state => state['layout/popup']);
  // const isOpen = popupState?.isOpen ?? false;
  // const title = popupState?.title ?? '';

  const isOpen = false; // Default to closed

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Popup</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

Popup.displayName = 'Popup';
