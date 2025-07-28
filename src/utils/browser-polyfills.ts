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
    isFile: () => true,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    mtimeMs: 0,
    atimeMs: 0,
    ctimeMs: 0,
    birthtimeMs: 0,
    size: 0,
    mode: 0,
    uid: 0,
    gid: 0,
    dev: 0,
    ino: 0,
    nlink: 0,
    rdev: 0,
    blksize: 0,
    blocks: 0,
    mtime: new Date(),
    atime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
  }),
  unlinkSync: noop,
  rmdirSync: noop,
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
