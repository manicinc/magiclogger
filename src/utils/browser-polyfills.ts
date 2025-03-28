/**
 * Browser polyfills for Node.js built-in modules.
 * These are no-op or dummy implementations for browser compatibility.
 */

// No-op function for unimplemented methods
const noop = () => {
  /* noop */
};

// Empty fs implementation for browser
export const fs = {
  existsSync: () => false,
  mkdirSync: noop,
  writeFileSync: noop,
  appendFileSync: noop,
  readFileSync: () => '',
  readFile: () => Promise.resolve(new Uint8Array()),
  readdirSync: () => [],
  statSync: () => ({
    isDirectory: () => false,
    mtimeMs: 0,
  }),
  unlinkSync: noop,
};

// Empty path implementation for browser
export const path = {
  isAbsolute: (p: string) => p.startsWith('/'),
  resolve: (...paths: string[]) => paths.join('/'),
  join: (...paths: string[]) => paths.join('/'),
  dirname: (p: string) => p.substring(0, p.lastIndexOf('/')),
  extname: () => '',
  basename: (p: string) => p.substring(p.lastIndexOf('/') + 1),
};

// Empty os implementation for browser
export const os = {
  hostname: () => 'browser',
  platform: () => 'browser',
  EOL: '\n',
  tmpdir: () => '/tmp',
};

// Export all polyfills in a single object
export const BROWSER_POLYFILLS = {
  fs,
  path,
  os,
};
