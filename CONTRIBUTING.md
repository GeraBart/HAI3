# Contributing to HAI3 Dev Kit

> **TARGET AUDIENCE:** Humans
> **PURPOSE:** Contribution guidelines and workflow for developers

Thank you for your interest in contributing to HAI3 Dev Kit! This document provides guidelines and information for contributors.

## Quick Start

### Prerequisites

- **Node.js** v20.11.0+
- **Git** for version control

### Development Setup

TODO

### Workspace Layout

TODO

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/user-authentication`
- `fix/memory-leak-in-router`
- `docs/api-gateway-examples`
- `refactor/entity-to-contract-conversions`

### 2. Make Your Changes

Follow the coding standards and patterns described below.

### 3. Run Quality Checks

TODO

### 4. Commit Changes

Follow a structured commit message format:

```text
<type>(<module>): <description>
```

- `<type>`: change category (see table below)
- `<module>` (optional): the area touched (e.g., api_ingress, modkit, ecommerce)
- `<description>`: concise, imperative summary

Accepted commit types:

| Type       | Meaning                                                     |
|------------|-------------------------------------------------------------|
| feat       | A new feature                                               |
| fix        | A bug fix                                                   |
| tech       | A technical improvement                                     |
| cleanup    | Code cleanup                                                |
| refactor   | Code restructuring without functional changes               |
| test       | Adding or modifying tests                                   |
| docs       | Documentation updates                                       |
| style      | Code style changes (whitespace, formatting, etc.)           |
| chore      | Misc tasks (deps, tooling, scripts)                         |
| perf       | Performance improvements                                    |
| ci         | CI/CD configuration changes                                 |
| build      | Build system or dependency changes                          |
| revert     | Reverting a previous commit                                 |
| security   | Security fixes                                              |
| breaking   | Backward incompatible changes                               |

Examples:

```text
feat(auth): add OAuth2 support for login
fix(ui): resolve button alignment issue on mobile
tech(database): add error abstraction for database and API errors
refactor(database): optimize query execution
test(api): add unit tests for user authentication
docs(readme): update installation instructions
style(css): apply consistent spacing in stylesheet
```

Best practices:

- Keep the title concise (ideally ≤ 50 chars)
- Use imperative mood (e.g., "Fix bug", not "Fixed bug")
- Make commits atomic (one logical change per commit)
- Add details in the body when necessary (what/why, not how)
- For breaking changes, either use `feat!:`/`fix!:` or include a `BREAKING CHANGE:` footer

New functionality development:

- Follow the repository structure in `README.md`
- Prefer soft-deletion for entities; provide hard-deletion with retention routines
- Include unit tests (and integration tests when relevant)

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Test coverage information
- Breaking changes (if any)

## Publishing Packages

HAI3 packages are automatically published to NPM when a PR is merged to the `main` branch. The publishing process is fully automated via GitHub Actions.

### How It Works

1. **Version Bumps**: When you want to publish a package, bump its version in `package.json` as part of your PR
2. **PR Merge**: When the PR is merged to `main`, the GitHub Actions workflow automatically detects version changes
3. **NPM Check**: The workflow checks if the new version already exists on NPM (prevents duplicate publishes)
4. **Publishing**: Packages are published in dependency order:
   - **Layer 1 (SDK)**: `@hai3/state`, `@hai3/screensets`, `@hai3/api`, `@hai3/i18n`, `@hai3/uikit`
   - **Layer 2 (Framework)**: `@hai3/framework`
   - **Layer 3 (React)**: `@hai3/react`
   - **Layer 4 (Tools)**: `@hai3/studio`
   - **Layer 5 (CLI)**: `@hai3/cli`

### Version Bumping Guidelines

Use semantic versioning for version bumps:

```bash
# Patch release (0.2.0-alpha.1 -> 0.2.0-alpha.2)
npm version prerelease --preid=alpha

# Minor release (0.2.0 -> 0.3.0)
npm version minor

# Major release (0.2.0 -> 1.0.0)
npm version major
```

**Important**: During alpha stage, use prerelease versions (e.g., `0.2.0-alpha.X`).

### Publishing Multiple Packages

If your changes affect multiple packages, bump versions for all affected packages in the same PR. The workflow will publish them in the correct dependency order automatically.

### NPM Token Setup (Maintainers Only)

The workflow requires an `NPM_TOKEN` secret configured in GitHub Actions:

1. Generate an NPM automation token at npmjs.com (organization-level recommended)
2. Add it as a GitHub Actions secret named `NPM_TOKEN`
3. Token should have publish permissions for `@hai3/*` packages

### Troubleshooting

**Version Already Exists**: If a version was manually published, the workflow will skip it and log a message. Simply bump to the next version.

**Publish Failure**: The workflow includes retry logic with exponential backoff. If all retries fail, check the workflow logs for the specific error and re-run the workflow after fixing the issue.

**No Packages Published**: If you merged a PR without version changes, the workflow will complete successfully with a message that no packages need publishing.
