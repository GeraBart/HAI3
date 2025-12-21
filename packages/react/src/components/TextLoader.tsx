/**
 * TextLoader Component - Prevents flash of untranslated content
 *
 * React Layer: L3
 */

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { uikitRegistry } from '../uikitRegistry';
import { UiKitComponent } from '@hai3/uikit';
import type { TextLoaderProps } from '../types';

/**
 * TextLoader Component
 *
 * Generic wrapper for translated text that automatically shows a skeleton loader
 * while translations are being loaded. This eliminates the need for manual
 * loading state checks throughout the application.
 *
 * @example
 * ```tsx
 * // Heading - default bg-muted skeleton
 * <TextLoader skeletonClassName="h-10 w-64">
 *   <h1 className="text-4xl font-bold">{t('screen.title')}</h1>
 * </TextLoader>
 *
 * // Button label - inherits button text color
 * <Button>
 *   <TextLoader skeletonClassName="h-4 w-24" inheritColor>
 *     {t('button.submit')}
 *   </TextLoader>
 * </Button>
 * ```
 */
export const TextLoader: React.FC<TextLoaderProps> = ({
  children,
  fallback,
  skeletonClassName,
  className,
  inheritColor = false,
}) => {
  const { language } = useTranslation();

  // If no language is set yet, show loading state
  if (!language) {
    // If fallback provided, use it
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    // Otherwise, use skeleton (backward compat with uicore)
    if (skeletonClassName && uikitRegistry.hasComponent(UiKitComponent.Skeleton)) {
      const Skeleton = uikitRegistry.getComponent(UiKitComponent.Skeleton);
      return <Skeleton className={skeletonClassName} inheritColor={inheritColor} />;
    }

    // Default: return nothing
    return null;
  }

  // If className is provided, wrap in div, otherwise return children directly
  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
};

export default TextLoader;
