# Implementation Tasks

## 1. Type Definitions
- [ ] 1.1 Extend `RouterConfig` type in HAI3Provider.tsx with optional `autoNavigate?: boolean` field
- [ ] 1.2 Add JSDoc comment explaining the option and default behavior

## 2. Router Logic
- [ ] 2.1 Add `autoNavigate` prop to `AppRouterProps` interface
- [ ] 2.2 Set default value `autoNavigate = true` in AppRouter component
- [ ] 2.3 Implement conditional routing logic for root path "/"
- [ ] 2.4 When `autoNavigate=true`: Navigate to first screen (preserve current behavior)
- [ ] 2.5 When `autoNavigate=false`: Render RouterSync + Layout without redirect
- [ ] 2.6 Update route comment to reflect new behavior

## 3. Provider Integration
- [ ] 3.1 Pass `autoNavigate` prop from HAI3Provider to AppRouter
- [ ] 3.2 Access via `router?.autoNavigate` to handle undefined router config

## 4. Documentation
- [ ] 4.1 Update main.tsx with example showing `autoNavigate: false` usage
- [ ] 4.2 Add inline comment explaining the two modes
- [ ] 4.3 Document external navigation control use case

## 5. Validation
- [ ] 5.1 Verify TypeScript compilation passes
- [ ] 5.2 Test with `autoNavigate: true` - should redirect to first screen
- [ ] 5.3 Test with `autoNavigate: false` - should stay on "/" and wait
- [ ] 5.4 Test programmatic `navigateToScreen()` after manual mode
- [ ] 5.5 Verify URL sync works in both modes
