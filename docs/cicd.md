# CI/CD Setup

Magic Logger uses GitHub Actions for continuous integration and delivery. This document explains the CI/CD pipeline and how to work with it.

## Table of Contents

- [CI/CD Overview](#cicd-overview)
- [Workflow Files](#workflow-files)
- [Automatic Versioning](#automatic-versioning)
- [Commit Message Conventions](#commit-message-conventions)
- [Optional Integrations](#optional-integrations)
- [Manual Release Process](#manual-release-process)
- [Required Secrets](#required-secrets)

## CI/CD Overview

Magic Logger has a fully automated workflow that:

1. Runs tests on multiple Node.js versions
2. Verifies code quality with linting
3. Checks test coverage thresholds
4. Automatically versions packages based on commit messages
5. Publishes to npm when merged to main/master branch
6. Creates GitHub releases with proper changelogs
7. Updates documentation and coverage badges

## Workflow Files

The CI/CD pipeline is defined in two main workflow files:

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on all pull requests and pushes to main/master
   - Tests code on multiple Node.js versions
   - Runs linting checks
   - Verifies test coverage
   - Optionally uploads coverage to Codecov (if enabled)

2. **Release Workflow** (`.github/workflows/release.yml`)
   - Runs only on pushes to main/master
   - Verifies tests pass
   - Uses semantic-release to:
     - Determine the version bump based on commit messages
     - Update the changelog
     - Publish to npm
     - Create a GitHub release
   - Updates coverage badges and documentation

## Automatic Versioning

Magic Logger uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) to automate version management. This tool:

1. Analyzes commit messages to determine the appropriate version bump
2. Creates a CHANGELOG from commit messages
3. Tags the repository with the new version
4. Publishes to npm

The specific configuration is in `.releaserc` file.

## Commit Message Conventions

For the automatic versioning to work correctly, commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

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

## Optional Integrations

### Codecov Integration

The CI workflow includes optional integration with [Codecov](https://codecov.io/) for tracking code coverage over time. To enable:

1. Sign up at [Codecov.io](https://codecov.io/)
2. Add your repository
3. Get your Codecov token
4. Add it as a GitHub secret named `CODECOV_TOKEN`
5. Uncomment the Codecov section in `.github/workflows/ci.yml`

See [Codecov Integration](codecov.md) for detailed setup instructions.

## Manual Release Process

While releases should normally happen automatically, you can manually trigger the release process:

1. **Local version bump** (for testing):
   ```bash
   node scripts/version-bump.js [patch|minor|major]
   ```

2. **Manual release trigger**:
   ```bash
   npm run semantic-release
   ```

3. **Skip CI** (if needed):
   Add `[skip ci]` to your commit message to prevent CI from running:
   ```bash
   git commit -m "chore: update docs [skip ci]"
   ```

## Required Secrets

For the CI/CD pipeline to work correctly, you need to set up this GitHub secret:

1. `NPM_TOKEN` - An npm access token with publish permissions

The workflows use the built-in `GITHUB_TOKEN` that's automatically provided by GitHub Actions for other operations.

### Optional Secrets:

1. `CODECOV_TOKEN` - Only needed if enabling Codecov integration

### Setting up secrets:

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the required secrets