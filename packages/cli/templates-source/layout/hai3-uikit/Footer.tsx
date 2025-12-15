/**
 * Footer Component
 *
 * Footer using @hai3/uikit components.
 */

import React from 'react';
import { Footer as FooterUI } from '@hai3/uikit';

export interface FooterProps {
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({ children }) => {
  return (
    <FooterUI>
      {children}
      {/* Add copyright or status info here */}
    </FooterUI>
  );
};

Footer.displayName = 'Footer';
