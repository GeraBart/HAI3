# Form Component Design

## Architecture Overview

The Form component follows the shadcn/ui pattern of composable form primitives that integrate with `react-hook-form`.

```
Form (FormProvider)
└── form element
    └── FormField (Controller + context)
        └── FormItem (ID context)
            ├── FormLabel (with error styling)
            ├── FormControl (Slot with aria)
            ├── FormDescription (help text)
            └── FormMessage (error display)
```

## Component Responsibilities

### Form
Re-export of `FormProvider` from react-hook-form. Provides form context to all descendants.

### FormField
Wraps `Controller` from react-hook-form and provides field name context via `FormFieldContext`.

### FormItem
Container that generates a unique ID via `React.useId()` and provides it via `FormItemContext`.

### FormLabel
Extends `Label` component with:
- `htmlFor` pointing to `formItemId`
- `data-error` attribute for error state styling
- Destructive text color when field has error

### FormControl
Uses `@radix-ui/react-slot` to:
- Set `id` to `formItemId`
- Set `aria-describedby` to description and/or message IDs
- Set `aria-invalid` when field has error

### FormDescription
Help text with:
- `id` set to `formDescriptionId`
- Muted foreground styling

### FormMessage
Error display with:
- `id` set to `formMessageId`
- Destructive text color
- Falls back to `children` if no error

## Context Structure

```typescript
// Field name context
FormFieldContext = { name: TName }

// Item ID context
FormItemContext = { id: string }
```

## ID Generation Pattern

Each `FormItem` generates IDs using the pattern:
- `{id}-form-item` - for the control element
- `{id}-form-item-description` - for description
- `{id}-form-item-message` - for error message

## Relationship to Field Components

The Form components and Field components serve different purposes:

| Aspect | Form Components | Field Components |
|--------|----------------|------------------|
| Purpose | Form state & validation | Layout & styling |
| State | react-hook-form controlled | Uncontrolled |
| Validation | Schema-based (zod, etc.) | Manual |
| Use Case | Complex forms with validation | Simple inputs, toggles |

They can be used together when needed:
```tsx
<FormField>
  <FieldGroup>
    <FormItem>
      <FormLabel>...</FormLabel>
      <FormControl><Input /></FormControl>
    </FormItem>
  </FieldGroup>
</FormField>
```

## File Location

`packages/uikit/src/composite/forms/form.tsx`

Follows the existing composite forms structure alongside:
- `field.tsx`
- `input-group.tsx`
- `date-picker.tsx`
