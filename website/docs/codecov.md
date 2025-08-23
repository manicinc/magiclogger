---
id: codecov
title: Codecov
---

# Codecov Integration (Optional)

Magic Logger supports optional integration with [Codecov](https://codecov.io/) for tracking code coverage metrics over time. This document explains how to set up and use this integration.

## What is Codecov?

Codecov is a code coverage reporting tool that helps developers monitor how well their code is tested. It provides:

- Coverage trend visualizations
- PR checks for coverage changes
- Branch and file-level coverage reporting
- Badges for your README

## Setting Up Codecov

1. **Sign up for Codecov**
   - Go to [Codecov.io](https://codecov.io/)
   - Sign in with your GitHub account
   - Add your repository

2. **Get your Codecov token**
   - In your Codecov dashboard, navigate to Settings > Repository
   - Find your Codecov token

3. **Add the token to GitHub Secrets**
   - Go to your GitHub repository
   - Click on "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

4. **Enable Codecov in your CI workflow**
   - Open `.github/workflows/ci.yml`
   - Ensure the Codecov step is present (this repo already has it):

   ```yaml
   - name: Upload to Codecov
     uses: codecov/codecov-action@v4
     with:
       token: ${{ secrets.CODECOV_TOKEN }} # optional for public repos
       files: ./coverage/lcov.info
       flags: unittests
       fail_ci_if_error: false
       verbose: true
   ```

## Adding a Codecov Badge

Once set up, you can add a Codecov badge to your README:

```markdown
[![codecov](https://codecov.io/gh/{USERNAME}/{REPO}/branch/master/graph/badge.svg)](https://codecov.io/gh/{USERNAME}/{REPO})
```

Replace:
- `{USERNAME}` with your GitHub username
- `{REPO}` with your repository name
- For public repos, tokenless uploads and badges work by default (no `token` param required)

## Viewing Coverage Reports

After you've pushed code with the integration enabled:

1. Visit [Codecov.io](https://codecov.io/)
2. Select your repository
3. Browse the coverage reports and graphs

## Codecov Configuration

You can customize Codecov's behavior by adding a `codecov.yml` file to your repository. For example:

```yaml
codecov:
  require_ci_to_pass: yes

coverage:
  precision: 2
  round: down
  range: "70...100"
  status:
    project:
      default:
        # Allow coverage to drop by 1% while still considering it a success
        threshold: 1%
    patch: yes
    changes: no

parsers:
  gcov:
    branch_detection:
      conditional: yes
      loop: yes
      method: no
      macro: no

comment:
  layout: "reach,diff,flags,tree"
  behavior: default
  require_changes: no
```

## Why Use Codecov?

Codecov provides several benefits beyond local coverage reporting:

1. **Historical tracking**: See coverage trends over time
2. **PR checks**: Automatically check if PRs decrease coverage
3. **Visualization**: Explore coverage with interactive visualizations
4. **PR comments**: Codecov can comment on PRs with coverage info
5. **Public demonstration**: Show your project's quality to potential users

## Note on Privacy

When using Codecov, your coverage data will be sent to their servers. For public repositories, this is generally not a concern. For private repositories, you may want to review Codecov's privacy policy.