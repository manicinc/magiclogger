# Build and Run Instructions

## Why Two Module Formats?

MagicLogger provides both ESM (`.js`) and CommonJS (`.cjs`) files to support:

- Modern environments using ESM with `import` statements
- Legacy environments using CommonJS with `require()`
- Hybrid codebases transitioning between module systems
- TypeScript projects with different module resolutions

You can use whichever format suits your project best - the library detects and works with both automatically.

## Browser Support

MagicLogger can be used in browser environments including Vue, React, and other frontend frameworks. When used in browsers:

- Terminal-specific features (like cursor movement) are automatically disabled
- Color output is adapted for browser consoles, which support many but not all ANSI color codes
- File logging functionality is disabled (as browsers can't directly write to the filesystem)
- The library automatically detects the browser environment and adjusts accordingly

## Setting Up the Project

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

This will create the `dist` directory with both ESM and CommonJS builds using tsup.

## Development Mode

For development with automatic rebuilding:

```bash
npm run dev
```

This will watch your files and rebuild on changes.

## Running the Demo

After building, you can run the demo in several ways:

### ES Modules (Recommended for Modern Node.js)

```bash
node dist/examples/demo.mjs
```

### CommonJS

```bash
node dist/examples/demo.js
```

### Directly with TypeScript (Without Building)

```bash
# Install ts-node if you don't have it
npm install -g ts-node

# Run the demo
npx ts-node examples/demo.ts
```

## Testing

Run the test suite:

```bash
npm test
```

With coverage report:

```bash
npm run test:coverage
```

## Linting and Formatting

Format the code:

```bash
npm run format
```

Lint the code:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

## Troubleshooting

If you're having issues with ESM imports, try one of these solutions:

1. Make sure you're using the correct file extension:
   - `.mjs` for ESM modules
   - `.js` for CommonJS modules

2. For Node.js versions that don't fully support ESM, use the CommonJS version:
   ```bash
   node dist/examples/demo.js
   ```

3. If you see errors about `.js` extensions in imports, make sure you're using the recommended Node.js version (14+).

## Package Structure

- `src/` - Source TypeScript files
- `dist/*.js` - Compiled CommonJS JavaScript files
- `dist/*.mjs` - Compiled ESM JavaScript files
- `dist/*.d.ts` - TypeScript declaration files
- `examples/` - Example usage and demo scripts
- `__tests__/` - Test files

## Import Examples

### In TypeScript

```typescript
// ESM style import (preferred)
import { Logger, COLORS } from 'magiclogger';

// CommonJS style import
const { Logger, COLORS } = require('magiclogger');
```

### In JavaScript

```javascript
// ES Modules
import { Logger } from 'magiclogger';

// CommonJS
const { Logger } = require('magiclogger');
```