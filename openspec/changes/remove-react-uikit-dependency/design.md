# Design: Clean @hai3/react Layer Dependencies

## Context

The `@hai3/react` package (L3) currently has two layer architecture violations:

### Violation 1: @hai3/uikit dependency

1. **uikitRegistry.ts** - A singleton registry for UI components and icons that imports types from `@hai3/uikit`
2. **TextLoader.tsx** - A component that uses uikitRegistry to show Skeleton during translation loading
3. **Re-exports** in index.ts for `UiKitComponent`, `UiKitIcon`, `UiKitComponentMap`, `ComponentName` from `@hai3/uikit`
4. **peerDependency** on `@hai3/uikit` in package.json

### Violation 2: @hai3/i18n dependency

1. **peerDependency** on `@hai3/i18n` in package.json
2. **Direct re-exports** from `@hai3/i18n` in index.ts:
   ```typescript
   export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n';
   ```

According to sdk-core spec, L3 (@hai3/react) should ONLY depend on L2 (@hai3/framework). Direct dependencies on L1 packages (@hai3/i18n) violate layer architecture.

## Architectural Evolution

The uikitRegistry was created when `@hai3/uicore` was the main rendering layer. The pattern was:

1. SDK packages define interfaces and registries
2. `@hai3/uicore` registers components at runtime
3. SDK packages can request components from the registry

**This architecture is now obsolete.** With the move to CLI scaffolding:

