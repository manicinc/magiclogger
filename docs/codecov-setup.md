# Codecov Setup Instructions

## Current Issue
The codecov badge in README.md shows as not working because the repository needs to be properly configured with Codecov.

## Setup Steps

1. **Register the repository with Codecov**
   - Go to https://app.codecov.io/gh
   - Sign in with GitHub
   - Find and activate the `manicinc/magiclogger` repository
   - Copy the upload token

2. **Configure GitHub Secrets**
   - Go to GitHub repo settings → Secrets and variables → Actions
   - Add new secret: `CODECOV_TOKEN` with the token from step 1

3. **Update the CI workflow (if needed)**
   The current CI workflow is already configured correctly at `.github/workflows/ci.yml`:
   - Runs tests with coverage
   - Uploads to codecov using `codecov/codecov-action@v5`
   - Uploads with the `CODECOV_TOKEN` secret, and fails the job when that upload does not reach Codecov; Codecov takes an upload without a token only from a fork's pull request

4. **Fix the badge URL**
   The current badge points to master branch, but the default branch might be different.
   Update in README.md:
   ```markdown
   <!-- Current -->
   <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg" alt="codecov"/></a>
   
   <!-- If main branch is used -->
   <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/graph/badge.svg" alt="codecov"/></a>
   ```

## Current Configuration

### CI Workflow (`.github/workflows/ci.yml`)
- ✅ Runs on push to master, main, dev branches
- ✅ Generates coverage with Jest
- ✅ Uploads lcov.info to Codecov
- ✅ Uses latest codecov action (v5)

### Coverage Generation
- ✅ Tests generate coverage in `coverage/lcov.info`
- ✅ Coverage reports are created successfully
- ✅ HTML reports available in `coverage/index.html`

### Codecov Configuration (`codecov.yml`)
- ✅ Requires CI to pass
- ✅ Coverage range 70-100%
- ✅ `codecov/project` passes a drop of up to 5%, and `codecov/patch` needs 70% of the changed lines (10% leeway)
- ✅ A status fails when Codecov has no report for the commit
- ✅ Comments on PRs enabled

## Verification

After setup, verify by:
1. Pushing a commit to trigger CI
2. Check https://app.codecov.io/gh/manicinc/magiclogger for coverage reports
3. Badge should show coverage percentage

## Alternative Badge URLs

If the standard badge doesn't work, try:
```markdown
<!-- Branch-agnostic -->
![codecov](https://codecov.io/gh/manicinc/magiclogger/graph/badge.svg?token=YOUR_TOKEN)

<!-- Specific branch -->
![codecov](https://codecov.io/gh/manicinc/magiclogger/branch/dev/graph/badge.svg)

<!-- Shields.io alternative -->
![Coverage](https://img.shields.io/codecov/c/github/manicinc/magiclogger)
```