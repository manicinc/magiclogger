# CI/CD Setup

Magiclogger uses GitHub Actions for continuous integration and for releases to npm. This document explains the pipeline, the secrets it uses and how a change on `master` becomes an npm release.

## Table of Contents

- [CI/CD Overview](#cicd-overview)
- [Workflow Files](#workflow-files)
- [Dependency updates](#dependency-updates)
- [Versioning Strategy](#versioning-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Release Procedure](#release-procedure)
- [Required & Optional Secrets](#required--optional-secrets)
- [Future Enhancements (Optional)](#future-enhancements-optional)

## CI/CD Overview

Magiclogger CI currently does:

1. Pre‑checks (commit lint, large file warning, and `scripts/check-git-add-paths.js`, which fails when a `git add` in a workflow, a package.json script, a git hook or a script under `scripts/` names a path that matches no tracked file)
2. Lint, type-check, formatting verification, basic audit
3. Tests with coverage on Node 22 (Ubuntu)
4. Build artifacts (ESM + CJS) and upload dist and the packed tarball
5. `runtime-floor`: installs the packed tarball with npm on the oldest Node that `engines.node` in `package.json` allows (16.11.0) and loads the CommonJS and ESM entry points (`scripts/check-runtime-floor.cjs`); `all-checks` fails when any job it needs did not succeed
6. Draft release notes maintenance (Release Drafter) when on `master` / `main`
7. Coverage upload to Codecov ([Test Coverage](./test_coverage.md))
8. Secret scanning with Trivy (free, no license required)

Releases to npm are made by semantic-release in `releases.yml`, through npm's trusted publisher; see [Release Procedure](#release-procedure).

## Documentation Structure

### Single Source of Truth

The documentation lives in `docs/`, and the Docusaurus site in `website/` reads it from there: `website/docusaurus.config.ts` sets the docs plugin's `path` to `'../docs'`, so no page is copied before a build. TypeDoc writes the API pages to `website/static/api` (`typedoc.json`).

### How It Works

1. **Local development**: edit a page in `docs/`, then preview the site:
   ```bash
   cd website
   pnpm run start
   ```

2. **CI/CD build**: `scripts/build-docs-site.sh` installs the workspace, builds the library, generates the API pages and builds the Docusaurus site into `website/build`. `docs-build.yml` runs it on pull requests and deploys nothing; `deploy-docs.yml` runs it after a push to `master` and publishes `website/build` to the `gh-pages` branch, which GitHub Pages serves. Both run the same setup first (pnpm, Node 22 with setup-node's pnpm store cache) and restore no `node_modules`, so the pull-request check builds from the state the deploy builds from. The deploy passes the real `GA_TRACKING_ID` and `MS_CLARITY_ID`; `docs-build.yml` passes stand-ins and checks that `website/build/index.html` carries the Google Analytics and Clarity tags, then starts `docusaurus start` and checks that the dev server serves the page and its bundle.

### Adding New Documentation

1. Create the page in `docs/`:
   ```bash
   echo "# My New Feature" > docs/my-feature.md
   ```

2. Add it to `website/sidebars.js`, which lists the pages of the sidebar.

3. Preview it:
   ```bash
   cd website && pnpm run start
   ```

## Workflow Files

The pipeline is defined in these workflow files:

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Core CI: pre-check, quality, matrix tests, build, draft update |
| `.github/workflows/auto-format.yml` | By hand: formats a branch and commits the result. Push once more afterwards: a commit made with `GITHUB_TOKEN` starts no workflow, so that head reports no `all-checks` |
| `.github/workflows/auto-label.yml` | Auto label PRs (paths + conventional commit types + size) |
| `.github/workflows/release-drafter.yml` | Maintain draft release notes on PR merges / label changes |
| `.github/workflows/releases.yml` | Release: semantic-release on `master` (a release-bearing push or a manual run), npm through the trusted publisher; dry runs on any branch |
| `.github/workflows/release.yml` | A `v*` tag pushed by hand: build + GitHub Release (no npm publish) |
| `.github/workflows/lockfile.yml` | Resolves `pnpm-lock.yaml` as an artifact when a branch push changes `package.json`, `website/package.json` or `pnpm-workspace.yaml`; run by hand with `-f update='<packages>'`, it moves those packages to the highest version their dependents allow, at every depth (see [Dependency updates](#dependency-updates)) |
| `.github/workflows/docs-build.yml` | Builds the documentation site with `scripts/build-docs-site.sh`, the script `deploy-docs.yml` runs, and deploys nothing, on a pull request that changes `docs/`, `website/`, `src/`, `README.md`, `tsconfig.json`, `typedoc.json`, the build configuration, the manifests, `pnpm-lock.yaml` or that script |
| `.github/workflows/deploy-docs.yml` | After a push to `master` that changes a path `docs-build.yml` watches: builds the site with `scripts/build-docs-site.sh` and publishes `website/build` to `gh-pages`. It is the one workflow that publishes the site, and a manual run publishes from `master` only |

Versions come from semantic-release, configured in `.releaserc`.

## Dependency updates

`pnpm-lock.yaml` is resolved in CI, never on a developer's machine; installs, on a developer's machine and in the CI jobs, read the committed lockfile. A locked version that still satisfies its dependents stays locked, so a patched release of a transitive dependency reaches `pnpm-lock.yaml` only through an update:

```bash
gh workflow run lockfile.yml -R manicinc/magiclogger --ref <branch> -f update='qs express jest @docusaurus/*'
gh run download <run-id> -R manicinc/magiclogger -n pnpm-lock
```

The job runs `pnpm update --recursive --include-workspace-root --depth Infinity --no-save --lockfile-only` with the names given and leaves the specifiers in `package.json` as they are. pnpm re-resolves a matching package only inside the trees of the direct dependencies (of the library or of `website/`) that the names also match, so the input names both: the packages to move and the direct dependencies whose trees hold them, which move to the highest version their own range allows. A name that matches no direct dependency changes nothing, and without `--include-workspace-root` the library's own dependencies stay as they are. The input takes names and patterns only: a word that starts with a dash (an option such as `--latest`) or that carries a version (`jest@30.0.0`; the `@` of a scope such as `@docusaurus/*` is fine) stops the run, since both move packages past the ranges `package.json` declares, and an input of spaces alone resolves the manifests as an empty one does. Each run's artifact is the whole lockfile resolved from the commit it ran on, so two runs from one commit each lose the other's changes: name every package in one run, or commit one artifact before starting the next. The step is `scripts/lockfile-resolve.sh`, which `tests/integration/lockfile-resolve.test.ts` runs with a stand-in pnpm. The optional peers pnpm installs for the tests are never selected; `ws` and `@aws-sdk/client-s3` are devDependencies for that reason. When a dependent pins a vulnerable version, an entry under `overrides` in `pnpm-workspace.yaml` sets a floor; each one carries the advisory and the reason beside it.

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

semantic-release sets each version from the conventional commits since the last `v*` tag (`.releaserc`): `feat` a minor, `fix`, `perf` and `revert` a patch, a breaking change a major; the other types release nothing. It tags the version, publishes it to npm and creates the GitHub Release, and commits nothing to `master`. Release Drafter keeps a separate draft of the notes, grouped by pull request label.

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

The `BREAKING CHANGE:` footer is what counts. The `angular` preset in `.releaserc` does not read the `!` in a header, so `feat!: ...` with no footer releases nothing.

## Coverage & Codecov

Coverage is generated by `pnpm test:coverage` (Jest), and the test-linux job (Ubuntu, Node 22) uploads `coverage/lcov.info` to Codecov with the `CODECOV_TOKEN` secret. When the secret is set, an upload that does not reach Codecov fails the job. Pull requests from forks and from Dependabot run without it: a fork's upload goes without a token, and Dependabot's needs `CODECOV_TOKEN` as a Dependabot secret too while the organisation requires tokens for its public repositories ([Codecov: tokens](https://docs.codecov.com/docs/codecov-tokens)).

`codecov.yml` sets the `codecov/patch` and `codecov/project` statuses, and both fail when Codecov has no report for the commit; [Test Coverage](./test_coverage.md) has the details, and which of them Codecov reports. The coverage badge in the README and in Test Coverage reads Codecov's figure for `master`. No workflow commits a coverage badge.

## Release Procedure

The [Deployment & Release Guide](./deployment.md) has the details. In short:

1. Merge pull requests into `master` with green checks.
2. A push to `master` whose commit message starts with `feat:`, `fix:`, `perf:` or `revert:`, a scoped form such as `fix(api):`, or `Revert "` (or contains `BREAKING CHANGE`), runs the release job. After a merge commit, run it by hand: `gh workflow run releases.yml --ref master`.
3. semantic-release tags the version, publishes to npm through the trusted publisher (no npm token) and creates the GitHub Release, when the commits since the last tag call for a release.
4. To check a release without making one, on any branch: `gh workflow run releases.yml --ref <branch> -f dry_run=true`.

Keep `[skip ci]` out of a pull request's last commit: GitHub starts no CI run for it, `all-checks` stays pending and the merge is blocked ([GitHub: Skip workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)).

## Required & Optional Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` | Optional | Fallback for the release step when the OIDC exchange with npm's trusted publisher fails; a release needs no npm token |
| `CODECOV_TOKEN` | For coverage | Authorises the Codecov upload from pushes and from this repository's pull requests; when it is set, an upload that fails fails the job |
| (none for Trivy) | — | Trivy secret scan requires no license or API keys |

Add via: Repository → Settings → Secrets and variables → Actions → New repository secret.

`GITHUB_TOKEN` is automatically provided and used for draft releases, artifact uploads, labeling, and by semantic-release for the tag and the GitHub Release.

If `NPM_TOKEN` is set, keep it a granular token limited to publishing this package.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Release job skipped on a push | The commit message does not start with `feat`, `fix`, `perf` or `revert`, or with `Revert "` (a merge commit never does) | Run it by hand: `gh workflow run releases.yml --ref master` |
| `Format check` fails in `quality` | The pull request's formatting differs from Prettier's | Run `pnpm run format` and push |
| A push to `master` is refused | `master`'s ruleset requires the `all-checks` job with no bypass | Open a pull request |
| `verifyConditions` fails in `@semantic-release/npm` | The OIDC exchange failed (the log gives the status) and there is no valid `NPM_TOKEN` | Check that the package's trusted publisher on npmjs.com names `manicinc/magiclogger` and `releases.yml`, then check with a dry run |
| Coverage not on Codecov | Missing token or job matrix mismatch | Add `CODECOV_TOKEN`, confirm path `coverage/lcov.info` |
| Draft release empty | PR labels missing conventional prefixes | Ensure commit/PR titles follow convention |

## Future Enhancements (Optional)

- Add bundle size limits (e.g. `andresz1/size-limit-action`).
- Add Dependabot for dependency update PRs.
- Add `codeql` workflow for security scanning.