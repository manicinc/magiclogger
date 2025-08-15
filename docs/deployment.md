# Deployment & Release Guide

This document explains how to publish a new version of `magiclogger` to npm, update GitHub release notes, and manage required credentials.

## Overview

Releases are tag-driven:
1. Prepare & validate on `dev`.
2. Merge `dev` → `master` via PR.
3. Bump version in `package.json` on `master`.
4. Tag the commit `vX.Y.Z` and push tag.
5. GitHub Actions (`release.yml`) builds, packs, publishes to npm, and creates a GitHub Release.

No publish occurs without a semver tag (`v*`). Draft release notes are maintained continuously by Release Drafter.

## Required Credentials

| Credential | Location | Purpose | Notes |
|------------|----------|---------|-------|
| `NPM_TOKEN` | GitHub Repo → Settings → Secrets → Actions | Publish to npm registry | Use automation token with publish scope only |
| `CODECOV_TOKEN` (optional) | Same | Coverage upload reliability | Not required for release |
| (none for Trivy) | — | Secret scanning in CI | Trivy requires no API keys or license for this workflow |

### Creating an npm Automation Token
1. Log into https://www.npmjs.com/.
2. Go to Access Tokens → Generate New Token → Automation.
3. Copy token (visible once) and add to GitHub as `NPM_TOKEN` secret.
4. If part of an org scope, ensure package name permissions are granted.

Security best practices:
- Use **Automation** token type, not classic.
- Rotate at least every 6–12 months.
- Revoke immediately if exposed.

## Pre-Release Checklist (Local)

From latest `dev`:
```bash
git checkout dev
git pull --rebase origin dev
pnpm install
pnpm preflight
```
Ensure:
- Lint passes
- Tests & coverage meet thresholds
- Build succeeds (`dist/` created)
- No unexpected size regressions in `scripts/analyze-build.js`

## Promote `dev` to `master`
```bash
git checkout master
git pull origin master
# Merge (or rebase) dev
git merge --no-ff dev   # or: git rebase dev
# Resolve conflicts if any
pnpm preflight
git push origin master
```
A Release Drafter update occurs (draft release notes).

## Version Bump
Choose semantic bump (patch/minor/major). Update `package.json` version manually or via script:
```bash
node scripts/version-bump.js patch   # or minor | major
```
Commit the bump:
```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(release): vX.Y.Z"
git push origin master
```

(Optional) Inspect the draft release on GitHub and edit sections if desired.

## Tag & Publish
Tag the exact release commit:
```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```
This triggers `release.yml`:
1. Validates tag format
2. Builds package (tsup)
3. Packs tarball (`pnpm pack`) to `dist/`
4. Publishes to npm with provenance (if provenance supported)
5. Creates GitHub Release attaching tarball

Monitor the Actions tab until success.

## Post-Release Actions
- Verify npm: https://www.npmjs.com/package/magiclogger
- Pull updated `master` to `dev`:
  ```bash
  git checkout dev
  git pull
  git merge master   # keep dev in sync
  git push
  ```
- Communicate release (Changelog / Release Notes).
- Optionally pin version in internal consumers to test.

## Hotfix Flow
1. Branch from `master`: `fix/hotfix-crash`.
2. Implement & `pnpm preflight`.
3. PR → `master` (NOT dev).
4. After merge: bump patch version, tag, publish.
5. Merge `master` back into `dev`.

## Rollback Strategy
If a release is broken:
1. Deprecate problematic version on npm:
   ```bash
   npm deprecate magiclogger@X.Y.Z "Critical issue: <brief reason>"
   ```
2. Revert commit or apply fix → new patch bump/tag.
3. Communicate in release notes / README.

## Draft Release Notes Editing
Release Drafter composes notes grouped by labels:
- Apply labels (feat, fix, chore, perf, docs, breaking) to PRs.
- Before tagging, open Draft Release → refine text.
- After tagging, the manual GitHub Release content (from `release.yml`) is simple; you can copy enriched draft text if needed.

## Adding a New Secret
```text
Repository → Settings → Secrets and variables → Actions → New repository secret
Name: NPM_TOKEN
Value: <paste token>
```
Secrets are environment‑scoped automatically per workflow; no plaintext logging.

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
A: Deliberately disabled. Only tags (usually on `master`) trigger publish.

**Q: How do I merge dev → master without triggering a version bump or including changes in the next draft release?**  
A: Apply the PR label `skip-release` (and optionally `skip-changelog`). The label:
  - Excludes the PR from Release Drafter notes
  - Signals reviewers no version bump is expected
You must also avoid pushing a `v*` tag. Without a tag, no publish happens.
  - A guard workflow (`skip-release-guard.yml`) will fail the PR if a version bump is detected while the label is set.

**Q: Do I need to run `npm publish` locally?**  
A: No—CI handles publish on tag push.

**Q: How do I test a build before release?**  
A: Use `pnpm pack` locally or install from a Git ref via `npm install github:manicinc/magiclogger#<commit>`.

**Q: Provenance failed?**  
A: Ensure Git client supports signed provenance (Node 18+, Actions OIDC) and that `npm publish` flag `--provenance` is allowed for your account.

## Future Enhancements
- Optional semantic-release adoption for fully automated versioning.
- Signed tags (GPG) for extra trust.
- Add size-limit action to guard bundle growth.
- Add CodeQL / OSS scan for security.

---
_Last updated: 2025-08-15_
