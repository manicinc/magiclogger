# Development Guide

This document covers development setup and workflow for Magiclogger.

## Environment Setup

Magiclogger supports environment variables for configuration during development. These are not required for production use of the library.

### Environment Variables

You can use the following environment variables during development:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_VERBOSE` | Enable verbose logging during development | `false` |
| `LOG_TO_FILE` | Write logs to disk | `false` |
| `LOG_DIR` | Custom log directory | `./logs` |

For CI/CD and advanced features, these optional variables may be used:

| Variable | Description | Required For |
|----------|-------------|-------------|
| `NPM_TOKEN` | NPM authentication token | Publishing to npm |
| `GITHUB_TOKEN` | GitHub authentication token | Creating releases and interacting with GitHub API |
| `CODECOV_TOKEN` | Codecov.io token | Uploading coverage reports (optional) |

**Note**: For local development, you can create a `.env` file in your project root with these variables. This file should not be committed to Git.

## Development Workflow

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development mode**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Check coverage**
   ```bash
   npm run test:coverage
   ```

5. **Format code**
   ```bash
   npm run format
   ```

6. **Lint code**
   ```bash
   npm run lint
   ```

## Test Coverage

Magiclogger maintains high test coverage standards. You can view the current coverage report with:

```bash
npm run test:coverage
```

Coverage reports are saved to the `coverage/` directory. The required thresholds are:
- Statements: 95%
- Branches: 95%
- Functions: 95%
- Lines: 95%

### Coverage Reporting (Optional)

For public coverage reporting and tracking, Magiclogger can optionally use [Codecov](https://codecov.io/). See [Codecov Integration](codecov.md) for setup instructions.

## Local Release Testing

To test the release process locally without publishing:

```bash
# Test patch version bump
node scripts/version-bump.js patch

# Test minor version bump
node scripts/version-bump.js minor

# Test major version bump
node scripts/version-bump.js major
```

This will simulate the version bump, changelog generation, and git tagging without pushing anything.

## Commit Messages

Magiclogger uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning. Format your commit messages as:

```
<type>(<scope>): <description>
```

Common types:
- `feat`: A new feature (triggers minor version bump)
- `fix`: A bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or tools

For breaking changes, add `!` after the type or include a `BREAKING CHANGE:` footer.