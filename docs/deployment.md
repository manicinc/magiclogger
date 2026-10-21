# Deployment & Release Guide

This document explains how a new version of `magiclogger` reaches npm and GitHub Releases, how npm authenticates the publish, and how to run or check a release by hand.

## Overview

Releases are made by [semantic-release](https://github.com/semantic-release/semantic-release) in the Release workflow, `.github/workflows/releases.yml`, with the plugins and rules in `.releaserc`. The workflow's release job runs on `master` in two cases:

- a push to `master` whose commit message starts with `feat:`, `fix:` or `perf:`, or contains `BREAKING CHANGE` (a scoped `feat(api):` does not match);
- a manual run on `master` (see [Run a Release by Hand](#run-a-release-by-hand)).

A merge commit's message starts with `Merge pull request`, so after a pull request is merged with a merge commit, run the release by hand to release what it brought. The workflow also runs when a pull request into `master` is merged, and semantic-release then stops with "This run was triggered by a pull request and therefore a new version won't be published".

The release job runs the lint, the test suite with coverage, the build, the packed-files and release-asset checks and the coverage badge update, then semantic-release. semantic-release reads the commits since the last `v*` tag. When they call for a release (`feat` a minor, `fix`, `perf` and `revert` a patch, a breaking change a major; `build`, `chore`, `ci`, `docs`, `refactor`, `style` and `test` none), it:

1. commits `package.json` and `CHANGELOG.md` as `chore(release): X.Y.Z [skip ci]` and pushes the commit,
2. tags that commit `vX.Y.Z`,
3. publishes the version to npm,
4. creates the GitHub Release with the packed tarball, `LICENSE.md` and `README.md`.

## npm Authentication

npm accepts the publish through the package's trusted publisher, which names `manicinc/magiclogger` and `releases.yml`. In `verifyConditions`, `@semantic-release/npm` 13 exchanges the job's GitHub OIDC token with the registry and logs `OIDC token exchange with the npm registry succeeded`, and `npm publish` (npm 11) makes its own exchange. A release needs no npm token, and npm attaches a provenance statement to each version published this way from this public repository ([npm: trusted publishing](https://docs.npmjs.com/trusted-publishers)).

The release step still receives the `NPM_TOKEN` secret, as a fallback for a failed exchange.

semantic-release 21 loads `@semantic-release/npm` from its own dependencies before the project's, so `pnpm-workspace.yaml` overrides that dependency with the version `package.json` names.

**Who can publish.** The trusted publisher names no GitHub environment, so a run of `releases.yml` from any branch of this repository can make the exchange, and anyone with write access to the repository can publish. A GitHub environment that admits `master` only, named on the trusted publisher and in the release job, would narrow that to runs on `master`.

## Run a Release by Hand

Run the Release workflow on `master` with `dry_run` off, from the Actions tab (the "Release" workflow that offers **Run workflow**) or with the GitHub CLI:

```bash
gh workflow run releases.yml --ref master
```

The release job runs as above; semantic-release releases only when the commits since the last tag call for it.

## Check a Release Without Making One

Run the same workflow with `dry_run` on, on any branch:

```bash
gh workflow run releases.yml --ref <branch> -f dry_run=true
```

The "Release dry run" job installs with scripts off and runs `semantic-release --dry-run --branches <branch>` with no npm token in reach. It checks push access, the OIDC exchange with npm and the commit analysis, and logs the version and notes it would release. It publishes, tags and pushes nothing.

## Tags Pushed by Hand

A `v*` tag pushed by hand runs `.github/workflows/release.yml`. It checks the tag format, builds and packs the package and creates a GitHub Release for the tag with the tarball. It does not publish to npm. Tags made by semantic-release never run it: they are pushed with `GITHUB_TOKEN`, and GitHub starts no workflow for events made with that token ([GitHub: GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)).

## Local Checks

Before opening a pull request that should release, run the full local checks:

```bash
pnpm install
pnpm preflight
```

Ensure:
- Lint passes
- Tests & coverage meet thresholds
- Build succeeds (`dist/` created)
- No unexpected size regressions in `scripts/analyze-build.js`

## Rollback Strategy

If a release is broken:
1. Deprecate the version on npm:
   ```bash
   npm deprecate magiclogger@X.Y.Z "Critical issue: <brief reason>"
   ```
2. Revert the commit or fix it with a `fix:` commit; the next release publishes a new patch.
3. Communicate in release notes / README.

## Release Notes

semantic-release writes each GitHub Release's notes and the `CHANGELOG.md` entry from the conventional commits since the previous tag. Release Drafter keeps a separate draft release whose notes group merged pull requests by label (feat, fix, chore, perf, docs, breaking).

## Secrets

| Secret | Location | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` (optional) | GitHub Repo → Settings → Secrets → Actions | Fallback for the release step when the OIDC exchange fails; a release needs no npm token |
| `CODECOV_TOKEN` (optional) | Same | Coverage upload reliability |
| (none for Trivy) | — | Trivy requires no API keys or license for this workflow |

`GITHUB_TOKEN` is provided by GitHub Actions; semantic-release uses it to push the release commit and the tag and to create the GitHub Release.

If `NPM_TOKEN` is set, keep it a granular token limited to publishing this package.

## CI Gate Expectations
| Gate | Requirement |
|------|-------------|
| Lint | No ESLint errors (warnings acceptable) |
| Type | No TypeScript errors (`tsc --noEmit`) |
| Tests | All pass on matrix |
| Coverage | ~95% target (enforced via docs + Codecov threshold if enabled) |
| Build | Bundle builds (CJS + ESM) |
| Secret Scan | Trivy reports no hardcoded secrets in the repo |

## Frequently Asked Questions
**Q: Can I publish from a feature branch?**  
A: No. `.releaserc` releases from `master` (and `main`) only, and the release job runs only there. A dry run works on any branch and publishes nothing.

**Q: How do I keep a pull request out of the release notes?**  
A: Apply the label `skip-release` (optionally also `skip-changelog`). Release Drafter leaves the pull request out of its draft, and `skip-release-guard.yml` fails the pull request if it changes the version in `package.json` or carries a release-style commit message while the label is set. Its conventional commits still count in the next semantic-release run.

**Q: Do I need to run `npm publish` locally?**  
A: No. The release job publishes through the trusted publisher.

**Q: How do I test a build before release?**  
A: Use `pnpm pack` locally or install from a Git ref via `npm install github:manicinc/magiclogger#<commit>`.

**Q: Where does the provenance statement come from?**  
A: npm generates it for each trusted publish from this public repository; the release needs no `--provenance` flag.

## Future Enhancements
- Signed tags (GPG) for extra trust.
- Add size-limit action to guard bundle growth.
- Add CodeQL / OSS scan for security.

---
_Last updated: 2026-10-21_
