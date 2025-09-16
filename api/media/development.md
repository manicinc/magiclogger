# Development Guide for Magiclogger

## Project Overview

Magiclogger is a fully typed, high-performance logging library built with TypeScript. This guide provides comprehensive instructions for setting up, developing, and contributing to the project.

## Prerequisites
- Node.js 18+ recommended (CI uses 18/20; docs deploy uses Node 20)
- pnpm (preferred). Corepack can enable pnpm automatically.
- TypeScript 5.x

Clone the repository and install dependencies (pnpm preferred for lockfile fidelity and speed):

### Installation
```bash
git clone https://github.com/manicinc/magiclogger.git
cd magiclogger
# Enable corepack if not already
corepack enable
pnpm install
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
| `npm run format` | Format code with Prettier |
| `npm run preflight` | Run comprehensive pre-release checks |
View detailed coverage report with:
`pnpm test:coverage`
## Testing

Magiclogger maintains rigorous test coverage standards (see Codecov docs). Target ~95% lines.

## Branch & Merge Workflow

We maintain two long‑lived branches:

- `master` (default, stable)
- `dev` (integration / staging)

Flow:
1. Create feature/fix branches from `dev` (e.g. `feat/browser-export`).
2. Open PR → `dev`. CI (lint/tests/build) must pass.
3. After multiple merges and when `dev` is stable, open a PR `dev` → `master`.
4. Merge into `master` updates the draft release notes (Release Drafter). No publish occurs until a version tag is pushed.
 5. If the promotion PR should NOT influence release notes or versioning (e.g. docs-only sync), add the label `skip-release` (optionally also `skip-changelog`).
  - A dedicated GitHub Action (`skip-release-guard.yml`) enforces that no version bump or release-style commits occur while this label is present.

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

## Documentation Site

The documentation site uses Docusaurus and is located in the `website` directory.

### Local Development

```bash
cd website
pnpm install
pnpm start  # Starts dev server at http://localhost:3000
```

### Building Documentation

```bash
cd website
pnpm build  # Creates static build in website/build
```

### Analytics Configuration

The documentation site includes Google Analytics and Microsoft Clarity for usage tracking.

Analytics are configured via GitHub Secrets only (for security):
- Go to Settings → Secrets and variables → Actions
- Add `GA_TRACKING_ID` (Google Analytics Measurement ID)
- Add `MS_CLARITY_ID` (Microsoft Clarity Project ID)

Analytics only work in production deployment via GitHub Actions.

#### GDPR Compliance

The site includes a minimal cookie consent banner that:
- Appears on first visit
- Blocks analytics until user consent
- Remembers user preference
- Styled to match site theme (light/dark mode)

### Deploying Documentation

Documentation automatically deploys to GitHub Pages when pushing to main/master branch.
The GitHub Actions workflow uses the repository secrets for analytics.

## Local Security/Secret Scanning (Optional)

We run Trivy secret scanning in CI. You can mirror this locally to catch issues before pushing:

- macOS: `brew install trivy`
- Windows: `choco install trivy`
- Docker (no install):
  ```bash
  docker run --rm -v "$PWD":/project -w /project aquasec/trivy:latest fs --scanners secret .
  ```

Exit code 1 means potential secrets detected; rotate credentials and purge from history if confirmed.