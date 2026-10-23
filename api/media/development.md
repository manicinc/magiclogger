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

CI reports coverage to Codecov on every push to `master` and every pull request. [Test Coverage](./test_coverage.md) has the coverage badge and the coverage checks on pull requests.

## Branch & Merge Workflow

`master` is the only long-lived development branch; `gh-pages` holds the built documentation site.

Flow:
1. Create feature/fix branches from `master` (e.g. `feat/browser-export`).
2. Open a pull request into `master`. CI (lint/tests/build) must pass.
3. Merging updates the draft release notes (Release Drafter). Releases to npm are made by semantic-release; see Version & Release below.
4. If a pull request should stay out of the release notes (e.g. docs only), add the label `skip-release` (optionally also `skip-changelog`).
  - A dedicated GitHub Action (`skip-release-guard.yml`) enforces that no version bump or release-style commits occur while this label is present.

## Version & Release

semantic-release makes the releases from `.github/workflows/releases.yml`: it reads the conventional commits since the last `v*` tag, commits the new version to `package.json` and `CHANGELOG.md`, tags it, publishes it to npm through the package's trusted publisher (no npm token) and creates the GitHub Release. A push to `master` whose commit message starts with `feat:`, `fix:` or `perf:` starts it; after a merge commit, run it by hand:

```bash
gh workflow run releases.yml --ref master
```

To see what the next release would be without making it, run a dry run on any branch:

```bash
gh workflow run releases.yml --ref <branch> -f dry_run=true
```

The [Deployment & Release Guide](./deployment.md) has the details. A `v*` tag pushed by hand (for example after `scripts/version-bump.cjs`) builds the package and creates a GitHub Release; it does not publish to npm. semantic-release takes the highest `v*` tag as the last release, so push one by hand only for a version already on npm.

Preflight checks before opening a pull request:
```bash
pnpm preflight
```
| `LOG_VERBOSE` | Enable verbose logging | `false` |
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

### Checking a Release

See what the next release would be, without publishing, tagging or pushing anything, with a dry run of the Release workflow on your branch:

```bash
gh workflow run releases.yml --ref <branch> -f dry_run=true
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