# Design: Component Decomposition Enforcement

## Context

The HAI3 framework guides AI assistants to generate screensets, but the current guidelines focus on data flow and naming conventions while ignoring component architecture. This results in:

1. **Monolithic screens** - 400+ line screen files with all components inline
2. **No local uikit components** - Only icons created in `screensets/*/uikit/`
3. **Poor reusability** - Components copy-pasted instead of extracted
4. **Difficult maintenance** - Large files harder to understand and modify

The `demo` screenset shows the desired pattern:
- `screens/uikit/CategoryMenu.tsx` (screen-local component)
- `demo/components/LayoutElements.tsx` (screenset-wide component)
- `demo/uikit/icons/ExpandableButton.tsx` (reusable presentational component)
- `UIKitElementsScreen.tsx` at ~185 lines (clean orchestration)

The `dashboards` screenset (AI-generated) shows the problem:
- `HomeScreen.tsx` at 420 lines with 5 inline components
- Only `DraggableCard.tsx` properly extracted
- Mock data hardcoded inline
- No screenset-wide components

## Goals / Non-Goals

**Goals:**
- Define clear thresholds that trigger component extraction
- Provide placement rules for different component types
- Add automated detection of violations
- Update AI commands to include decomposition planning
- Maintain backward compatibility (no changes to existing screens required)

**Non-Goals:**
- Automatically refactoring existing screens
- Enforcing specific component patterns beyond placement
- Adding runtime component validation

## Decisions

### Decision 1: Complexity Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Screen file lines | > 200 | WARNING: Should decompose |
| Screen file lines | > 300 | ERROR: Must decompose |
| Inline FC definitions | > 2 | ERROR: Must extract to components/ |
| Inline mock data arrays | > 0 | WARNING: Should extract to data/ |

**Rationale:** 200 lines is comfortable for code review and comprehension. 300 lines is the hard limit. 2 inline components is tolerable, 3+ indicates poor architecture.

### Decision 2: Component Placement Hierarchy

```
Placement Decision Tree:

Is component used by multiple screensets?
├─ Yes → Propose addition to @hai3/uikit (via hai3-new-component)
└─ No → Is component purely presentational (no business logic)?
         ├─ Yes → Place in screensets/{name}/uikit/
         └─ No → Is component used by multiple screens in same screenset?
                  ├─ Yes → Place in screensets/{name}/components/
                  └─ No → Place in screens/{screen}/components/
```

**Rationale:** This hierarchy optimizes for reusability while maintaining vertical slice isolation.

### Decision 3: Enforcement Mechanism

**Layer 1: ESLint (Instant Feedback)**
- New rule: `screen-file-complexity`
- Checks: Line count, inline component count
- When: Editor integration, `npm run lint`

**Layer 2: Architecture Tests (Pre-commit)**
- Check: Component placement validation
- When: `npm run arch:check`

**Layer 3: AI Commands (Generation Time)**
- Modified: hai3-new-screenset, hai3-new-screen
- Behavior: Ask about complexity, plan components before generating

**Rationale:** Multi-layer enforcement catches issues at different stages. ESLint provides immediate feedback, arch:check provides pre-commit validation, AI commands prevent issues at generation time.

### Decision 4: ESLint Rule Implementation

```typescript
// screen-file-complexity.ts
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce screen file complexity limits',
      category: 'Screenset Architecture',
    },
    messages: {
      tooManyLines: 'Screen file has {{count}} lines (max {{max}}). Decompose into components.',
      tooManyInlineComponents: 'Screen has {{count}} inline components (max {{max}}). Extract to components/ folder.',
    },
  },
  create(context) {
    // Only check *Screen.tsx files in screens/ folder
    const filename = context.getFilename();
    if (!filename.includes('/screens/') || !filename.endsWith('Screen.tsx')) {
      return {};
    }

    let inlineComponentCount = 0;
    const MAX_LINES = 300;
    const MAX_INLINE_COMPONENTS = 2;

    return {
      // Count const Foo: React.FC = ... patterns
      'VariableDeclarator[init.type="ArrowFunctionExpression"]'(node) {
        // Check if typed as React.FC or similar
        if (hasReactFCType(node)) {
          inlineComponentCount++;
        }
      },
      'Program:exit'(node) {
        const lineCount = context.getSourceCode().lines.length;

        if (lineCount > MAX_LINES) {
          context.report({
            node,
            messageId: 'tooManyLines',
            data: { count: lineCount, max: MAX_LINES },
          });
        }

        if (inlineComponentCount > MAX_INLINE_COMPONENTS) {
          context.report({
            node,
            messageId: 'tooManyInlineComponents',
            data: { count: inlineComponentCount, max: MAX_INLINE_COMPONENTS },
          });
        }
      },
    };
  },
};
```

**Alternatives Considered:**
1. **knip for unused exports** - Already used, but doesn't detect oversized files
2. **Custom script analyzer** - Less integrated than ESLint
3. **TypeScript plugin** - More complex, less portable

### Decision 5: Architecture Test Implementation

```typescript
// test-architecture.ts addition
describe('Component Placement', () => {
  it('screens should not have components in uikit/', () => {
    // Screen-specific components should be in screens/*/components/
    // not in screensets/*/uikit/
    const violations = glob.sync('src/screensets/*/uikit/**/!(icons)/*.tsx')
      .filter(f => f.includes('Screen'));
    expect(violations).toHaveLength(0);
  });

  it('uikit components should not import uicore hooks', () => {
    // Presentational components must not have business logic
    const uikitFiles = glob.sync('src/screensets/*/uikit/**/*.tsx');
    for (const file of uikitFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/from ['"]@hai3\/uicore['"]/);
    }
  });
});
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing screens fail new rules | Set as warnings initially, document migration path |
| AI agents ignore guidelines | Multi-layer enforcement (ESLint + arch:check) catches violations |
| Over-decomposition | Set minimum thresholds (don't decompose < 100 line screens) |
| Different AI models interpret differently | Provide concrete examples in guidelines |

## Migration Plan

1. **Phase 1**: Add guidelines (no enforcement)
   - Update SCREENSETS.md, AI commands
   - Document patterns

2. **Phase 2**: Add warnings
   - ESLint rule with `warn` severity
   - Architecture test with skip option

3. **Phase 3**: Enforce on new code
   - ESLint rule with `error` severity
   - Architecture test required to pass

**Rollback:** Rules can be disabled in eslint.config.js and test-architecture.ts

## Open Questions

1. Should we create a `hai3-decompose-screen` command for refactoring existing screens?
2. What's the right threshold for mock data extraction (array length, object depth)?
3. Should we add VS Code extension integration for instant warnings?
