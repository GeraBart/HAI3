# Change: Add Theme Chart Colors

## Why

Charts currently use hardcoded hex colors that don't adapt to theme changes (light/dark mode). The ESLint `no-inline-styles` rule correctly flags these as violations, but existing semantic colors (`success`, `error`, `warning`, `info`) are insufficient for charts because:

1. **Limited palette** - Only 4 distinct colors; `primary`, `secondary`, `accent` are gray tones
2. **Semantic overload** - Using `error` (red) for neutral data implies something is wrong
3. **Insufficient variety** - Charts often need 5+ distinct colors for data series

## What Changes

### Theme Contract Extension
- Add `chart` color palette to the `Theme` interface in `@hai3/uikit-contracts`
- Provide 5 semantically-neutral colors optimized for data visualization
- Use OKLCH color format (modern standard, better perceptual uniformity)

### Theme Implementations
- Add chart colors to all existing themes (dark, light, dracula, default)
- Colors designed for optimal contrast on each theme's background
- Use OKLCH format matching shadcn/ui 2025 conventions
- themeRegistry already applies theme colors as CSS variables to `:root`

### Demo Screenset Fix
- Update `DataDisplayElements.tsx` to read chart colors from CSS variables
- `getComputedStyle()` resolves OKLCH to RGB automatically for Recharts

### ESLint Configuration
- Exclude `packages/studio/` from `no-inline-styles` rule (dev-only package with intentional inline styles)

## Impact

- Affected specs: `uikit-base` (chart theming requirement)
- Affected packages: `@hai3/uikit-contracts`
- Affected themes: All 4 themes in `src/themes/`
- Affected screensets: `demo` (DataDisplayElements fix)
- No **BREAKING** changes - additive only
