# Documentation Structure Guide

## Overview

MagicLogger uses a single-source documentation approach to maintain consistency and avoid duplication, so our documentation website can render our docs in markdown. This guide explains how the system works.

## Directory Structure

```
magiclogger/
├── docs/                     # 📚 Single source of truth for all docs
│   ├── api_usage.md
│   ├── architecture.md
│   ├── transports.md
│   └── ... (all other docs)
│
├── website/                  # 🌐 Docusaurus website
│   ├── docs/                # ⚠️ GENERATED - Do not edit directly!
│   │   └── (synced from docs/)
│   ├── sidebars.ts         # Sidebar configuration
│   ├── docusaurus.config.ts
│   └── package.json
│
└── scripts/
    └── sync-docs.js         # 🔄 Syncs docs/ → website/docs/

```

## How It Works

### 1. Single Source of Truth

All documentation is maintained in the root `docs/` folder. This ensures:
- No duplicate content
- Consistent updates
- Easy to find and edit
- Works with GitHub's doc viewer

### 2. Automatic Synchronization

The `sync-docs.js` script:
- Copies docs from `docs/` to `website/docs/`
- Adds Docusaurus frontmatter if missing
- Runs automatically during:
  - `npm run start` (local development)
  - `npm run build` (production build)
  - CI/CD pipeline (GitHub Actions)

### 3. Gitignore Strategy

```gitignore
# website/docs is generated - don't track
website/docs/
!website/docs/tutorial-basics/  # Keep Docusaurus tutorials
!website/docs/tutorial-extras/
```

This prevents:
- Duplicate docs in git history
- Merge conflicts between docs/ and website/docs/
- Confusion about which files to edit

## Working with Documentation

### Adding a New Document

1. **Create the document** in `docs/`:
```bash
echo "# My New Feature" > docs/my-feature.md
```

2. **Add to sync list** in `scripts/sync-docs.js`:
```javascript
const DOCS_TO_SYNC = [
  'api_usage.md',
  'architecture.md',
  // ... existing docs
  'my-feature.md',  // Add your new doc
];
```

3. **Update sidebar** in `website/sidebars.ts`:
```typescript
{
  type: 'category',
  label: '📚 Guides',
  items: [
    'my-feature',  // Doc ID (filename without .md)
  ],
}
```

4. **Test locally**:
```bash
cd website
npm run start  # Auto-syncs and starts dev server
```

### Editing Existing Documentation

Always edit files in `docs/`, never in `website/docs/`:

```bash
# ✅ CORRECT
vim docs/api_usage.md

# ❌ WRONG - These changes will be overwritten!
vim website/docs/api_usage.md
```

### Documentation with Special Formatting

For docs needing special Docusaurus features:

1. Add frontmatter in the source `docs/` file:
```markdown
---
id: my-doc
title: My Document Title
sidebar_label: Short Name
sidebar_position: 1
---

# My Document Content
```

2. The sync script preserves existing frontmatter

### Testing Documentation Changes

```bash
# Quick test - just build
cd website
npm run sync-docs
npm run build

# Full test - preview the site
cd website
npm run start
# Opens http://localhost:3000
```

## CI/CD Integration

The GitHub Actions workflow (`docs.yml`) automatically:

1. Syncs documentation on every push
2. Builds the Docusaurus site
3. Deploys to GitHub Pages

```yaml
- name: Sync documentation from docs/ to website/docs/
  run: node scripts/sync-docs.js

- name: Build website
  run: npm run build
  working-directory: ./website
```

## Benefits of This Approach

1. **Single Source of Truth**: Edit once, deploy everywhere
2. **No Duplication**: Reduces repo size and complexity
3. **Automatic Sync**: No manual copying needed
4. **Version Control**: Only track source files
5. **IDE Friendly**: Edit markdown in root docs/ with full IDE support
6. **GitHub Friendly**: Docs render correctly on GitHub repo page
7. **Flexible**: Can add Docusaurus-specific features when needed

## Troubleshooting

### Changes Not Appearing

If your changes don't appear on the website:

1. **Check sync list**: Ensure your file is in `DOCS_TO_SYNC` array
2. **Clear cache**: `cd website && npm run clear`
3. **Check frontmatter**: Invalid frontmatter can cause build errors
4. **Restart dev server**: Sometimes hot reload misses changes

### Build Errors

```bash
# Check which docs are causing issues
cd website
npm run sync-docs
npm run build -- --debug
```

### Duplicate Content

If you see duplicate content:
1. Check that `website/docs/` is gitignored
2. Remove any manually copied files from `website/docs/`
3. Run `git rm -r --cached website/docs/` if needed

## Best Practices

1. **Always edit in `docs/`** - Never edit `website/docs/` directly
2. **Test locally** - Run the website locally before pushing
3. **Use meaningful names** - Keep filenames descriptive and lowercase
4. **Add to sync list** - Don't forget to add new docs to `sync-docs.js`
5. **Update sidebar** - Keep the sidebar organized and logical
6. **Write once** - Avoid platform-specific content when possible

## Migration from Duplicate Docs

If you have existing duplicate docs:

```bash
# 1. Ensure docs/ has all latest content
cp website/docs/*.md docs/  # If website has newer versions

# 2. Remove website docs from git
git rm -r website/docs/
git commit -m "chore: remove duplicate docs, use single source"

# 3. Add to .gitignore
echo "website/docs/" >> .gitignore

# 4. Test the sync
node scripts/sync-docs.js
cd website && npm run build
```

This documentation structure ensures maintainability, consistency, and ease of use for both contributors and users.