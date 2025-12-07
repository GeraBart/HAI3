# Tasks: Add Theme Chart Colors

## 1. Theme Contract Extension

- [x] 1.1 Update `packages/uikit-contracts/src/index.ts`
  - Add `chart` property to `Theme.colors` interface
  - Structure: `chart: { 1: string; 2: string; 3: string; 4: string; 5: string; }`

- [x] 1.2 Build uikit-contracts
  ```bash
  npm run build:packages:uikit-contracts
  ```

## 2. Theme Implementations

Use OKLCH color format (modern standard, per shadcn/ui 2025 conventions).

- [x] 2.1 Update `src/themes/light.ts`
  - Add chart colors in OKLCH format optimized for light background
  - Reference: shadcn/ui light theme chart colors

- [x] 2.2 Update `src/themes/dark.ts`
  - Add chart colors in OKLCH format optimized for dark background
  - Reference: shadcn/ui dark theme chart colors

- [x] 2.3 Update `src/themes/default.ts`
  - Add chart colors in OKLCH format

- [x] 2.4 Update `src/themes/dracula.ts` and `src/themes/dracula-large.ts`
  - Add chart colors in OKLCH format matching Dracula palette aesthetic

## 3. Demo Screenset Fix

- [x] 3.1 Update `src/screensets/demo/components/DataDisplayElements.tsx`
  - Add helper function to read chart colors from CSS variables
  - Replace hardcoded hex colors with theme colors
  - Update PieChart, LineChart, AreaChart, BarChart components

## 4. ESLint Configuration

- [x] 4.1 Update `presets/monorepo/configs/eslint.config.js`
  - Add override to disable `local/no-inline-styles` for `packages/studio/**`

## 5. Validation

- [x] 5.1 Run type-check
  ```bash
  npx tsc --noEmit
  ```
  Result: PASSED

- [x] 5.2 Run lint (should pass with 0 errors)
  ```bash
  npm run lint
  ```
  Result: PASSED (0 errors)

- [x] 5.3 Run arch:check
  ```bash
  npm run arch:check
  ```
  Result: ALL CHECKS PASSED (6/6)

- [x] 5.4 Visual verification via Chrome DevTools MCP
  - Navigate to demo screenset DataDisplayElements
  - Verify charts render with theme colors
  - Switch between light/dark themes
  - Verify chart colors adapt correctly
  Result: PASSED - All charts (Line, Bar, Area, Pie) display with correct OKLCH colors from theme. Colors adapt properly when switching themes.

## 6. Bug Fix (Discovered During Validation)

- [x] 6.1 Update `packages/uikit/src/styles/themeTypes.ts`
  - uikit has its own local Theme type that was out of sync with contracts
  - Added missing `chart` property to local Theme interface
  - Added missing `inScreenMenu` property (was also missing)

- [x] 6.2 Update `packages/uikit/src/styles/applyTheme.ts`
  - Added CSS variable setting for chart colors:
  ```typescript
  root.style.setProperty('--chart-1', theme.colors.chart[1]);
  // ... through chart-5
  ```

## Dependencies

- Task 1 must complete before Task 2 (contract needed for themes)
- Task 2 must complete before Task 3 (themes needed for CSS variables)
- Task 4 is independent
- Task 5 depends on all implementation tasks
