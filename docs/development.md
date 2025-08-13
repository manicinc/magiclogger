# Development Guide for Magiclogger

## Project Overview

Magiclogger is a fully typed, high-performance logging library built with TypeScript. This guide provides comprehensive instructions for setting up, developing, and contributing to the project.

## Prerequisites
 Node.js 16+ recommended (project supports >=14, CI tests 16 / 18 / 20)
 pnpm (preferred) or npm / yarn (Corepack can enable pnpm automatically)
 TypeScript 5.x
- TypeScript 4.5.0 or higher

 Clone the repository and install dependencies (pnpm preferred for lockfile fidelity and speed):

### Installation
```bash
git clone https://github.com/manicinc/magiclogger.git
cd magiclogger
# Enable corepack if not already
corepack enable
pnpm install
```
cd magiclogger
npm install
```

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development (tsup watch) |
| `pnpm test` | Run test suite |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm build` | Build ESM + CJS bundles via tsup |
| `pnpm lint` | Run ESLint on src/tests/examples |
| `pnpm lint:fix` | Autofix lint issues |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Verify formatting |
| `pnpm preflight` | Full validation (format, lint, test, coverage, build, analysis) |
| `npm run dev` | Start development mode with file watching |
| `npm test` | Run test suite |
```bash
pnpm dev
```
| `npm run format` | Format code with Prettier |
| `npm run preflight` | Run comprehensive pre-release checks |
```bash
pnpm test
```
```bash
npm run dev
View detailed coverage report:
```bash
pnpm test:coverage
```
## Testing

```bash
pnpm lint
```
npm test
```
```bash
pnpm format
```
Magiclogger maintains rigorous test coverage standards:

```bash
pnpm preflight
```
- Lines: 95%

## Branch & Merge Workflow

We maintain two long‑lived branches:

- `master` (default, stable)
- `dev` (integration / staging)

Flow:
1. Create feature/fix branches from `dev` (e.g. `feat/browser-export`).
2. Open PR → `dev`. CI (lint/tests/build) must pass.
3. After multiple merges and when `dev` is stable, open a PR `dev` → `master`.
4. Merge into `master` updates the draft release notes (Release Drafter). No publish occurs until a version tag is pushed.

## Version & Release (Tag-Based)

We currently use manual version bumps + Release Drafter (not semantic-release).

Local version bump (updates `package.json` & CHANGELOG logic via script if adapted later):
```bash
node scripts/version-bump.js patch   # or minor | major
```

Tag & publish workflow:
1. Ensure `master` is green (`pnpm preflight`).
2. Bump version in `package.json` (script or manual) and commit (conventional message `chore(release): vX.Y.Z`).
3. Push commit to `master`.
4. Create & push tag `vX.Y.Z`:
  ```bash
  git tag vX.Y.Z
  git push origin vX.Y.Z
  ```
5. GitHub Action `release.yml` builds and publishes to npm (requires `NPM_TOKEN`).

Draft release notes are maintained automatically; adjust them before tagging if desired.

Preflight checks before any tag:
```bash
pnpm preflight
```
| `LOG_VERBOSE` | Enable verbose logging | `false` |
5. Push branch & open PR to `dev`
6. Ensure CI green; request review; merge
7. Follow release section when promoting to `master`
| `LOG_DIR` | Custom log directory | `./logs` |

Recommended TypeScript configuration:

## Commit Guidelines

We use Conventional Commits for semantic versioning:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Purpose | Version Impact |
|------|---------|----------------|
| `feat` | New feature | Minor version bump |
| `fix` | Bug fix | Patch version bump |
| `docs` | Documentation changes | No version change |
| `style` | Code formatting | No version change |
| `refactor` | Code restructuring | No version change |
| `test` | Test modifications | No version change |
| `chore` | Maintenance tasks | No version change |

### Breaking Changes

Indicate breaking changes by:
- Adding `!` after the type, or
- Including a `BREAKING CHANGE:` footer

## Release Process

### Local Release Testing

Test version bumps without publishing:

```bash
# Patch release
node scripts/version-bump.js patch

# Minor release
node scripts/version-bump.js minor

# Major release
node scripts/version-bump.js major
```

### Preflight Checks

Before any release, run comprehensive checks:

```bash
npm run preflight
```

This script ensures:
- Code is formatted
- Linting passes
- All tests pass
- Build succeeds
- Coverage requirements met

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run preflight`
5. Submit a pull request

## TypeScript Support

Magiclogger is built 100% in TypeScript, providing:
- Full type safety
- Comprehensive type definitions
- Intelligent type inference
- Zero runtime type overhead

Recommended TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true
  }
}
```