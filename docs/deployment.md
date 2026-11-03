# Deployment & Release Guide

This document explains how a new version of `magiclogger` reaches npm and GitHub Releases, how npm authenticates the publish, and how to run or check a release by hand.

## Overview

Releases are made by [semantic-release](https://github.com/semantic-release/semantic-release) in the Release workflow, `.github/workflows/releases.yml`, with the plugins and rules in `.releaserc`. The workflow's release job runs on `master` in two cases:

- a push to `master` whose commit message starts with `feat:`, `fix:`, `perf:` or `revert:`, a scoped form such as `fix(api):`, or `Revert "`, the message `git revert` writes, or contains a `BREAKING CHANGE:` footer;
- a manual run on `master` (see [Run a Release by Hand](#run-a-release-by-hand)).

The check reads the push's last commit only. A merge commit's message starts with `Merge pull request`, so after a pull request is merged with a merge commit, or after a push whose last commit calls for no release, run the release by hand to release what it brought: semantic-release reads every commit since the last tag.

The release job runs the lint, the test suite with coverage, the build and the packed-files and release-asset checks, then semantic-release. It commits no coverage badge: coverage reaches Codecov from the CI workflow, and the badge reads it there ([Test Coverage](./test_coverage.md)). semantic-release reads the commits since the last `v*` tag. When they call for a release (`feat` a minor, `fix`, `perf` and `revert` a patch, a breaking change a major; `build`, `chore`, `ci`, `docs`, `refactor`, `style` and `test` none), it:

1. tags the commit `vX.Y.Z`,
2. publishes the version to npm,
3. creates the GitHub Release with the packed tarball, `LICENSE.md` and `README.md`.

Nothing is committed to `master`. `master`'s ruleset requires the `all-checks` job with no bypass, and refuses a deletion and a force-push, so it would refuse a release commit. `package.json`'s version on `master` is not the released version; the highest `v*` tag is, and semantic-release sets the version in the package it publishes.

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

### When a Release Fails

semantic-release pushes the tag before it publishes, and a later run takes that tag as the last release, so the recovery depends on how far the run got. Read the log of the Semantic Release step:

- **No `Created tag vX.Y.Z` line:** nothing was released. Fix the cause and run the release again.
- **`Created tag vX.Y.Z`, and `npm view magiclogger@X.Y.Z version` prints nothing:** a second run finds no commits after the tag and publishes nothing. Delete the tag, then run the release again:
  ```bash
  git push origin :refs/tags/vX.Y.Z
  gh workflow run releases.yml --ref master
  ```
- **The version is on npm and the GitHub Release is missing:** the GitHub step runs after npm's, and a second run publishes nothing. Create the release from the tag with the files a release carries, the tarball as npm holds it (`npm pack` with a version fetches the published tarball):
  ```bash
  git checkout vX.Y.Z
  npm pack magiclogger@X.Y.Z
  gh release create vX.Y.Z --verify-tag --generate-notes \
    "magiclogger-X.Y.Z.tgz#Distribution (npm package)" "LICENSE.md#License" "README.md#Readme"
  ```

## Check a Release Without Making One

Run the same workflow with `dry_run` on, on any branch:

```bash
gh workflow run releases.yml --ref <branch> -f dry_run=true
```

The "Release dry run" job installs with scripts off and runs `semantic-release --dry-run --branches <branch>` with no npm token in reach. It checks push access, the OIDC exchange with npm and the commit analysis, and logs the version and notes it would release. It publishes, tags and pushes nothing.

## Tags Pushed by Hand

A `v*` tag pushed by hand runs `.github/workflows/release.yml`. It checks the tag format, builds and packs the package and creates a GitHub Release for the tag with the tarball. It does not publish to npm. Tags made by semantic-release never run it: they are pushed with `GITHUB_TOKEN`, and GitHub starts no workflow for events made with that token ([GitHub: GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)).

semantic-release takes the highest `v*` tag on `master` as the last release. Push a `v*` tag by hand only for a version already on npm (run `npm publish` first, as in the [Publishing Workflow](./publishing.md)); a tag for a version npm never received leaves that version off npm while semantic-release counts it as released.

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

semantic-release writes each GitHub Release's notes from the conventional commits since the previous tag. `CHANGELOG.md` holds the releases through 0.1.1; the GitHub Releases hold the later ones. Release Drafter keeps a separate draft release whose notes group merged pull requests by label (feat, fix, chore, perf, docs, breaking).

## Secrets

| Secret | Location | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` (optional) | GitHub Repo → Settings → Secrets → Actions | Fallback for the release step when the OIDC exchange fails; a release needs no npm token |
| `CODECOV_TOKEN` | Same | Authorises the Codecov upload in the CI workflow; when it is set, an upload that fails fails the job |
| (none for Trivy) | — | Trivy requires no API keys or license for this workflow |

`GITHUB_TOKEN` is provided by GitHub Actions; semantic-release uses it to push the tag and to create the GitHub Release.

If `NPM_TOKEN` is set, keep it a granular token limited to publishing this package.

## CI Gate Expectations
| Gate | Requirement |
|------|-------------|
| Lint | No ESLint errors (warnings acceptable) |
| Type | No TypeScript errors (`tsc --noEmit`) |
| Tests | All pass on matrix |
| Coverage | The upload reaches Codecov and Codecov's `codecov/patch` status passes ([Test Coverage](./test_coverage.md)) |
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
_Last updated: 2026-11-02_
