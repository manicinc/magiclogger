# MagicLogger Copilot Instructions

## Architecture Overview

MagicLogger is a dual-environment (Node.js/Browser) logging library with extensive compatibility layers. The architecture follows a layered approach:

- **Main Logger** (`src/Logger.ts`): Environment-detecting facade that delegates to platform-specific implementations
- **Core Implementations**: `NodeLogger` (file logging) and `BrowserLogger` (localStorage/console)
- **Shared Base**: `LoggerBase` provides common configuration and theming via `ThemeManager`
- **Compatibility Layer**: Drop-in replacements for Winston, Bunyan, Pino, and enhanced console

## Key Patterns

### Environment Detection Pattern
```typescript
// Main Logger.ts uses runtime detection
if (typeof window !== 'undefined') {
  this.loggerInstance = new BrowserLogger(options);
} else {
  this.loggerInstance = new NodeLogger(options);
}
```

### Module System Dual-Build
- TypeScript source compiles to both ESM (`.js`) and CommonJS (`.cjs`) via `tsup`
- Jest runs in CommonJS mode using `tsconfig.jest.json` with `"module": "CommonJS"`
- ESM build uses `tsconfig.build.json` for production
- **Critical**: When adding ES modules features (like `import.meta.url`), use conditional logic for Jest compatibility

### Theme System Architecture
- `ThemeManager` loads from `src/theme/themes.json` (fixed path resolution required for Jest)
- Themes define color arrays for log levels: `{ "info": ["cyan", "bold"], "error": ["brightRed"] }`
- Path resolution uses `__dirname` in CommonJS (Jest) vs `process.cwd()` fallback in ESM

### Compatibility Layer Pattern
Each compatibility adapter (Winston/Bunyan/Pino) extends `BaseCompatibleLogger`:
```typescript
export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  // Maps external API to internal MagicLogger methods
}
```

## Development Workflow

### Essential Commands
```bash
# Development builds with watch
npm run dev

# Full production build (CJS + ESM + types)
npm run build

# Test with Jest (CommonJS mode)
npm test
npm run test:coverage

# Demos (useful for manual testing)
npm run demo          # Node.js animated demo
npm run demo:guided   # Interactive demo
npm run demo:web      # Browser demo with live server

# Pre-flight checks (run before commits)
npm run preflight     # lint + test + build + coverage + analysis
```

### File Structure Conventions
- `src/core/`: Platform-specific loggers and shared utilities (`Formatter`, `Printer`, `FileManager`)
- `src/compatibility/`: External library compatibility adapters
- `src/types/`: TypeScript definitions split by concern (colors, logger, theme, etc.)
- `src/constants/`: Static definitions (ANSI codes, color presets, paths)
- `tests/unit/`: Mirrors `src/` structure for unit tests
- `tests/integration/`: Cross-component integration tests

### Test Patterns
- Heavy use of Jest mocks in `jest.setup.ts` (518 lines of file system mocking)
- Tests access private properties via bracket notation: `logger['writeToDisk']` (**outdated - see Critical Gotchas**)
- Mock cleanup is critical - many tests fail when mocks aren't properly restored
- File system operations are extensively mocked to avoid side effects
- Browser tests require careful localStorage mocking to avoid redefinition errors

### EnhancedConsole Testing
- `enhanceConsole()` modifies the global console object by copying methods from EnhancedConsole instance
- Tests must capture original console methods before enhancement and restore them properly
- Recursion guards using Symbols prevent infinite loops when console methods call logger methods

## Integration Points

### File System (Node.js)
- `FileManager` handles log file creation, rotation, and cleanup
- Uses `path.resolve()` extensively for cross-platform path handling
- Error handling disables file logging gracefully when directories can't be created

### Browser Storage
- `BrowserStorageManager` provides localStorage/sessionStorage abstraction
- Automatically manages log entry limits and serialization
- Falls back gracefully when storage APIs unavailable

### Build System Integration
- `scripts/analyze-build.js` auto-updates README with bundle sizes
- `scripts/generate-coverage-badge.js` updates coverage badges
- Version management via `scripts/version-bump.js`

## Critical Gotchas

1. **Jest vs ESM**: Always test Node.js-specific features that use ES modules syntax
2. **Path Resolution**: `ThemeManager` path resolution differs between Jest and runtime
3. **Mock State**: Tests frequently fail due to incomplete mock cleanup between tests
4. **Dual Exports**: Changes to main exports require updating both CJS and ESM entry points
5. **Theme Loading**: Theme file must exist at runtime or `ThemeManager` falls back to empty themes
6. **Logger Architecture Change**: Logger is now a facade - properties like `writeToDisk`, `verbose` are on `loggerInstance`, not directly on Logger
7. **Test Property Access**: Use `(logger.loggerInstance as any).propertyName` instead of `logger['propertyName']`

## Adding New Features

- **New Log Methods**: Add to `LoggerBase`, implement in both `NodeLogger` and `BrowserLogger`
- **New Compatibility**: Extend `BaseCompatibleLogger`, follow existing adapter patterns
- **New Colors/Styles**: Update `src/constants/colors.ts` and type definitions
- **Build Changes**: Modify `tsup.config.ts` and verify both output formats work

## Common Test Fixes

When updating failing tests due to Logger architecture changes:
```typescript
// OLD (will fail)
expect(logger['writeToDisk']).toBe(true);

// NEW (correct)
expect((logger.loggerInstance as any).writeToDisk).toBe(true);

// Or access via public methods when available
expect(logger.getLogDir()).toBe('/path/to/logs');
```
