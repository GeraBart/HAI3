# screensets Specification Delta

## ADDED Requirements

### Requirement: Component placement decision tree

Screensets SHALL organize components using a semantic decision tree based on component characteristics, not arbitrary numerical limits.

#### Scenario: Presentational component placement

```typescript
// src/screensets/dashboards/uikit/StatCard.tsx
// ✅ Correct: Presentational component in uikit/

interface StatCardProps {
  label: string;
  value: string;
  change: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change }) => {
  // No Redux, no API calls, no side effects
  // Uses only props - pure presentational
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Badge variant="secondary">{change}</Badge>
      </CardContent>
    </Card>
  );
};
```

**Given** a component that:
- Accepts value/onChange pattern for state
- Has no hooks accessing external state (useAppSelector, useQuery)
- Has no side effects (API calls, event emissions)
- Uses only props and local useState/useEffect

**When** determining component placement
**Then** the component SHALL be placed in `screensets/{name}/uikit/`
**And** the component SHALL NOT import from @hai3/uicore (except types)
**And** the component SHALL use theme tokens only (no inline styles)

#### Scenario: Business logic component used by multiple screens

```typescript
// src/screensets/chat/components/ThreadList.tsx
// ✅ Correct: Business logic component in components/

import { useAppSelector } from '@hai3/uicore';
import { selectThreads } from '../slices/threadsSlice';
import { selectThread } from '../actions/threadActions';

export const ThreadList: React.FC = () => {
  const threads = useAppSelector(selectThreads);

  return (
    <div>
      {threads.map(thread => (
        <div key={thread.id} onClick={() => selectThread(thread.id)}>
          {thread.title}
        </div>
      ))}
    </div>
  );
};
```

**Given** a component that:
- Contains business logic (Redux selectors, actions, API calls)
- Is used by multiple screens in the same screenset

**When** determining component placement
**Then** the component SHALL be placed in `screensets/{name}/components/`
**And** the component MAY import from @hai3/uicore
**And** the component SHOULD be screen-agnostic

#### Scenario: Screen-specific component with business logic

```typescript
// src/screensets/dashboards/screens/home/components/RevenueChart.tsx
// ✅ Correct: Screen-specific component in screens/home/components/

import { useAppSelector } from '@hai3/uicore';
import { selectRevenueData } from '../../../slices/dashboardsSlice';

export const RevenueChart: React.FC = () => {
  const data = useAppSelector(selectRevenueData);

  return (
    <Card>
      <LineChart data={data}>
        {/* ... */}
      </LineChart>
    </Card>
  );
};
```

**Given** a component that:
- Contains business logic
- Is used by only one screen

**When** determining component placement
**Then** the component SHALL be placed in `screens/{screen}/components/`
**And** the component MAY be tightly coupled to screen state

### Requirement: UIKit component purity

Components in `screensets/*/uikit/` SHALL be purely presentational with no business logic.

#### Scenario: UIKit component imports uicore (violation)

```typescript
// src/screensets/dashboards/uikit/BadCard.tsx
// ❌ VIOLATION: uikit component with business logic

import { useAppSelector } from '@hai3/uicore';  // FORBIDDEN
import { selectStats } from '../slices/dashboardsSlice';

export const BadCard: React.FC = () => {
  const stats = useAppSelector(selectStats);  // Business logic!
  return <Card>{stats.value}</Card>;
};
```

**Given** a component in `screensets/*/uikit/` folder
**When** the component imports runtime values from @hai3/uicore
**Then** ESLint SHALL report error: `uikit-no-business-logic`
**And** the message SHALL suggest moving to `components/` folder

#### Scenario: UIKit component with type-only imports (allowed)

```typescript
// src/screensets/dashboards/uikit/ChartCard.tsx
// ✅ Correct: Type-only imports are allowed

import type { RootState } from '@hai3/uicore';  // Type-only - OK

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {children}
    </Card>
  );
};
```

**Given** a component in `screensets/*/uikit/` folder
**When** the component only imports types from @hai3/uicore
**Then** ESLint SHALL NOT report an error

### Requirement: No inline styles outside base uikit

Components outside `packages/uikit/src/base/` SHALL NOT use inline styles or hex colors.

#### Scenario: Inline style prop (violation)

```typescript
// src/screensets/dashboards/screens/home/HomeScreen.tsx
// ❌ VIOLATION: Inline style

<div style={{ opacity: 0.5, marginTop: 10 }}>  // FORBIDDEN
  Content
</div>
```

**Given** a component outside `packages/uikit/src/base/`
**When** the component uses `style={{}}` JSX attribute
**Then** ESLint SHALL report error: `no-inline-styles`
**And** the message SHALL suggest using Tailwind classes

