# Documentation Structure Guide

## Overview

MagicLogger uses Docusaurus for documentation with a simple, single-source approach. All documentation lives in the `docs/` folder and Docusaurus reads directly from there.

## Directory Structure

```
magiclogger/
├── docs/                     # 📚 All documentation files
│   ├── getting-started.md    # Quick start guide
│   ├── api-reference.md      # Complete API documentation
│   ├── advanced-usage.md     # Advanced patterns and examples
│   ├── architecture.md       # System architecture
│   ├── transports.md         # Transport documentation
│   └── ... (other docs)
│
└── website/                  # 🌐 Docusaurus website
    ├── src/                  # Website components and pages
    ├── static/               # Static assets
    ├── sidebars.ts          # Sidebar configuration
    └── docusaurus.config.ts # Main configuration
```

## How It Works

### Single Source of Truth

All documentation is maintained in the root `docs/` folder. This ensures:
- No duplicate content
- Simple maintenance
- Works with GitHub's doc viewer
- Direct integration with Docusaurus

### Docusaurus Configuration

The website is configured to read documentation directly from the parent `docs/` directory:

```typescript
// docusaurus.config.ts
{
  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',  // Points to parent docs folder
          editUrl: 'https://github.com/manicinc/magiclogger/tree/main/docs/',
        }
      }
    ]
  ]
}
```

### No Syncing Required

Unlike many setups, we don't copy or sync documentation files. Docusaurus reads directly from the source, eliminating:
- Build-time sync steps
- Duplicate files
- Sync script maintenance
- Potential sync errors

## Working with Documentation

### Adding a New Document

1. **Create the document** in `docs/`:
```bash
echo "# My New Feature" > docs/my-feature.md
```

2. **Update sidebar** in `website/sidebars.ts`:
```typescript
{
  type: 'category',
  label: '📚 Guides',
  items: [
    'getting-started',
    'my-feature',  // Add your new doc
    'api-reference',
  ],
}
```

3. **Test locally**:
```bash
cd website
npm start  # Starts dev server
```

### Editing Documentation

Always edit files directly in the `docs/` folder:

```bash
# ✅ CORRECT
vim docs/api-reference.md

# ❌ WRONG - No other location for docs
vim website/docs/api-reference.md  # This doesn't exist!
```

### Documentation with Special Formatting

Add Docusaurus frontmatter directly in the `docs/` files:

```markdown
---
id: my-doc
title: My Document Title
sidebar_label: Short Name
sidebar_position: 1
---

# My Document Content
```

## API Documentation

API documentation is maintained in `docs/api-reference.md` using pure Markdown. This provides:
- Complete API reference with code examples
- Type definitions and interfaces
- Transport documentation
- Extension guides
- Migration guides from other loggers

No TypeDoc or other generation tools are needed - everything is hand-written for clarity and control.

## Testing Documentation Changes

```bash
# Start development server
cd website
npm start
# Opens http://localhost:3000

# Build for production
cd website
npm run build

# Serve production build locally
cd website
npm run serve
```

## CI/CD Integration

The GitHub Actions workflow automatically:

1. Builds the Docusaurus site
2. Deploys to GitHub Pages

No sync step is needed since Docusaurus reads directly from `docs/`.

## Benefits of This Approach

1. **Simplicity**: No sync scripts or duplicate files
2. **Single Source**: Edit once in `docs/`
3. **Direct Integration**: Docusaurus reads from source
4. **Version Control**: Only track source files
5. **IDE Friendly**: Edit markdown in root docs/ with full IDE support
6. **GitHub Friendly**: Docs render correctly on GitHub repo page
7. **Maintenance Free**: No sync scripts to maintain

## Best Practices

1. **Keep docs organized** - Use clear, descriptive filenames
2. **Use frontmatter** - Add metadata for better organization
3. **Test locally** - Always preview changes before pushing
4. **Write clearly** - Focus on user needs and clarity
5. **Include examples** - Code examples make concepts clear
6. **Update promptly** - Keep docs in sync with code changes

## Documentation Categories

### Core Documentation
- `getting-started.md` - Quick start guide
- `api-reference.md` - Complete API reference
- `advanced-usage.md` - Advanced patterns

### Architecture & Design
- `architecture.md` - System architecture
- `magic-schema.md` - MAGIC schema specification

### Features
- `transports.md` - Transport documentation
- `styling.md` - Styling and theming
- `context-and-tags.md` - Structured logging

### Development
- `development.md` - Development guide
- `contributing.md` - Contribution guidelines
- `build_instructions.md` - Build instructions

### Operations
- `deployment.md` - Deployment guide
- `cicd.md` - CI/CD documentation
- `publishing.md` - NPM publishing

This simple structure ensures maintainability, consistency, and ease of use for both contributors and users.