# MagicLogger Documentation Deployment

## 🚀 Deployment Overview

MagicLogger uses an optimized CI/CD pipeline that builds minified production bundles and deploys documentation to GitHub Pages via the `gh-pages` branch.

## 📦 Build & Deploy Process

### Automated Deployment (GitHub Actions)

The deployment is fully integrated into the main CI workflow (`.github/workflows/ci.yml`):

1. **Triggers on**:
   - Push to `main` or `master` branches
   - Successful completion of build job

2. **Process**:
   ```bash
   Build Library (minified) → Build Docs (minified) → Deploy to gh-pages
   ```

3. **Key Features**:
   - ✅ Production minification (`NODE_ENV=production`)
   - ✅ Dependency caching for fast builds
   - ✅ Automatic deployment to gh-pages branch
   - ✅ No separate deployment workflow needed

### Manual Deployment

```bash
# Quick deploy
npm run deploy:gh-pages

# Step by step
npm run build                    # Build library with minification
cd website
npm ci                           # Install website dependencies
npm run build                    # Build Docusaurus (minified)
npm run deploy                   # Deploy to gh-pages
```

## ⚙️ Configuration

### Docusaurus Settings (`website/docusaurus.config.ts`)

```typescript
{
  url: 'https://manicinc.github.io',
  baseUrl: '/magiclogger/',           // Important: must match repo name
  organizationName: 'manicinc',
  projectName: 'magiclogger',
  deploymentBranch: 'gh-pages',
  trailingSlash: false
}
```

### GitHub Pages Setup

1. Go to **Settings** → **Pages**
2. Set Source: **Deploy from a branch**
3. Select Branch: **gh-pages** / **/ (root)**
4. Save changes

## 🔍 Build Optimization

The deployment includes these optimizations:

- **Minification**: Both library and docs are minified
- **Tree Shaking**: Removes unused code
- **Production Mode**: `NODE_ENV=production` for optimal builds
- **Asset Compression**: Smaller file sizes
- **Dependency Caching**: Faster CI builds

## 📊 Deployment Info

- **Live URL**: https://manicinc.github.io/magiclogger/
- **Branch**: `gh-pages`
- **Build Time**: ~2-3 minutes
- **Cache**: GitHub Pages CDN (up to 10 min)

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 errors | Check `baseUrl` matches repo name |
| Build fails | Check CI logs, ensure tests pass |
| Old content | Clear browser cache, wait 10 min |
| Permission error | Ensure workflow has `contents: write` |

### Debug Commands

```bash
# Check build locally
npm run docs:build
npm run docs:serve

# Check gh-pages branch
git fetch origin gh-pages
git checkout gh-pages
ls -la

# Force rebuild
git push origin main --force-with-lease
```

## 🔄 Rollback Process

```bash
# Find previous good commit
git log origin/gh-pages --oneline

# Rollback gh-pages
git checkout gh-pages
git reset --hard <commit-sha>
git push --force origin gh-pages
```

## 📝 Development Workflow

1. **Edit docs**: Modify files in `docs/` folder
2. **Test locally**: `npm run docs:start`
3. **Create PR**: Push to feature branch
4. **Auto-deploy**: Merges to main trigger deployment

## 🔐 Security

- Deployments only from protected branches
- Uses GitHub's `GITHUB_TOKEN` (no secrets needed)
- All deployments logged in Actions tab
- Force orphan commits (no history leakage)

## 📁 Key Files

```
.github/workflows/ci.yml        # Main CI with deploy-docs job
website/docusaurus.config.ts    # Site configuration
website/package.json            # Website dependencies
scripts/sync-docs.js            # Syncs docs to website
```

## ⚡ Performance

- **CDN**: GitHub Pages global CDN
- **Caching**: Browser & CDN caching
- **Minified**: ~60% smaller file sizes
- **Gzipped**: Additional compression

## 🆘 Support

1. Check [Actions Tab](https://github.com/manicinc/magiclogger/actions)
2. Review [Pages Settings](https://github.com/manicinc/magiclogger/settings/pages)  
3. Open an [Issue](https://github.com/manicinc/magiclogger/issues)

---

*Last updated: CI/CD workflow integrated into main pipeline with minified builds and gh-pages deployment*