# Development Guide for Magiclogger

## Project Overview

Magiclogger is a fully typed, high-performance logging library built with TypeScript. This guide provides comprehensive instructions for setting up, developing, and contributing to the project.

## Prerequisites

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- TypeScript 4.5.0 or higher

## Local Development Setup

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/manicinc/magiclogger.git
cd magiclogger
npm install
```

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode with file watching |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run preflight` | Run comprehensive pre-release checks |

### Development Mode

```bash
npm run dev
```

Starts TypeScript compilation in watch mode, automatically rebuilding on file changes.

## Testing

### Running Tests

```bash
npm test
```

### Coverage Requirements

Magiclogger maintains rigorous test coverage standards:

- Statements: 95%
- Branches: 95%
- Functions: 95%
- Lines: 95%

View detailed coverage report:
```bash
npm run test:coverage
```

## Code Quality

### Linting

```bash
npm run lint
```

Checks code against ESLint rules. Use `npm run lint:fix` to automatically resolve simple issues.

### Formatting

```bash
npm run format
```

Ensures consistent code style using Prettier.

## Configuration

### Environment Variables

Create a `.env` file in the project root for local development configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_VERBOSE` | Enable verbose logging | `false` |
| `LOG_TO_FILE` | Write logs to disk | `false` |
| `LOG_DIR` | Custom log directory | `./logs` |

**Note**: Do not commit `.env` to version control.

## Commit Guidelines

We use Conventional Commits for semantic versioning:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Purpose | Version Impact |
|------|---------|----------------|
| `feat` | New feature | Minor version bump |
| `fix` | Bug fix | Patch version bump |
| `docs` | Documentation changes | No version change |
| `style` | Code formatting | No version change |
| `refactor` | Code restructuring | No version change |
| `test` | Test modifications | No version change |
| `chore` | Maintenance tasks | No version change |

### Breaking Changes

Indicate breaking changes by:
- Adding `!` after the type, or
- Including a `BREAKING CHANGE:` footer

## Release Process

### Local Release Testing

Test version bumps without publishing:

```bash
# Patch release
node scripts/version-bump.js patch

# Minor release
node scripts/version-bump.js minor

# Major release
node scripts/version-bump.js major
```

### Preflight Checks

Before any release, run comprehensive checks:

```bash
npm run preflight
```

This script ensures:
- Code is formatted
- Linting passes
- All tests pass
- Build succeeds
- Coverage requirements met

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run preflight`
5. Submit a pull request

## TypeScript Support

Magiclogger is built 100% in TypeScript, providing:
- Full type safety
- Comprehensive type definitions
- Intelligent type inference
- Zero runtime type overhead

Recommended TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true
  }
}
```