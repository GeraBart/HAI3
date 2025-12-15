/**
 * TextLoader Component - Prevents flash of untranslated content
 *
 * React Layer: L3
 */

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { TextLoaderProps } from '../types';

/**
 * TextLoader Component
 *
 * Wraps content that uses translations to prevent flash of untranslated text.
 * Shows fallback (or nothing) while translations are loading.
 *
 * @example
 * ```tsx
 * <TextLoader fallback={<Skeleton />}>
 *   <h1>{t('screen.demo.home:title')}</h1>
 *   <p>{t('screen.demo.home:description')}</p>
 * </TextLoader>
 * ```
 */
export const TextLoader: React.FC<TextLoaderProps> = ({
  children,
  fallback = null,
}) => {
  const { language } = useTranslation();

  // If no language is set yet, show fallback
  if (!language) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default TextLoader;
