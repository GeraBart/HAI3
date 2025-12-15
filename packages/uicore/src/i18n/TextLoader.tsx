import React, { type ReactNode } from 'react';
import { useTranslation } from './useTranslation';
import { uikitRegistry } from '../uikit/uikitRegistry';
import { UiKitComponent } from '@hai3/uikit';

export interface TextLoaderProps {
  /**
   * Text content to display when translations are ready
   */
  children: ReactNode;

  /**
   * Optional className for the skeleton loader
   * Use this to match the expected size of the text
   * @example "h-8 w-48" for a heading
   * @example "h-4 w-32" for a button label
   */
  skeletonClassName?: string;

  /**
   * Optional className for the wrapper div
   */
  className?: string;

  /**
   * If true, skeleton inherits the text color instead of using bg-muted
   * Use this for buttons, menu items, and colored text
   * @default false
   */
  inheritColor?: boolean;
}

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
 * // Paragraph - default bg-muted skeleton
 * <TextLoader skeletonClassName="h-6 w-96">
 *   <p className="text-muted-foreground">{t('screen.description')}</p>
 * </TextLoader>
 *
 * // Button label - inherits button text color
 * <Button>
 *   <TextLoader skeletonClassName="h-4 w-24" inheritColor>
 *     {t('button.submit')}
 *   </TextLoader>
 * </Button>
 *
 * // Menu item - inherits menu text color
 * <TextLoader skeletonClassName="h-5 w-20" inheritColor>
 *   {translatedLabel}
 * </TextLoader>
 * ```
 */
export const TextLoader: React.FC<TextLoaderProps> = ({
  children,
  skeletonClassName,
  className,
  inheritColor = false,
}) => {
  const { translationsReady } = useTranslation();
  const Skeleton = uikitRegistry.getComponent(UiKitComponent.Skeleton);

  if (!translationsReady) {
    return <Skeleton className={skeletonClassName} inheritColor={inheritColor} />;
  }

  // If className is provided, wrap in div, otherwise return children directly
  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
};

TextLoader.displayName = 'TextLoader';
