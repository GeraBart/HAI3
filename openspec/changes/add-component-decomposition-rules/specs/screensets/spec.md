# screensets Specification Delta

## ADDED Requirements

### Requirement: Screen file complexity limits

Screen files SHALL NOT exceed complexity thresholds that indicate poor component architecture.

#### Scenario: Screen file exceeds line limit

```typescript
// src/screensets/dashboards/screens/home/HomeScreen.tsx
// ❌ 420 lines - exceeds 300 line maximum

export const HomeScreen: React.FC = () => {
  // ... 420 lines of inline components, data, and logic
};
```

**Given** a screen file with more than 300 lines
**When** ESLint analyzes the file
**Then** the system SHALL report error: `screen-file-complexity/tooManyLines`
**And** the message SHALL indicate the line count and maximum allowed

#### Scenario: Screen file has too many inline components

```typescript
// src/screensets/dashboards/screens/home/HomeScreen.tsx
// ❌ 5 inline component definitions - exceeds 2 maximum

const StatsCards: React.FC = () => { /* ... */ };      // 1
const RevenueChart: React.FC = () => { /* ... */ };    // 2
const TrafficChart: React.FC = () => { /* ... */ };    // 3 - VIOLATION
const DevicesChart: React.FC = () => { /* ... */ };    // 4 - VIOLATION
const ActivityCard: React.FC = () => { /* ... */ };    // 5 - VIOLATION

export const HomeScreen: React.FC = () => {
  return (
    <div>
      <StatsCards />
      <RevenueChart />
      {/* ... */}
    </div>
  );
};
```

**Given** a screen file with more than 2 inline `React.FC` component definitions
**When** ESLint analyzes the file
**Then** the system SHALL report error: `screen-file-complexity/tooManyInlineComponents`
**And** the message SHALL indicate the count and suggest extracting to `components/` folder

#### Scenario: Compliant screen file

```typescript
// src/screensets/demo/screens/uikit/UIKitElementsScreen.tsx
// ✅ 185 lines, 0 inline components

import { CategoryMenu } from './CategoryMenu';
import { DataDisplayElements } from '../../components/DataDisplayElements';
import { LayoutElements } from '../../components/LayoutElements';

export const UIKitElementsScreen: React.FC = () => {
  return (
    <div>
      <CategoryMenu /* ... */ />
      {renderCategoryElements()}
    </div>
  );
};
```

**Given** a screen file with 185 lines and no inline component definitions
**When** ESLint analyzes the file
**Then** the system SHALL NOT report any complexity errors

### Requirement: Component placement hierarchy

Screensets SHALL organize components in a three-tier hierarchy based on scope and reusability.

#### Scenario: Screen-local component placement

```
src/screensets/dashboards/
└── screens/
    └── home/
        ├── components/           # Screen-local components
        │   ├── RevenueChart.tsx  # Used only by HomeScreen
        │   ├── StatsCards.tsx
        │   └── ActivityList.tsx
        └── HomeScreen.tsx        # Imports from ./components/
```

**Given** a component used by only one screen in a screenset
**When** determining component placement
**Then** the component SHALL be placed in `screens/{screen}/components/`
**And** the component SHALL be imported using relative path `./components/Name`

#### Scenario: Screenset-wide component placement

```
src/screensets/demo/
├── components/                   # Screenset-wide components
│   ├── LayoutElements.tsx        # Used by multiple screens
│   ├── ActionElements.tsx
│   └── FeedbackElements.tsx
└── screens/
    ├── uikit/
    │   └── UIKitElementsScreen.tsx   # Imports from ../../components/
    └── profile/
        └── ProfileScreen.tsx         # Can also import from ../../components/
```

**Given** a component used by multiple screens in the same screenset
**When** determining component placement
**Then** the component SHALL be placed in `screensets/{name}/components/`
**And** the component SHALL be imported using relative path `../../components/Name`

#### Scenario: Presentational uikit component placement

```
src/screensets/demo/
└── uikit/
    ├── icons/
    │   └── WorldIcon.tsx
    └── ExpandableButton.tsx      # Reusable, no business logic
```

