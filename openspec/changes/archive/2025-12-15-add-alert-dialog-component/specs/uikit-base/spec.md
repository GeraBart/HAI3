## ADDED Requirements

### Requirement: Alert Dialog Component

The UI kit SHALL provide `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, and `AlertDialogCancel` components built on `@radix-ui/react-alert-dialog` for displaying modal dialogs that require user acknowledgment or confirmation.

#### Scenario: Alert Dialog component is available

- **WHEN** importing AlertDialog from `@hai3/uikit`
- **THEN** all Alert Dialog components are available: AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel
- **AND** components support all standard Radix alert dialog props

#### Scenario: Alert Dialog root and trigger

- **WHEN** using AlertDialog with AlertDialogTrigger
- **THEN** clicking the trigger opens the alert dialog
- **AND** the dialog is rendered in a portal above the page content
- **AND** AlertDialog has data-slot="alert-dialog" attribute

#### Scenario: Alert Dialog overlay

- **WHEN** AlertDialogContent is rendered
- **THEN** AlertDialogOverlay displays with semi-transparent black background (bg-black/50)
- **AND** the overlay is fixed to cover the entire viewport (inset-0, z-50)
- **AND** the overlay has fade-in/fade-out animations on open/close
- **AND** AlertDialogOverlay has data-slot="alert-dialog-overlay" attribute

#### Scenario: Alert Dialog content positioning and styling

- **WHEN** AlertDialogContent is rendered
- **THEN** content is fixed-positioned and centered (top-50%, left-50%, translate-x/y -50%)
- **AND** content has bg-background, rounded-lg border, and shadow-lg styling
- **AND** content uses z-50 and grid layout with gap-4 and p-6 padding
- **AND** content has max-width constraints (max-w-lg on sm, max-w-[calc(100%-2rem)] otherwise)
- **AND** content has zoom-in/zoom-out and fade animations on open/close
- **AND** AlertDialogContent has data-slot="alert-dialog-content" attribute

#### Scenario: Alert Dialog header and footer layout

- **WHEN** using AlertDialogHeader component
- **THEN** header displays with flex-col layout and gap-2
- **AND** text is center-aligned by default, left-aligned on sm breakpoint
- **AND** AlertDialogHeader has data-slot="alert-dialog-header" attribute
- **WHEN** using AlertDialogFooter component
- **THEN** footer displays with flex-col-reverse layout by default
- **AND** footer changes to flex-row with justify-end and gap-2 on sm breakpoint
- **AND** AlertDialogFooter has data-slot="alert-dialog-footer" attribute

#### Scenario: Alert Dialog title and description

- **WHEN** using AlertDialogTitle component
- **THEN** title displays with text-lg and font-semibold styling
- **AND** AlertDialogTitle has data-slot="alert-dialog-title" attribute
- **WHEN** using AlertDialogDescription component
- **THEN** description displays with text-muted-foreground and text-sm styling
- **AND** AlertDialogDescription has data-slot="alert-dialog-description" attribute

#### Scenario: Alert Dialog action and cancel buttons

- **WHEN** using AlertDialogAction component
- **THEN** action button uses default button variant styling (from buttonVariants)
- **AND** clicking action closes the dialog
- **WHEN** using AlertDialogCancel component
- **THEN** cancel button uses outline button variant styling
- **AND** clicking cancel closes the dialog without action

#### Scenario: Alert Dialog accessibility

- **WHEN** AlertDialog is open
- **THEN** focus is trapped within the dialog content
- **AND** pressing Escape does NOT close the dialog (unlike regular Dialog)
- **AND** clicking outside does NOT close the dialog (unlike regular Dialog)
- **AND** proper ARIA attributes are applied for screen readers

### Requirement: Alert Dialog Demo Examples

The UI kit demo SHALL provide examples for the Alert Dialog component in the Feedback & Status category demonstrating:
- Basic alert dialog with trigger button, title, description, and action/cancel buttons
- Destructive action alert dialog for confirming dangerous operations

#### Scenario: Alert Dialog section in FeedbackElements

- **WHEN** viewing the Feedback & Status category in UIKitElementsScreen
- **THEN** an Alert Dialog section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-alert-dialog"` for navigation

#### Scenario: Alert Dialog examples use translations

- **WHEN** Alert Dialog examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Basic alert dialog example

- **WHEN** viewing the Alert Dialog section
- **THEN** a basic example shows a trigger button labeled "Show Dialog"
- **AND** clicking trigger opens dialog with title and description
- **AND** dialog has Cancel and Continue action buttons

#### Scenario: Destructive alert dialog example

- **WHEN** viewing the Alert Dialog section
- **THEN** a destructive example shows a trigger button for delete action
- **AND** clicking trigger opens dialog warning about permanent deletion
- **AND** dialog has Cancel and destructive-styled Delete action button

### Requirement: Alert Dialog in Category System

The UI kit element registry SHALL include 'Alert Dialog' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Feedback & Status category.

#### Scenario: Category Menu Shows Alert Dialog

- **WHEN** viewing the UIKit category menu
- **THEN** Alert Dialog appears as an implemented element in Feedback & Status category
- **AND** Alert Dialog is positioned alphabetically among other feedback elements

### Requirement: Alert Dialog Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `alert_dialog_heading` - Section heading
- `alert_dialog_show` - Show dialog trigger button text
- `alert_dialog_title` - Basic dialog title
- `alert_dialog_description` - Basic dialog description
- `alert_dialog_cancel` - Cancel button text
- `alert_dialog_continue` - Continue action button text
- `alert_dialog_delete_trigger` - Delete trigger button text
- `alert_dialog_delete_title` - Delete confirmation dialog title
- `alert_dialog_delete_description` - Delete confirmation description
- `alert_dialog_delete_action` - Delete action button text

#### Scenario: Translated Alert Dialog Labels

- **WHEN** viewing the Alert Dialog demo in a non-English language
- **THEN** all Alert Dialog text displays in the selected language
- **AND** translations are contextually appropriate for confirmation dialogs
