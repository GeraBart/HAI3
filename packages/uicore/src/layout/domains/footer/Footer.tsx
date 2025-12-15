import React from 'react';
import { useAppSelector } from '../../../hooks/useRedux';
import { uikitRegistry } from '../../../uikit/uikitRegistry';
import { UiKitComponent, ButtonVariant } from '@hai3/uikit';

/**
 * Core Footer component (production-ready)
 * All dev tools moved to @hai3/studio package
 */

export const Footer: React.FC = () => {
  const visible = useAppSelector((state) => state.uicore.footer.visible);

  // Production footer content
  const copyright = '© 2025 HAI3 Framework';
  const links = [
    { label: 'Documentation', href: '#docs' },
    { label: 'GitHub', href: '#github' },
  ];

  if (!visible) return null;

  const Button = uikitRegistry.getComponent(UiKitComponent.Button);

  return (
    <footer className="flex items-center justify-between px-6 py-3 bg-background border-t border-border h-12 w-full text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        {copyright && <span>{copyright}</span>}
        {links && (
          <nav className="flex gap-4">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={ButtonVariant.Link}
                asChild
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
