# Build and Run Instructions

## Why Two Module Formats?

MagicLogger provides both ESM (`.mjs`) and CommonJS (`.js`) entry points to support:
- ✅ Modern environments using import statements
- ✅ Legacy environments using require()
- ✅ Hybrid codebases migrating from CommonJS to ESM
- ✅ TypeScript projects with different module resolutions

Use whichever format fits your stack — the library supports both seamlessly.

## Browser Support

MagicLogger works in browser-based projects (like React or Vue) with automatic adaptation:
- Terminal-specific features (e.g., cursor movement) are disabled
- ANSI styling is adjusted for browser console support
- File logging is disabled in browser contexts
- The environment is auto-detected and fallback-safe

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the library:
```bash
npm run build
```
This compiles the `src` files into `dist/` with both ESM and CJS outputs.

### Development Mode

Watch mode for rapid iteration:
```bash
npm run dev
```
This runs `tsup` in watch mode to rebuild on file changes.

### Running the Demo

You can run examples in multiple ways:

#### ES Modules (Recommended for Modern Node)
```bash
node dist/examples/demo.mjs
```

#### CommonJS
```bash
node dist/examples/demo.js
```

#### Without Building (TS Direct)
```bash
npx ts-node examples/demo.ts
```

## Testing

Run all tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

Generate coverage badge and markdown report:
```bash
npm run test:coverage:badge
```

## Linting and Formatting

Format code:
```bash
npm run format
```

Lint code:
```bash
npm run lint
```

Auto-fix lint issues:
```bash
npm run lint:fix
```

## Preflight Check (Before Releasing)

Run a full validation of the build before tagging or publishing:
```bash
npm run preflight
```

This will:
* Clean build artifacts
* Run format checks and lint
* Run all tests
* Build the output
* Generate a coverage badge
* Inject build size stats into `README.md`

## Manual Release Workflow

1. Run a preflight check:
```bash
npm run preflight
```

2. Bump version and generate changelog:
```bash
npm run version:bump patch # or minor / major
```

3. Push and publish:
```bash
git push && git push --tags npm publish
```

Or run it all in one step:
```bash
npm run release:manual patch
```

This combines `preflight` + version bump automation + changelog + README injection.

## Troubleshooting

### Common ESM/CJS Issues

1. Make sure you're using the correct file extensions:
   * `.mjs` for ES Modules
   * `.js` for CommonJS

2. For older Node.js versions, fall back to CommonJS:
```bash
node dist/index.js
```

3. If you see errors related to file extensions in `import` paths, make sure you're using Node 14+ with `"type": "module"` in `package.json`.

## Package Structure

* `src/` — Source TypeScript files
* `dist/index.js` — CommonJS build
* `dist/index.mjs` — ESM build
* `dist/index.d.ts` — TypeScript types
* `examples/` — Example/demo scripts
* `scripts/` — Automation scripts (coverage, versioning, build analysis)
* `tests/` — Unit test files
* `docs/` — Developer documentation