**Given** a presentational component with no business logic (no Redux, no API calls)
**When** determining component placement
**Then** the component MAY be placed in `screensets/{name}/uikit/`
**And** the component SHALL NOT import from `@hai3/uicore` (except types)
**And** the component SHALL accept `value`/`onChange` pattern for state

#### Scenario: Uikit component purity violation

```typescript
// src/screensets/demo/uikit/BadComponent.tsx
// ❌ Imports uicore hook - violates purity

import { useAppSelector } from '@hai3/uicore';  // VIOLATION

export const BadComponent: React.FC = () => {
  const state = useAppSelector(/* ... */);  // Business logic!
  return <div>{/* ... */}</div>;
};
```

**Given** a component in `screensets/*/uikit/` that imports from `@hai3/uicore`
**When** architecture tests analyze the file
**Then** the system SHALL report error: `uikit-component-purity`
**And** the message SHALL explain that uikit components must be presentational only

### Requirement: AI command complexity assessment

AI commands for creating screensets and screens SHALL assess complexity and plan component structure before generation.

#### Scenario: hai3-new-screenset gathers complexity information

```markdown
## GATHER REQUIREMENTS
Ask user for:
- Screenset name (camelCase)
- Category: Drafts | Mockups | Production
- Initial screens (list each)
- **For each screen, ask:**
  - Screen complexity: Simple | Medium | Complex
  - UI sections planned (stats, charts, lists, forms, etc.)
- State management needed? (Y/N)
- API services needed? (Y/N)
```

**Given** a user running `/hai3-new-screenset`
**When** gathering requirements
**Then** the AI SHALL ask about complexity level for each screen
**And** the AI SHALL ask about planned UI sections
**And** the proposal SHALL include a component plan

#### Scenario: hai3-new-screenset includes component plan in proposal

```markdown
## Component Plan

Based on complexity (Complex - 4+ UI sections):

### home screen
- [ ] Screen component: `screens/home/HomeScreen.tsx` (orchestration only, <150 lines)
- [ ] Local components:
  - `screens/home/components/StatsGrid.tsx` (stats cards display)
  - `screens/home/components/RevenueChart.tsx` (line chart)
  - `screens/home/components/TrafficChart.tsx` (pie chart)
  - `screens/home/components/ActivityList.tsx` (recent activity)
- [ ] Screenset-wide components: None planned
- [ ] Data files:
  - `screens/home/data/mockChartData.ts` (mock chart data)
```

**Given** a complex screen with 4+ planned UI sections
**When** creating the OpenSpec proposal
**Then** the proposal SHALL include a Component Plan section
**And** the plan SHALL list specific components to create
**And** the plan SHALL target screen file < 150 lines

#### Scenario: Simple screen skips decomposition

```markdown
## Component Plan

Based on complexity (Simple - single section):

### settings screen
- [ ] Screen component: `screens/settings/SettingsScreen.tsx`
- [ ] No additional components needed (< 100 lines expected)
```

**Given** a simple screen with a single UI section
**When** creating the OpenSpec proposal
**Then** the component plan MAY indicate no decomposition needed
**And** the screen file target MAY be up to 100 lines

### Requirement: Quick reference component patterns

The `hai3-quick-ref` command SHALL include component decomposition patterns for quick lookup.

#### Scenario: Component patterns in quick reference

```markdown
## Component Decomposition
- Screen > 200 lines -> SHOULD decompose
- Screen > 300 lines -> MUST decompose
- > 2 inline components -> MUST extract to components/
- Screen-local: `screens/{screen}/components/`
- Screenset-wide: `{screenset}/components/`
- Presentational: `{screenset}/uikit/` (no uicore imports)
- FORBIDDEN: Mock data inline (extract to `data/` or `constants/`)
- FORBIDDEN: Business logic in `uikit/` components
```

**Given** a user running `/hai3-quick-ref`
**When** displaying the reference
**Then** the output SHALL include a Component Decomposition section
**And** the section SHALL list complexity thresholds
**And** the section SHALL list placement rules
