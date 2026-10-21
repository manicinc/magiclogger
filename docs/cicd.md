# CI/CD Setup

Magiclogger uses GitHub Actions for continuous integration and for releases to npm. This document explains the pipeline, the secrets it uses and how a change on `master` becomes an npm release.

## Table of Contents

- [CI/CD Overview](#cicd-overview)
- [Workflow Files](#workflow-files)
- [Versioning Strategy](#versioning-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Release Procedure](#release-procedure)
- [Required & Optional Secrets](#required--optional-secrets)
- [Future Enhancements (Optional)](#future-enhancements-optional)

## CI/CD Overview

Magiclogger CI currently does:

1. Pre‑checks (commit lint, large file warning)
2. Lint, type-check, formatting verification, basic audit
3. Tests with coverage on Node 18 (Ubuntu)
4. Build artifacts (ESM + CJS) and upload dist
5. Draft release notes maintenance (Release Drafter) when on `master` / `main`
6. Optional coverage upload to Codecov
7. Secret scanning with Trivy (free, no license required)

Releases to npm are made by semantic-release in `releases.yml`, through npm's trusted publisher; see [Release Procedure](#release-procedure).

## Documentation Structure

### Single Source of Truth

MagicLogger maintains documentation in a single location to avoid duplication and inconsistencies:

- **Source**: All documentation lives in `docs/` folder
- **Website**: Docusaurus site in `website/` folder
- **Sync**: Documentation is synced from `docs/` to `website/docs/` at build time

### How It Works

1. **Local Development**:
   ```bash
   # Edit docs in docs/ folder
   vim docs/my-doc.md
   
   # Test locally with auto-sync
   cd website
   npm run start  # Automatically runs sync-docs first
   ```

2. **CI/CD Build**:
   - GitHub Actions automatically syncs docs before building
   - The `docs.yml` workflow runs `node scripts/sync-docs.js`
   - Builds and deploys to GitHub Pages

3. **Why This Approach**:
   - Single source of truth in `docs/`
   - No manual copying or duplication
   - `website/docs/` is gitignored (except tutorials)
   - Automatic frontmatter injection for Docusaurus

### Adding New Documentation

1. Create doc in `docs/` folder:
   ```bash
   echo "# My New Feature" > docs/my-feature.md
   ```

2. Add to sync list in `scripts/sync-docs.js`:
   ```javascript
   const DOCS_TO_SYNC = [
     // ... existing docs
     'my-feature.md',
   ];
   ```

3. Update sidebar if needed in `website/sidebars.ts`

4. Test locally:
   ```bash
   cd website && npm run start
   ```

## Workflow Files

The pipeline is defined in these workflow files:

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Core CI: pre-check, quality, matrix tests, build, draft update |
| `.github/workflows/auto-label.yml` | Auto label PRs (paths + conventional commit types + size) |
| `.github/workflows/release-drafter.yml` | Maintain draft release notes on PR merges / label changes |
| `.github/workflows/releases.yml` | Release: semantic-release on `master` (a release-bearing push or a manual run), npm through the trusted publisher; dry runs on any branch |
| `.github/workflows/release.yml` | A `v*` tag pushed by hand: build + GitHub Release (no npm publish) |
| `.github/workflows/lockfile.yml` | Resolves `pnpm-lock.yaml` as an artifact when a branch push changes `package.json`, `website/package.json` or `pnpm-workspace.yaml` |

Versions come from semantic-release, configured in `.releaserc`.

## Security Scanning (Secrets)

We use Trivy for secret scanning in CI. This replaces the previous gitleaks step that required a paid org license.

- License/keys: None required for our usage.
- Extra dependencies in repo: None. The GitHub Action downloads Trivy.
- Network: Not required for secret-only scanning (no vulnerability DB needed).

CI step (excerpt):

```yaml
- name: Trivy secret scan (repo)
   uses: aquasecurity/trivy-action@0.20.0
   continue-on-error: false
   with:
      scan-type: 'fs'
      scan-ref: '.'
      scanners: 'secret'
      format: 'table'
      exit-code: '1'
      hide-progress: true
```

Local usage (optional):
- Windows (Chocolatey): `choco install trivy`
- macOS (Homebrew): `brew install trivy`
- Docker: `docker run --rm -v "$PWD":/project -w /project aquasec/trivy:latest fs --scanners secret .`

Exit code 1 indicates secrets found; rotate any exposed credentials and remove them from history as needed.

## Versioning Strategy

semantic-release sets each version from the conventional commits since the last `v*` tag (`.releaserc`): `feat` a minor, `fix`, `perf` and `revert` a patch, a breaking change a major; the other types release nothing. It commits the new version to `package.json` and `CHANGELOG.md`, tags it, publishes it to npm and creates the GitHub Release. Release Drafter keeps a separate draft of the notes, grouped by pull request label.

## Commit Message Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for clarity, changelog grouping, and future tooling compatibility:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

The commit types determine how the version is bumped:

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | A new feature | Minor (1.0.0 → 1.1.0) |
| `fix` | A bug fix | Patch (1.0.0 → 1.0.1) |
| `perf` | Performance improvement | Patch |
| `docs` | Documentation only changes | No version bump |
| `style` | Code style changes (formatting, etc.) | No version bump |
| `refactor` | Code changes that neither fix bugs nor add features | No version bump |
| `test` | Adding or correcting tests | No version bump |
| `chore` | Changes to the build process or tools | No version bump |

Breaking changes (major version bumps) are triggered by:

```
feat!: add new API that breaks backward compatibility

BREAKING CHANGE: Previous function signature changed
```

Or:

```
feat(api): add new API that breaks backward compatibility

BREAKING CHANGE: Previous function signature changed
```

## Coverage & Codecov (Optional)

Coverage generated via `pnpm test:coverage` (Jest). The Ubuntu/Node 18 job uploads `coverage/lcov.info` if `CODECOV_TOKEN` secret is present. Without a token public repos may still work but token improves reliability.

Add `codecov.yml` (optional) to enforce thresholds (statements/branches/functions/lines). Example minimal config:
```yaml
coverage:
   status:
      project:
         default:
            target: 95%
            threshold: 1%
```

## Release Procedure

The [Deployment & Release Guide](./deployment.md) has the details. In short:

1. Merge pull requests into `master` with green checks.
2. A push to `master` whose commit message starts with `feat:`, `fix:` or `perf:` (or contains `BREAKING CHANGE`) runs the release job. After a merge commit, run it by hand: `gh workflow run releases.yml --ref master`.
3. semantic-release commits the version, tags it, publishes to npm through the trusted publisher (no npm token) and creates the GitHub Release, when the commits since the last tag call for a release.
4. To check a release without making one, on any branch: `gh workflow run releases.yml --ref <branch> -f dry_run=true`.

To skip CI for non-critical doc-only commits you can append `[skip ci]` to the commit message (use sparingly).

## Required & Optional Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` | Optional | Fallback for the release step when the OIDC exchange with npm's trusted publisher fails; a release needs no npm token |
| `CODECOV_TOKEN` | Optional | Reliable Codecov uploads for coverage reporting |
| (none for Trivy) | — | Trivy secret scan requires no license or API keys |

Add via: Repository → Settings → Secrets and variables → Actions → New repository secret.

`GITHUB_TOKEN` is automatically provided and used for draft releases, artifact uploads, labeling, and by semantic-release for the release commit, the tag and the GitHub Release.

If `NPM_TOKEN` is set, keep it a granular token limited to publishing this package.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Release job skipped on a push | The commit message does not start with `feat:`, `fix:` or `perf:` (a merge commit never does) | Run it by hand: `gh workflow run releases.yml --ref master` |
| `verifyConditions` fails in `@semantic-release/npm` | The OIDC exchange failed (the log gives the status) and there is no valid `NPM_TOKEN` | Check that the package's trusted publisher on npmjs.com names `manicinc/magiclogger` and `releases.yml`, then check with a dry run |
| Coverage not on Codecov | Missing token or job matrix mismatch | Add `CODECOV_TOKEN`, confirm path `coverage/lcov.info` |
| Draft release empty | PR labels missing conventional prefixes | Ensure commit/PR titles follow convention |

## Future Enhancements (Optional)

- Add bundle size limits (e.g. `andresz1/size-limit-action`).
- Add Dependabot for dependency update PRs.
- Add `codeql` workflow for security scanning.