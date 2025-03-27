# Publishing Instructions

This document explains how to build, deploy, and publish the Magiclogger package to npm and GitHub Packages.

## Table of Contents

- [Preparing for Release](#preparing-for-release)
- [Package Versioning](#package-versioning)
- [Publishing to npm](#publishing-to-npm)
- [Publishing to GitHub Packages](#publishing-to-github-packages)
- [Creating GitHub Releases](#creating-github-releases)
- [Automating Releases with GitHub Actions](#automating-releases-with-github-actions)

## Preparing for Release

Before publishing a new version, ensure that:

1. All tests pass: `npm test`
2. Code passes linting: `npm run lint`
3. Documentation is up-to-date
4. CHANGELOG.md is updated with the latest changes
5. Version number is updated in package.json

## Package Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

To update the version, use one of these npm commands:

```bash
# For a patch release (1.0.0 -> 1.0.1)
npm version patch

# For a minor release (1.0.0 -> 1.1.0)
npm version minor

# For a major release (1.0.0 -> 2.0.0)
npm version major
```

These commands will:
1. Update the version in package.json
2. Create a Git tag
3. Run the version script from package.json (format code and git add)
4. Commit the changes

## Publishing to npm

### One-time Setup

If you haven't published to npm before:

1. Create an npm account if you don't have one: [npm signup](https://www.npmjs.com/signup)
2. Log in from the command line:
   ```bash
   npm login
   ```

### Publishing a New Version

1. Make sure you're in the main branch with the latest changes:
   ```bash
   git checkout main
   git pull
   ```

2. Build the package:
   ```bash
   npm run build
   ```

3. Publish to npm:
   ```bash
   npm publish
   ```

### Publishing a Beta Version

For testing before an official release:

```bash
# Update version with beta tag
npm version prerelease --preid=beta

# Publish with beta tag
npm publish --tag beta
```

Users can install the beta with:
```bash
npm install magiclogger@beta
```

## Publishing to GitHub Packages

### One-time Setup

1. Create a Personal Access Token on GitHub with `read:packages`, `write:packages` permissions
2. Create or edit a `.npmrc` file in your home directory:
   ```
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

3. Add GitHub registry to your project's `.npmrc`:
   ```
   @OWNER:registry=https://npm.pkg.github.com
   ```

4. Update `package.json` to include the GitHub registry:
   ```json
   "publishConfig": {
     "registry": "https://npm.pkg.github.com"
   }
   ```

### Publishing to GitHub Packages

```bash
# Build the package
npm run build

# Publish to GitHub Packages
npm publish
```

## Creating GitHub Releases

After publishing, create a GitHub release:

1. Go to your repository on GitHub
2. Click "Releases" in the sidebar
3. Click "Draft a new release"
4. Select the tag version you created
5. Add a title (typically the version number)
6. Add a description of the changes (can be from your CHANGELOG.md)
7. Attach the built package if desired
8. Publish the release

## Automating Releases with GitHub Actions

You can automate the release process using GitHub Actions.

### Setup GitHub Action Workflow

Create a file at `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Setup for GitHub Packages
        uses: actions/setup-node@v3
        with:
          registry-url: 'https://npm.pkg.github.com'
      
      - name: Publish to GitHub Packages
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body_path: CHANGELOG.md
          files: |
            LICENSE.md
            README.md
            dist/*.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Using the Automated Workflow

With this setup, releases happen automatically when you push a version tag:

```bash
# Update version, create tag, and push
npm version patch
git push --follow-tags
```

### Required Secrets

Set up these secrets in your GitHub repository:

- `NPM_TOKEN`: Your npm access token

The `GITHUB_TOKEN` is provided automatically by GitHub Actions.

## Release Checklist

Use this checklist for each release:

1. [ ] Update CHANGELOG.md with new version changes
2. [ ] Ensure all tests pass (`npm test`)
3. [ ] Ensure code passes linting (`npm run lint`)
4. [ ] Bump version (`npm version [patch|minor|major]`)
5. [ ] Push changes and tags (`git push --follow-tags`)
6. [ ] Verify GitHub Action completed successfully
7. [ ] Verify package is available on npm
8. [ ] Verify package is available on GitHub Packages
9. [ ] Check the GitHub Release page