#### Scenario: Hex color literal (violation)

```typescript
// src/screensets/dashboards/components/Header.tsx
// ❌ VIOLATION: Hex color

const color = '#ff6b6b';  // FORBIDDEN
<div className="bg-[#0066cc]">  // FORBIDDEN - arbitrary value with hex
```

**Given** a component outside `packages/uikit/src/base/`
**When** the component contains hex color literals
**Then** ESLint SHALL report error: `no-inline-styles/noHexColor`
**And** the message SHALL suggest using CSS variables like `hsl(var(--primary))`

#### Scenario: Theme token usage (correct)

```typescript
// src/screensets/dashboards/screens/home/HomeScreen.tsx
// ✅ Correct: Theme tokens via Tailwind

<div className="opacity-50 mt-4 bg-primary text-primary-foreground">
  Content
</div>

// Or CSS variable in styled context
const chartColor = 'hsl(var(--chart-1))';
```

**Given** a component using Tailwind classes or CSS variables
**When** ESLint analyzes the component
**Then** no styling errors SHALL be reported

### Requirement: Inline component detection in screens

Screen files SHALL NOT contain inline component definitions that should be extracted.

#### Scenario: Inline React.FC definition in screen file

```typescript
// src/screensets/dashboards/screens/home/HomeScreen.tsx
// ⚠️ WARNING: Inline component should be extracted

const StatsCards: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="grid gap-4">
    {/* ... */}
  </div>
);

const RevenueChart: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <Card>
    {/* ... */}
  </Card>
);

export const HomeScreen: React.FC = () => {
  return (
    <div>
      <StatsCards t={t} />
      <RevenueChart t={t} />
    </div>
  );
};
```

**Given** a screen file (`*Screen.tsx`) with inline `React.FC` definitions
**When** ESLint or CLI validation analyzes the file
**Then** the system SHALL report warning for each inline component
**And** the message SHALL suggest extraction location based on decision tree:
  - `screens/{screen}/components/` for screen-specific
  - `screensets/{name}/components/` for multi-screen
  - `screensets/{name}/uikit/` for presentational

### Requirement: Component planning in AI commands

AI commands for creating screensets and screens SHALL require component planning before code generation.

#### Scenario: hai3-new-screenset gathers UI sections

```markdown
## GATHER REQUIREMENTS

Ask user for:
- Screenset name (camelCase)
- Category: Drafts | Mockups | Production
- Initial screens (list)
- **For each screen:**
  - UI sections (e.g., "stats display, revenue chart, activity feed")
  - Data sources (mock arrays, API calls)
```

**Given** a user running `/hai3-new-screenset`
**When** gathering requirements
**Then** the AI SHALL ask about UI sections for each screen
**And** the AI SHALL ask about data sources

#### Scenario: Component Planning Phase

```markdown
## COMPONENT PLANNING PHASE (MANDATORY)

Before writing code:

1. List UI sections from requirements
2. For EACH section, determine placement:
   - Is it presentational (no Redux/API)? → uikit/
   - Is it reused across screens? → components/
   - Is it screen-specific with logic? → screens/*/components/

3. Include Component Plan in proposal.md:

### Component Plan

#### HomeScreen
**Screenset UIKit** (presentational):
- [ ] `uikit/StatCard.tsx` - Single stat display
- [ ] `uikit/ChartCard.tsx` - Chart container

**Screen Components** (screen-specific):
- [ ] `screens/home/components/StatsGrid.tsx`
- [ ] `screens/home/components/RevenueChart.tsx`
- [ ] `screens/home/components/ActivityList.tsx`

**API Services** (if data needed):
- [ ] `api/dashboard/DashboardApiService.ts` - Service for dashboard data
- [ ] `api/dashboard/mocks.ts` - Mock responses
```

**Given** a screenset with multiple UI sections per screen
**When** creating the OpenSpec proposal
**Then** the proposal SHALL include a Component Plan section
**And** each component SHALL be assigned to correct folder
**And** component files SHALL be created BEFORE screen file
**And** data SHALL come from API services, not inline or data/ folders

### Requirement: CLI component validation

The HAI3 CLI SHALL provide a command to validate component structure.

#### Scenario: Validate command detects violations

