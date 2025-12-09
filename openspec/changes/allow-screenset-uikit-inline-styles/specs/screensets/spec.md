# Screensets Spec Delta

## MODIFIED Requirements

### Requirement: Screenset UIKit structure mirrors global UIKit

Screensets with local uikit folders SHALL organize them with base/, composite/, and icons/ subfolders mirroring the global uikit structure.

#### Scenario: Screenset uikit folder structure

```
src/screensets/{name}/uikit/
  base/          # Rare - only when global uikit missing
  composite/     # Screenset-specific composites
  icons/         # Screenset icons
```

**Given** a screenset needing custom UI components
**When** determining uikit folder structure
**Then** the system SHALL follow the same base/composite/icons pattern as global uikit
**And** base/ components SHALL be rare and require strong justification
**And** composite/ components SHALL use value/onChange pattern

### Requirement: No inline styles outside base uikit folders

Components outside `packages/uikit/src/base/` and `screensets/*/uikit/base/` SHALL NOT use inline styles or hex colors.

#### Scenario: Screenset uikit base component with inline style (allowed)

```typescript
// src/screensets/dashboards/uikit/base/Gauge.tsx
// ✅ ALLOWED: Screenset uikit base component may use inline styles

export const Gauge: React.FC<{ value: number }> = ({ value }) => {
  const rotation = value * 180 / 100;
  return (
    <div className="relative w-32 h-16">
      <div style={{ transform: `rotate(${rotation}deg)` }} className="needle" />
    </div>
  );
};
```

**Given** a component in `screensets/*/uikit/base/` folder
**When** the component uses `style={{}}` JSX attribute
**Then** ESLint and CLI validation SHALL NOT report an error
**Because** screenset uikit base components are local primitives that need styling flexibility

#### Scenario: Screenset uikit composite with inline style (violation)

```typescript
// src/screensets/dashboards/uikit/composite/StatCard.tsx
// ❌ VIOLATION: Composite must use theme tokens

export const StatCard: React.FC<{ value: string }> = ({ value }) => {
  return <div style={{ padding: 16 }}>{value}</div>;  // FORBIDDEN
};
```

**Given** a component in `screensets/*/uikit/composite/` folder
**When** the component uses `style={{}}` JSX attribute
**Then** ESLint SHALL report error: `no-inline-styles`

#### Scenario: Screenset uikit icon with inline style (violation)

```typescript
// src/screensets/dashboards/uikit/icons/BadIcon.tsx
// ❌ VIOLATION: Icons must use theme tokens

export const BadIcon: React.FC = () => {
  return <svg style={{ fill: '#ff0000' }}>...</svg>;  // FORBIDDEN
};
```

**Given** a component in `screensets/*/uikit/icons/` folder
**When** the component uses `style={{}}` JSX attribute
**Then** ESLint SHALL report error: `no-inline-styles`

### Requirement: Prioritize global UIKit components

AI agents and developers SHALL prioritize using global @hai3/uikit components before creating screenset-local components.

#### Scenario: Component exists in global uikit

**Given** a UI requirement that matches an existing @hai3/uikit component
**When** AI agent determines component placement
**Then** the agent SHALL use the global @hai3/uikit component
**And** SHALL NOT create a duplicate in screenset uikit

#### Scenario: Creating screenset uikit base component

**Given** a UI requirement for a base primitive not in global @hai3/uikit
**When** AI agent proposes creating screenset uikit/base/ component
**Then** the proposal SHALL include justification explaining why global uikit is insufficient
**And** the justification SHALL explain why this cannot be a composite instead
