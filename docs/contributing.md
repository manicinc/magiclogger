# Contributing to Magiclogger

Thank you for your interest in contributing to Magiclogger! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

We expect all contributors to act professionally and respectfully. By participating in this project, you agree to maintain a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Getting Started

To get started with development:

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/magiclogger.git
   cd magiclogger
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your development environment** 
   - See [Development Guide](./development.md) for detailed instructions

## Development Workflow

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write code
   - Add tests
   - Update documentation

3. **Run tests and linting**:
   ```bash
   npm test
   npm run lint
   ```

4. **Format your code**:
   ```bash
   npm run format
   ```

5. **Check test coverage**:
   ```bash
   npm run test:coverage
   ```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic versioning and changelog generation.

Format your commits as:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature (triggers minor version bump)
- `fix`: A bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process or tools

For breaking changes, add `!` after the type or include a `BREAKING CHANGE:` footer.

Example:
```
feat(logger): add color support for backgrounds

Add ability to use background colors in text output.

Closes #42
```

You can use the provided commit script for guided commit creation:
```bash
npm run commit
```

See [Git Workflow](./git_workflow.md) for more details.

## Pull Request Process

1. **Ensure your code passes all tests** and maintains test coverage
2. **Update documentation** if you're changing behavior
3. **Submit your pull request** targeting the `main` branch
4. **Describe your changes** in detail and link any related issues
5. **Wait for review** - maintainers will review your PR as soon as possible
6. **Address review feedback** if requested

## Coding Standards

Magiclogger follows these standards:

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Jest** for testing

Our automated tools enforce these standards. Run these locally before submitting:
```bash
npm run lint
npm run format
```

## Testing

We maintain high test coverage standards:
- Write tests for all new features
- Ensure all edge cases are covered
- Maintain coverage thresholds (95%+)

Run tests with:
```bash
npm test
```

Check coverage with:
```bash
npm run test:coverage
```

## Additional Information

- **CI/CD Pipeline**: See [CI/CD Documentation](./cicd.md)
- **Release Process**: See [Publishing Guide](./publishing.md)
- **API Documentation**: See [API Usage](./api_usage.md)

Thank you for contributing to Magiclogger!