```bash
$ hai3 validate components src/screensets/dashboards

Validating components in src/screensets/dashboards...

screens/home/HomeScreen.tsx
  ⚠ inline-component: "StatsCards" should be extracted
    → Consider: screens/home/components/StatsCards.tsx
  ⚠ inline-component: "RevenueChart" should be extracted
    → Consider: screens/home/components/RevenueChart.tsx

uikit/BadCard.tsx
  ✗ uikit-purity: Imports useAppSelector from @hai3/uicore
    → Move to components/ if business logic is needed

screens/home/HomeScreen.tsx
  ✗ inline-style: style={{}} at line 45
    → Use Tailwind classes instead

Found 1 error, 2 warnings
```

**Given** a screenset with component violations
**When** running `hai3 validate components [path]`
**Then** the CLI SHALL detect and report:
  - Inline component definitions in screen files
  - UIKit purity violations
  - Inline styles and hex colors
**And** each violation SHALL include a suggestion for fixing

#### Scenario: Validate command passes

```bash
$ hai3 validate components src/screensets/demo

Validating components in src/screensets/demo...

✓ All component checks passed
```

**Given** a well-structured screenset
**When** running `hai3 validate components [path]`
**Then** the CLI SHALL report success

### Requirement: Quick reference component patterns

The `hai3-quick-ref` command SHALL include component placement patterns.

#### Scenario: Component patterns in quick reference

```markdown
## Component Placement

Decision Tree:
- Presentational (no Redux/API)? → screensets/{name}/uikit/
- Multi-screen with logic? → screensets/{name}/components/
- Single-screen with logic? → screens/{screen}/components/

UIKit Rules (screensets/*/uikit/):
- FORBIDDEN: import from @hai3/uicore (except types)
- REQUIRED: value/onChange pattern
- REQUIRED: theme tokens only

Styling Rules:
- FORBIDDEN: style={{}} (except base uikit)
- FORBIDDEN: hex colors (#fff, #000)
- REQUIRED: Tailwind classes or CSS variables

Validation:
- Run: `hai3 validate components [path]`
```

**Given** a user running `/hai3-quick-ref`
**When** displaying the reference
**Then** the output SHALL include Component Placement section
**And** the section SHALL include the decision tree
**And** the section SHALL include validation command

### Requirement: CLI availability prerequisite

AI commands for creating screensets and screens SHALL verify CLI tools are available before proceeding.

#### Scenario: HAI3 CLI not installed

```bash
$ hai3 --version
command not found: hai3
```

**Given** a user running `/hai3-new-screenset`
**When** the AI checks for HAI3 CLI availability
**And** the `hai3 --version` command fails
**Then** the AI SHALL stop immediately
**And** the AI SHALL tell user: "HAI3 CLI is required. Run `npm install -g @hai3/cli` first."
**And** the AI SHALL NOT proceed by reading peer screensets
**And** the AI SHALL NOT attempt to manually create structure
**And** the AI SHALL wait for user to install CLI

#### Scenario: OpenSpec CLI not installed

```bash
$ npx openspec --version
npm ERR! could not determine executable to run
```

**Given** a user running `/hai3-new-screenset`
**When** the AI checks for OpenSpec CLI availability
**And** the `npx openspec --version` command fails
**Then** the AI SHALL stop immediately
**And** the AI SHALL tell user: "OpenSpec CLI is required. Run `npm install openspec` first."
**And** the AI SHALL NOT proceed without proposal workflow
**And** the AI SHALL wait for user to install OpenSpec

#### Scenario: Both CLIs available

```bash
$ hai3 --version
0.1.0-alpha.0

$ npx openspec --version
1.0.0
```

**Given** a user running `/hai3-new-screenset`
**When** the AI checks for CLI availability
**And** both commands succeed
**Then** the AI SHALL proceed with gathering requirements

### Requirement: hai3-validate includes component checks

The `hai3-validate` AI command SHALL include component structure validation.

#### Scenario: Validation includes component checks

```markdown
## STEP 3: Check Component Structure
Run: `hai3 validate components src/screensets/{name}`

Check for:
- Inline React.FC definitions in screen files
- UIKit purity violations (@hai3/uicore imports in uikit/)
- Inline styles and hex colors
- Mock data arrays in screen files
```

**Given** a user running `/hai3-validate`
**When** the validation workflow executes
**Then** the AI SHALL run `hai3 validate components` command
**And** the AI SHALL report any component structure violations
**And** the AI SHALL suggest fixes using hai3-fix-violation

### Requirement: hai3-fix-violation includes component fixes

The `hai3-fix-violation` AI command SHALL include component placement and styling fixes.

#### Scenario: Fix inline component violation

```markdown
## COMMON FIXES

Component Placement:
- Inline component in screen: Extract to screens/{screen}/components/ or uikit/
- UIKit with business logic: Move to components/ folder
- Presentational in components: Move to uikit/ folder

Styling:
- Inline style: BAD style={{ opacity: 0.5 }} -> GOOD className="opacity-50"
- Hex color: BAD #0066cc -> GOOD hsl(var(--primary))
- Arbitrary value: BAD bg-[#fff] -> GOOD bg-background
```

