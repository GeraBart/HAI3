# Proposal: Allow Inline Styles in Screenset UIKit Base Components

## Summary

Currently, inline styles (`style={{}}`) and hex colors are forbidden everywhere except `packages/uikit/src/base/`. This blocks screenset developers from creating custom base primitives in their local `screensets/*/uikit/base/` folders when the global uikit is missing needed components.

## Problem

Screensets may need custom UI primitives not available in global uikit:
- Specialized visualization components (gauges, charts)
- Animation primitives with CSS keyframes
- Domain-specific input controls

Without inline style support in screenset `uikit/base/`, standalone developers cannot create these primitives.

## Proposed Solution

### 1. Mirror Global UIKit Structure in Screensets

Screenset uikit folders should follow the same base/composite pattern as global uikit:

```
src/screensets/{name}/uikit/
  base/          # Rare - only when global uikit missing, needs justification
  composite/     # Screenset-specific composites (value/onChange pattern)
  icons/         # Screenset icons
```

### 2. Allow Inline Styles Only in Base Folders

Inline styles and hex colors allowed in:
- `packages/uikit/src/base/` (existing - global base primitives)
- `src/screensets/*/uikit/base/` (new - screenset base primitives)

NOT allowed in:
- `screensets/*/uikit/composite/` - must use theme tokens
- `screensets/*/uikit/icons/` - must use theme tokens
- `screensets/**/screens/` - must use theme tokens
- `screensets/*/components/` - must use theme tokens

### 3. Prioritize Global UIKit (AI Guidance)

AI agents MUST:
1. First check if global @hai3/uikit has needed component
2. Only create screenset uikit component if global is truly missing
3. Require strong justification for creating base components
4. Prefer composite over base when possible

## Affected Systems

1. **ESLint Plugin** (`presets/standalone/eslint-plugin-local/src/rules/no-inline-styles.ts`)
2. **CLI Validate Command** (`packages/cli/src/commands/validate/components.ts`)
3. **AI Guidelines** (`.ai/targets/SCREENSETS.md`, `.ai/targets/STYLING.md`, `.ai/targets/UIKIT.md`)
4. **AI Commands** (`.ai/commands/hai3-new-component.md`, `.ai/commands/hai3-validate.md`, etc.)

## Success Criteria

1. `npm run lint` passes when screenset `uikit/base/` components use inline styles
2. `npm run lint` fails when screenset `uikit/composite/` uses inline styles
3. AI guidelines correctly document global uikit prioritization
4. AI guidelines require justification for screenset base components
