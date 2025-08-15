# CI/CD Setup

Magiclogger uses GitHub Actions for continuous integration and (tag‑driven) delivery. This document explains the pipeline, required secrets, and how to promote code from `dev` to `master` and then to an npm release.

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
3. Test matrix (Node 16 / 18 / 20 across Ubuntu / Windows / macOS subset) with coverage
4. Build artifacts (ESM + CJS) and upload dist
5. Draft release notes maintenance (Release Drafter) when on `master` / `main`
6. Optional coverage upload to Codecov

It does **not** auto-publish on merge to `master`; publishing only happens when a semver tag (`vX.Y.Z`) is pushed.

## Workflow Files

The pipeline is defined in these workflow files:

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Core CI: pre-check, quality, matrix tests, build, draft update |
| `.github/workflows/auto-label.yml` | Auto label PRs (paths + conventional commit types + size) |
| `.github/workflows/release-drafter.yml` | Maintain draft release notes on PR merges / label changes |
| `.github/workflows/release.yml` | Tag-triggered build + npm publish + GitHub Release |

No `.releaserc` / semantic-release is used; versioning is manual + tags.

## Versioning Strategy

Manual semver bump + Release Drafter:
1. Bump `package.json` version (script or manual).
2. Merge to `master` (draft release updates automatically).
3. Push tag `vX.Y.Z` to trigger publish.
4. Release workflow packs, publishes to npm, creates GitHub Release (simple notes; you can edit draft first).

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

1. Ensure `dev` is fully merged and stable.
2. Open PR: `dev` → `master` (all checks green, review).
3. On `master`, bump version in `package.json` (e.g. `0.2.0`). Commit with `chore(release): v0.2.0`.
4. Push tag:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
5. Wait for `release.yml` workflow to finish (npm publish + GitHub Release).
6. Sync `dev`:
   ```bash
   git checkout dev
   git pull
   git merge master   # or rebase dev onto master
   git push
   ```
7. Optionally edit the GitHub Release notes (they are simple by default); Release Drafter will reset a new draft for future changes.

To skip CI for non-critical doc-only commits you can append `[skip ci]` to the commit message (use sparingly).

## Required Secrets

## Required & Optional Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` | For publishing | Auth token with publish rights to npm registry (automation / granular token recommended) |
| `CODECOV_TOKEN` | Optional | Reliable Codecov uploads for coverage reporting |

Add via: Repository → Settings → Secrets and variables → Actions → New repository secret.

`GITHUB_TOKEN` is automatically provided and used for draft releases, artifact uploads, and labeling.

Security tip: Restrict `NPM_TOKEN` to package publish only and rotate periodically.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Release workflow skipped | No tag or tag not matching `v*` | Use `v1.2.3` pattern |
| Publish failed auth | Missing / invalid `NPM_TOKEN` | Recreate token, add as secret |
| Coverage not on Codecov | Missing token or job matrix mismatch | Add `CODECOV_TOKEN`, confirm path `coverage/lcov.info` |
| Draft release empty | PR labels missing conventional prefixes | Ensure commit/PR titles follow convention |

## Future Enhancements (Optional)

- Add bundle size limits (e.g. `andresz1/size-limit-action`).
- Introduce semantic-release if fully automated versioning desired.
- Add Dependabot for dependency update PRs.
- Add `codeql` workflow for security scanning.