1. `@hai3/uicore` is deprecated
2. Rendering happens in L4 (user's project), not in SDK packages
3. SDK packages (`@hai3/react`) should NOT know about UI components
4. Users choose their own UI kit and integrate it in their own code

## Layer Architecture Reference

From sdk-core spec.md:

- **L3 (React Adapter Layer)**: @hai3/react provides hooks and providers, NO layout components
- **L4 (CLI-Generated Layout)**: User's project, scaffolded by CLI, owns layout and UI components

The spec explicitly states:
- "React has NO layout components" - TextLoader is a presentation component
- "layout rendering is provided via CLI scaffolding" - TextLoader belongs here
- CLI templates at `packages/cli/templates/` already contain `uikitRegistry.tsx`

## Goals

- DELETE uikitRegistry entirely from `@hai3/react`
- MOVE TextLoader component to CLI templates (L4)
- REMOVE all `@hai3/uikit` imports and dependencies from @hai3/react
- REMOVE all `@hai3/i18n` direct imports and dependencies from @hai3/react
- UPDATE i18n type re-exports to use @hai3/framework as the source
- Keep `@hai3/react` focused on state management and hooks
- Ensure @hai3/react only depends on @hai3/framework (L2)

## Non-Goals

- Providing migration utilities or deprecation warnings (alpha stage)
- Maintaining backward compatibility
- Moving uikitRegistry elsewhere (it's obsolete in SDK, L4 already has its own)
- Modifying @hai3/framework re-exports (they already include needed i18n types)

## Decisions

### Decision 1: Delete uikitRegistry from @hai3/react

**What**: Remove `packages/react/src/uikitRegistry.ts` completely.

**Why**:
- The registry pattern was designed for `@hai3/uicore` to register components
- `@hai3/uicore` is deprecated
- No SDK package should render UI - that's L4's job
- L4 already has its own uikitRegistry at `src/app/uikit/uikitRegistry.tsx`

**Alternatives rejected**:
1. **Move types locally**: Would preserve the pattern that shouldn't exist in SDK layer
2. **Move to @hai3/framework**: Framework layer should also not know about UI components
3. **Create @hai3/uikit-registry package**: Adds complexity; L4 already has this

### Decision 2: Move TextLoader to CLI Templates

**What**: Move `packages/react/src/components/TextLoader.tsx` to `packages/cli/templates/src/app/components/TextLoader.tsx`

**Why**:
- TextLoader is still useful functionality - it prevents flash of untranslated content
- But it's a presentation component that uses Skeleton from @hai3/uikit
- Per sdk-core spec, presentation components belong in L4 (user's project)
- New projects get it automatically via CLI scaffolding
- Existing projects can copy it manually if needed

**Component adaptation for L4**:

NOTE: The L4 version imports Skeleton directly from `@hai3/uikit` without any `uikitRegistry.hasComponent()` safety check. This is intentional because:
1. The CLI template guarantees `@hai3/uikit` is installed in the user's project
2. Direct imports provide better tree-shaking and type safety
3. There is no need for runtime component discovery in L4 - the user controls their dependencies

```tsx
// packages/cli/templates/src/app/components/TextLoader.tsx
import { useTranslation } from '@hai3/react';
import { Skeleton } from '@hai3/uikit';  // Direct import, no registry lookup needed

export interface TextLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonClassName?: string;
  className?: string;
  inheritColor?: boolean;
}

export const TextLoader: React.FC<TextLoaderProps> = ({
  children,
  fallback,
  skeletonClassName,
  className,
  inheritColor = false,
}) => {
  const { language } = useTranslation();

  if (!language) {
    if (fallback !== undefined) return <>{fallback}</>;
    if (skeletonClassName) {
      return <Skeleton className={skeletonClassName} inheritColor={inheritColor} />;
    }
    return null;
  }

  if (className) return <div className={className}>{children}</div>;
  return <>{children}</>;
};
```

### Decision 3: No Deprecation Period

**What**: Relocate immediately without deprecation warnings.

**Why**:
- This is alpha stage software (`0.2.0-alpha.1`)
- Breaking changes are expected and acceptable
- Deprecation warnings add code complexity
- Clean relocation is simpler and cleaner

### Decision 4: Fix @hai3/i18n imports via @hai3/framework

**What**: Update @hai3/react to import i18n types from @hai3/framework instead of @hai3/i18n directly.

**Why**:
- sdk-core spec mandates L3 (@hai3/react) should only depend on L2 (@hai3/framework)
- Direct dependency on L1 (@hai3/i18n) violates layer architecture
- @hai3/framework already re-exports all needed i18n types:
  - `Language`, `TextDirection`, `LanguageDisplayMode` (line 280)
  - All i18n-related type definitions (line 281)

**What changes**:
```typescript
// Before (violates layer architecture):
export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n';

// After (correct layer access):
export { Language, TextDirection, LanguageDisplayMode } from '@hai3/framework';
```

**Package.json changes**:
- Remove `@hai3/i18n` from peerDependencies
- Remove `@hai3/i18n` from peerDependenciesMeta

**Why this is safe**:
- @hai3/framework already has @hai3/i18n as a dependency
- The types are identical (same source, just re-exported)
- No runtime behavior change - purely an import path fix

**Alternatives rejected**:
1. **Keep @hai3/i18n as optional peer**: Still violates layer architecture principle
2. **Duplicate type definitions**: Creates maintenance burden and potential drift

## Risks / Trade-offs

### Risk: Users Using uikitRegistry from @hai3/react
- **Risk**: Users who use `uikitRegistry.registerComponent()` will have broken code
- **Mitigation**: Alpha stage, breaking changes are expected. L4 has equivalent.
- **Impact**: Low - uikitRegistry was primarily for @hai3/uicore which is deprecated

### Risk: Users Using TextLoader from @hai3/react
- **Risk**: Users who use `<TextLoader>` from @hai3/react will have broken imports
- **Mitigation**: Component is moved, not deleted. Update import path.
- **Impact**: Medium - TextLoader is documented, but the fix is simple (change import)

### Risk: Existing Projects Missing TextLoader
- **Risk**: Projects created before this change won't have TextLoader in templates
- **Mitigation**: Document manual copy process, component is simple
- **Impact**: Low - existing projects can copy from templates or implement their own

## Data Flow

```
Before (L3 - Wrong):
@hai3/react (TextLoader) -> uikitRegistry -> @hai3/uikit (Skeleton)

After (L4 - Correct):
User's project (TextLoader) -> @hai3/uikit (Skeleton) directly
                            -> @hai3/react (useTranslation hook only)
```

## Implementation Plan

### Phase 1: Delete from @hai3/react

#### Step 1.1: Delete Files
1. Delete `packages/react/src/uikitRegistry.ts`
2. Delete `packages/react/src/components/TextLoader.tsx`

#### Step 1.2: Update Exports
1. Remove `uikitRegistry` export from `packages/react/src/index.ts`
2. Remove `TextLoader` export from `packages/react/src/components/index.ts`
3. Remove `TextLoader` export from `packages/react/src/index.ts`
4. Remove all `@hai3/uikit` re-exports from `packages/react/src/index.ts`
5. Remove `TextLoaderProps` and `TextLoaderComponent` from type exports in `packages/react/src/index.ts` (lines 62-66)
6. Update header comment in `packages/react/src/index.ts` (line 8) to remove TextLoader mention

#### Step 1.3: Update Types
1. Remove `TextLoaderProps` interface definition from types.ts (will be defined in template)
2. Remove `TextLoaderComponent` type definition from types.ts

#### Step 1.4: Update Package Config
1. Remove `@hai3/uikit` from peerDependencies in `package.json`
2. Remove `@hai3/uikit` from peerDependenciesMeta in `package.json`
3. Remove `@hai3/uikit` from externals in `tsup.config.ts` if present
4. Remove `@hai3/i18n` from peerDependencies in `package.json`
5. Remove `@hai3/i18n` from peerDependenciesMeta in `package.json`

#### Step 1.5: Fix i18n imports
1. Update `packages/react/src/index.ts` line 212:
   - Change: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n'`
   - To: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/framework'`

#### Step 1.6: Update Documentation
1. Update `CLAUDE.md` - note TextLoader moved to CLI templates
2. Remove "UI Kit Registry" references
3. Update Components section

### Phase 2: Add to CLI Templates

#### Step 2.1: Create TextLoader Component
1. Create `packages/cli/templates/src/app/components/TextLoader.tsx`
2. Adapt component to use direct @hai3/uikit imports (no registry)
3. Include TextLoaderProps interface inline

#### Step 2.2: Create Index Export
1. Create `packages/cli/templates/src/app/components/index.ts`
2. Export TextLoader component

### Phase 3: Validation

#### Step 3.1: Validate @hai3/react
1. Run `npm run type-check -w @hai3/react`
2. Run `npm run build -w @hai3/react`
3. Run `npm run arch:deps`
4. Verify no @hai3/uikit references remain
5. Verify no @hai3/i18n references remain
6. Verify i18n types are re-exported from @hai3/framework
7. Verify no other files in packages/react/src/ import from uikitRegistry.ts or TextLoader.tsx

#### Step 3.2: Validate CLI Templates
1. Verify TextLoader.tsx is valid TypeScript
2. Verify templates scaffold correctly

## Open Questions

1. **Q**: Should AppRouter also be deleted?
   **A**: No. AppRouter is about screen routing based on layout state, not UI rendering. It delegates actual rendering to user code via React.lazy.

2. **Q**: What about HAI3Provider?
   **A**: Keep it. HAI3Provider sets up Redux context and initializes the HAI3 app - this is legitimate L3 responsibility.

3. **Q**: Are there tests that need updating?
   **A**: Check for any tests that import uikitRegistry or TextLoader and remove/update them.

4. **Q**: Should TextLoader also be added to layout variants?
   **A**: No. TextLoader belongs in `src/app/components/`, not layout. It's an app-level utility component, not a layout component.
