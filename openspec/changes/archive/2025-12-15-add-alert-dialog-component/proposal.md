# Change: Add Alert Dialog Base UI Kit Component

## Why

The UI Kit needs an Alert Dialog component for displaying modal dialogs that require user acknowledgment or confirmation before proceeding. Alert Dialog differs from Dialog in that it interrupts user workflow with important content requiring explicit action, and blocks interaction with the rest of the page until resolved.

## What Changes

- Add `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, and `AlertDialogCancel` components to `@hai3/uikit` package
- Export all AlertDialog components from `packages/uikit/src/index.ts`
- Add Alert Dialog demo examples to the Feedback & Status category in FeedbackElements
- Add 'Alert Dialog' to the IMPLEMENTED_ELEMENTS array in uikitCategories.ts
- Add Alert Dialog translation keys to all 36 supported language files

## Impact

- Affected specs: `uikit-base`
- Affected code:
  - `packages/uikit/src/base/alert-dialog.tsx` (new file)
  - `packages/uikit/src/index.ts` (exports)
  - `src/screensets/demo/components/FeedbackElements.tsx` (demo examples)
  - `src/screensets/demo/screens/uikit/uikitCategories.ts` (implemented elements)
  - `src/screensets/demo/screens/uikit/i18n/*.json` (36 translation files)
