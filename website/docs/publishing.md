# Publishing Workflow for Magiclogger

## Project Build & Release Ecosystem

Magiclogger uses a comprehensive set of npm scripts and custom Node.js scripts to manage the entire development, build, test, and release process. This document explains the ecosystem, why each script exists, and how they work together.

## 🛠 Scripts Ecosystem

### Development Scripts

| Script | Purpose | What it Does |
|--------|---------|--------------|
| `npm run dev` | Development Watch Mode | Watches source files and rebuilds on changes |
| `npm run check` | Code Quality Check | Runs formatting and linting checks |
| `npm run lint` | Code Linting | Checks code against ESLint rules |
| `npm run lint:fix` | Auto-fix Linting | Automatically fixes linting issues |
| `npm run format` | Code Formatting | Formats code using Prettier |
| `npm run test` | Run Tests | Executes Jest test suite |
| `npm run test:coverage` | Test Coverage | Runs tests and generates coverage report |

### Build & Preparation Scripts

| Script | Purpose | What it Does |
|--------|---------|--------------|
| `npm run clean` | Clean Build Artifacts | Removes previous build outputs and temporary files |
| `npm run build` | Production Build | Compiles TypeScript to JavaScript for distribution |
| `npm run build:examples` | Example Builds | Compiles example scripts |
| `npm run analyze:build` | Build Size Analysis | Generates a table of build output sizes in README |
| `npm run test:coverage:badge` | Coverage Badge | Generates a test coverage badge for README |
| `npm run preflight` | Pre-publish Checks | Comprehensive script running all checks, tests, and builds |

### Release Management Scripts

| Script | Purpose | What it Does |
|--------|---------|--------------|
| `npm run version:bump` | Version & Changelog | Bumps version, updates changelog, creates git tag |
| `npm run release:manual` | Manual Release | Runs preflight, bumps version, prepares for publish |
| `npm run commit` | Conventional Commit | Opens Commitizen for structured commit messages |

## 🔍 Deep Dive: Key Scripts

### `preflight` Script
```json
"preflight": "npm run clean && npm run check && npm run lint && npm run test:coverage && npm run build && npm run test:coverage:badge && npm run analyze:build"
```

This script is the guardian of code quality:
1. Cleans previous builds
2. Checks code formatting
3. Runs linting
4. Executes full test suite with coverage
5. Builds the project
6. Generates coverage badge
7. Analyzes and logs build sizes

### `version:bump` Script
Located at `scripts/version-bump.js`, this comprehensive script:
- Validates version bump type (patch/minor/major)
- Runs pre-bump checks (tests, linting)
- Bumps package version
- Updates README version badge
- Generates coverage badge
- Updates CHANGELOG.md with git logs
- Stages and commits changes
- Creates git tag

### `analyze-build.js` Script
Located at `scripts/analyze-build.js`, this script:
- Measures build output file sizes
- Generates a markdown table
- Injects the table into README.md
- Provides visibility into bundle sizes

### `generate-cover-badge.js`
Located at `scripts/generate-cover-badge.js`, this script:
- Reads Jest coverage reports
- Generates a coverage percentage badge
- Updates README.md
- Updates `docs/test-coverage.md`
- Color-codes badge based on coverage percentage

## 🚀 Typical Workflow

1. Development
   ```bash
   npm run dev           # Start development mode
   npm run test          # Run tests
   npm run lint:fix      # Fix any linting issues
   ```

2. Before Release
   ```bash
   npm run preflight     # Run comprehensive checks
   npm run version:bump patch  # Bump version (patch/minor/major)
   ```

3. Publishing
   ```bash
   git push && git push --tags  # Push code and version tag
   npm publish                  # Publish to npm
   ```

## 🎯 Philosophy

Our scripts aim to:
- Automate repetitive tasks
- Ensure consistent code quality
- Provide transparency in build and release processes
- Reduce manual steps in development workflow

## 🔒 Best Practices

- Always run `preflight` before releasing
- Use conventional commit messages
- Ensure all tests pass before bumping version
- Review changelog and README updates before publishing

## 🆘 Troubleshooting

- If `version:bump` fails, check:
  - Git is initialized
  - All changes are committed
  - You have proper npm and git configurations
- For coverage badge issues, run `npm run test:coverage` first

## 📦 Extensibility

These scripts are designed to be easily modified. Feel free to:
- Add more pre-release checks
- Customize badge generation
- Extend changelog formatting

---

🚀