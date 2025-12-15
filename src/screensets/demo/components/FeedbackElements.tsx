import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  ButtonVariant,
  Progress,
  Skeleton,
  Spinner,
} from '@hai3/uikit';
import { useTranslation, TextLoader } from '@hai3/uicore';
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from 'lucide-react';
import { LoaderIcon } from '../uikit/icons/LoaderIcon';
import { DEMO_SCREENSET_ID } from "../ids";
import { UI_KIT_ELEMENTS_SCREEN_ID } from "../ids";

/**
 * Feedback Elements Component
 * Contains Alert, Progress, Spinner, and Skeleton demonstrations
 * Uses parent screen (UIKitElementsScreen) translations
 */
export const FeedbackElements: React.FC = () => {
  const { t } = useTranslation();

  // Helper function to access parent screen's translations
  const tk = (key: string) => t(`screen.${DEMO_SCREENSET_ID}.${UI_KIT_ELEMENTS_SCREEN_ID}:${key}`);

  const [progressValue, setProgressValue] = useState(33);

  return (
    <>
      {/* Alert Element Block */}
      <div data-element-id="element-alert" className="flex flex-col gap-4">
        <TextLoader skeletonClassName="h-8 w-24">
          <h2 className="text-2xl font-semibold">
            {tk('alert_heading')}
          </h2>
        </TextLoader>
        <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background overflow-hidden">
          <div className="grid w-full max-w-xl items-start gap-4">
            {/* Success Alert with icon, title, and description */}
            <Alert>
              <CheckCircle2Icon />
              <AlertTitle>
                <TextLoader skeletonClassName="h-4 w-64" inheritColor>
                  {tk('alert_success_title')}
                </TextLoader>
              </AlertTitle>
              <AlertDescription>
                <TextLoader skeletonClassName="h-4 w-80">
                  {tk('alert_success_description')}
                </TextLoader>
              </AlertDescription>
            </Alert>

            {/* Info Alert with icon and title only */}
            <Alert>
              <PopcornIcon />
              <AlertTitle>
                <TextLoader skeletonClassName="h-4 w-72" inheritColor>
                  {tk('alert_info_title')}
                </TextLoader>
              </AlertTitle>
            </Alert>

            {/* Destructive Alert with icon, title, description, and list */}
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>
                <TextLoader skeletonClassName="h-4 w-56" inheritColor>
                  {tk('alert_error_title')}
                </TextLoader>
              </AlertTitle>
              <AlertDescription>
                <TextLoader skeletonClassName="h-4 w-72" inheritColor>
                  <p>{tk('alert_error_description')}</p>
                </TextLoader>
                <ul className="list-inside list-disc text-sm">
                  <li>
                    <TextLoader skeletonClassName="h-3.5 w-32 inline-block" inheritColor>
                      {tk('alert_error_check_card')}
                    </TextLoader>
                  </li>
                  <li>
                    <TextLoader skeletonClassName="h-3.5 w-36 inline-block" inheritColor>
                      {tk('alert_error_ensure_funds')}
                    </TextLoader>
                  </li>
                  <li>
                    <TextLoader skeletonClassName="h-3.5 w-32 inline-block" inheritColor>
                      {tk('alert_error_verify_address')}
                    </TextLoader>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Alert Dialog Element Block */}
      <div data-element-id="element-alert-dialog" className="flex flex-col gap-4">
        <TextLoader skeletonClassName="h-8 w-32">
          <h2 className="text-2xl font-semibold">
            {tk('alert_dialog_heading')}
          </h2>
        </TextLoader>
        <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Basic Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={ButtonVariant.Outline}>
                  <TextLoader skeletonClassName="h-4 w-20" inheritColor>
                    {tk('alert_dialog_show')}
                  </TextLoader>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <TextLoader skeletonClassName="h-5 w-48" inheritColor>
                      {tk('alert_dialog_title')}
                    </TextLoader>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <TextLoader skeletonClassName="h-4 w-72">
                      {tk('alert_dialog_description')}
                    </TextLoader>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <TextLoader skeletonClassName="h-4 w-14" inheritColor>
                      {tk('alert_dialog_cancel')}
                    </TextLoader>
                  </AlertDialogCancel>
                  <AlertDialogAction>
                    <TextLoader skeletonClassName="h-4 w-16" inheritColor>
                      {tk('alert_dialog_continue')}
                    </TextLoader>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Destructive Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={ButtonVariant.Destructive}>
                  <TextLoader skeletonClassName="h-4 w-28" inheritColor>
                    {tk('alert_dialog_delete_trigger')}
                  </TextLoader>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <TextLoader skeletonClassName="h-5 w-48" inheritColor>
                      {tk('alert_dialog_delete_title')}
                    </TextLoader>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <TextLoader skeletonClassName="h-4 w-80">
                      {tk('alert_dialog_delete_description')}
                    </TextLoader>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <TextLoader skeletonClassName="h-4 w-14" inheritColor>
                      {tk('alert_dialog_cancel')}
                    </TextLoader>
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <TextLoader skeletonClassName="h-4 w-14" inheritColor>
                      {tk('alert_dialog_delete_action')}
                    </TextLoader>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Progress Element Block */}
      <div data-element-id="element-progress" className="flex flex-col gap-4">
        <TextLoader skeletonClassName="h-8 w-24">
          <h2 className="text-2xl font-semibold">
            {tk('progress_heading')}
          </h2>
        </TextLoader>
        <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background overflow-hidden">
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div className="flex flex-col gap-2">
              <TextLoader skeletonClassName="h-5 w-32" inheritColor>
                <label className="text-sm font-medium">
                  {tk('progress_primary_label')}
                </label>
              </TextLoader>
              <Progress value={progressValue} className="bg-primary/20" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressValue}%</span>
                <TextLoader skeletonClassName="h-3.5 w-14" inheritColor>
                  <button
                    onClick={() => setProgressValue((prev) => Math.min(100, prev + 10))}
                    className="text-primary hover:underline"
                  >
                    {tk('progress_increase')}
                  </button>
                </TextLoader>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <TextLoader skeletonClassName="h-4 w-36" inheritColor>
                <label className="text-sm font-medium">
                  {tk('progress_destructive_label')}
                </label>
              </TextLoader>
              <Progress
                value={progressValue}
                className="bg-destructive/20 [&>div]:bg-destructive"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressValue}%</span>
                <TextLoader skeletonClassName="h-3.5 w-14" inheritColor>
                  <button
                    onClick={() => setProgressValue((prev) => Math.max(0, prev - 10))}
                    className="text-destructive hover:underline"
                  >
                    {tk('progress_decrease')}
                  </button>
                </TextLoader>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spinner Element Block */}
      <div data-element-id="element-spinner" className="flex flex-col gap-4">
        <TextLoader skeletonClassName="h-8 w-24">
          <h2 className="text-2xl font-semibold">
            {tk('spinner_heading')}
          </h2>
        </TextLoader>
        <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Different sizes */}
            <Spinner size="size-4" className="text-primary" />
            <Spinner size="size-6" className="text-primary" />
            <Spinner size="size-8" className="text-primary" />
            <Spinner size="size-12" className="text-primary" />

            {/* Different colors */}
            <Spinner icon={LoaderIcon} size="size-6" className="text-primary" />
            <Spinner icon={LoaderIcon} size="size-6" className="text-destructive" />
            <Spinner icon={LoaderIcon} size="size-6" className="text-muted-foreground" />

            {/* Different colors */}
            <Spinner size="size-6" className="text-green-500" />
            <Spinner size="size-6" className="text-purple-500" />
            <Spinner size="size-6" className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Skeleton Element Block */}
      <div data-element-id="element-skeleton" className="flex flex-col gap-4">
        <TextLoader skeletonClassName="h-8 w-24">
          <h2 className="text-2xl font-semibold">
            {tk('skeleton_heading')}
          </h2>
        </TextLoader>
        <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background overflow-hidden">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

FeedbackElements.displayName = 'FeedbackElements';
