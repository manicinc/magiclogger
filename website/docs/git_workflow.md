# Git Workflow & Commit Standards

This document outlines the Git workflow and commit standards for the Magiclogger project.

## Git Hooks

The project uses Husky to manage Git hooks for enforcing code quality and commit standards:

- **pre-commit**: Runs linting and formatting on changed files
- **commit-msg**: Validates commit message format
- **pre-push**: Runs tests before pushing to remote
- **prepare-commit-msg**: Automatically applies commit template

These hooks are automatically installed when you run `npm install`.

## Commit Message Format

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

### Scope

The scope is optional and should be the name of the component affected (e.g., `logger`, `colors`, `types`).

### Description

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

## Creating Commits

You have two options for creating commits:

### Option 1: Interactive Commit (Recommended for Beginners)

```bash
npm run commit
```

This runs Commitizen, which will guide you through creating a properly formatted commit message with interactive prompts.

### Option 2: Standard Git Commit

```bash
git commit
```

This will open your default editor with a commit template. Fill in the template according to the instructions.

You can also commit directly with a message:

```bash
git commit -m "feat(logger): add custom color method"
```

But be sure to follow the conventional commit format, as it will be validated by the commit-msg hook.

## Workflow Best Practices

1. **Create feature branches**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make small, focused commits**:
   - Each commit should represent a single logical change
   - Keep commits small and focused on a specific task

3. **Push your branch**:
   ```bash
   git push origin feature/my-feature
   ```

4. **Create a Pull Request** to merge your changes into the main branch

5. **Delete the branch** after it has been merged

## Example Workflow

```bash
# Create a new branch
git checkout -b feature/add-progress-bar

# Make your changes
# ...

# Stage your changes
git add .

# Create a commit with guided prompts
npm run commit
# OR
git commit

# Push your branch
git push origin feature/add-progress-bar

# Create a PR on GitHub/GitLab
```

## Troubleshooting

If you encounter issues with Git hooks:

1. Ensure hooks are executable:
   ```bash
   chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push .husky/prepare-commit-msg
   ```

2. Temporarily bypass hooks (use sparingly):
   ```bash
   git commit --no-verify -m "your message"
   ```

3. If your commit is rejected due to formatting issues:
   ```bash
   npm run format
   npm run lint:fix
   ```