**Given** a component placement or styling violation
**When** the user runs `/hai3-fix-violation`
**Then** the AI SHALL identify the violation type
**And** the AI SHALL apply the correct fix from COMMON FIXES
**And** the AI SHALL verify with `npm run lint`

### Requirement: ESLint plugin rules for component architecture

The `eslint-plugin-local` package SHALL include rules for enforcing component architecture.

#### Scenario: no-inline-styles rule

```typescript
// presets/standalone/eslint-plugin-local/src/rules/no-inline-styles.ts

// Detects:
// - style={{}} JSX attributes
// - Hex color literals (#fff, #000000)
// Allows:
// - Files in packages/uikit/src/base/
```

**Given** the `no-inline-styles` ESLint rule
**When** a component outside base uikit uses `style={{}}` or hex colors
**Then** ESLint SHALL report error with message suggesting Tailwind classes
**And** the rule SHALL be configured as `error` severity

#### Scenario: uikit-no-business-logic rule

```typescript
// presets/standalone/eslint-plugin-local/src/rules/uikit-no-business-logic.ts

// Detects:
// - @hai3/uicore imports in screensets/*/uikit/ folders
// Allows:
// - Type-only imports (import type { ... })
// - Files in icons/ subfolder
```

**Given** the `uikit-no-business-logic` ESLint rule
**When** a component in `screensets/*/uikit/` imports from @hai3/uicore
**Then** ESLint SHALL report error suggesting move to components/
**And** the rule SHALL be configured as `error` severity

#### Scenario: screen-inline-components rule

```typescript
// presets/standalone/eslint-plugin-local/src/rules/screen-inline-components.ts

// Detects:
// - React.FC definitions in *Screen.tsx files
// Skips:
// - The main exported component (export const FooScreen)
```

**Given** the `screen-inline-components` ESLint rule
**When** a screen file contains inline React.FC definitions
**Then** ESLint SHALL report warning suggesting extraction
**And** the rule SHALL be configured as `warn` severity

### Requirement: Architecture check integration

Component validation SHALL be integrated into the architecture check workflow.

#### Scenario: arch:check includes component validation

```bash
$ npm run arch:check

Running architecture checks...

✓ Dependency rules (dependency-cruiser)
✓ Unused exports (knip)
✓ Component structure (hai3 validate components)

All checks passed.
```

**Given** a project with `npm run arch:check` configured
**When** the arch:check script runs
**Then** it SHALL include `hai3 validate components` check
**And** component violations SHALL cause arch:check to fail

#### Scenario: arch:check fails on component violations

```bash
$ npm run arch:check

Running architecture checks...

✓ Dependency rules (dependency-cruiser)
✓ Unused exports (knip)
✗ Component structure (hai3 validate components)
  - src/screensets/dashboards/uikit/BadCard.tsx: uikit-purity violation

Architecture checks failed.
```

**Given** a screenset with component violations
**When** `npm run arch:check` runs
**Then** it SHALL report the component violations
**And** it SHALL exit with non-zero status

### Requirement: Optional ast-grep rules

Projects MAY use ast-grep for additional structural pattern detection.

#### Scenario: ast-grep detects inline components

```yaml
# .ast-grep/rules/screen-inline-components.yml
id: screen-inline-components
language: tsx
rule:
  pattern: const $NAME: React.FC<$PROPS> = ($PARAMS) => $BODY
  not:
    follows:
      pattern: export default
files:
  - "src/screensets/**/screens/**/*Screen.tsx"
message: Inline component "$NAME" should be extracted
severity: warning
```

**Given** a project with ast-grep configured
**When** running `ast-grep scan --rule .ast-grep/rules/`
**Then** it SHALL detect inline component definitions in screen files
**And** it SHALL provide extraction suggestions

#### Scenario: ast-grep detects inline data arrays

```yaml
# .ast-grep/rules/inline-data-array.yml
id: inline-data-array
language: tsx
rule:
  pattern: const $NAME = [$$$ITEMS]
  has:
    pattern: "{ $$$PROPS }"
files:
  - "src/screensets/**/screens/**/*Screen.tsx"
message: Inline data array "$NAME" violates architecture. Data must come from API services.
severity: error
```

**Given** a project with ast-grep configured
**When** running `ast-grep scan --rule .ast-grep/rules/`
**Then** it SHALL detect inline data arrays in screen files
**And** it SHALL indicate data must come from API services via event-driven flow