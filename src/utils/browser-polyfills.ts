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
    isFile: () => false,
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
  isAbsolute: (p: string) => {
    if (typeof p !== 'string') return false;
    return p.startsWith('/');
  },
  resolve: (...paths: string[]) => {
    const filtered = paths.filter(p => p != null).map(String);
    return filtered.join('/');
  },
  join: (...paths: string[]) => {
    // Filter out null, undefined, and empty strings, convert to string
    const filtered = paths
      .filter(p => p != null)
      .map(p => String(p))
      .filter(p => p !== '');
    
    if (filtered.length === 0) return '';
    
    // Join and clean up multiple slashes
    return filtered.join('/')
      .replace(/\/+/g, '/')
      .replace(/^\/*/, filtered[0]?.startsWith('/') ? '/' : '');
  },
  dirname: (p: string) => {
    if (typeof p !== 'string') p = String(p);
    if (p === '') return '.';
    if (p === '/') return '/';
    const lastSlash = p.lastIndexOf('/');
    if (lastSlash === -1) return '.';
    if (lastSlash === 0) return '/';
    return p.substring(0, lastSlash);
  },
  extname: (p: string) => {
    if (typeof p !== 'string') p = String(p);
    if (p === '..' || p === '...') return '.';
    const lastDot = p.lastIndexOf('.');
    const lastSlash = p.lastIndexOf('/');
    if (lastDot === -1 || lastDot < lastSlash || lastDot === p.length - 1) return '';
    if (lastDot === 0) return ''; // .hidden files have no extension
    return p.substring(lastDot);
  },
  basename: (p: string, ext?: string) => {
    if (typeof p !== 'string') p = String(p);
    if (p === '') return '';
    // Remove trailing slashes
    p = p.replace(/\/*$/, '');
    const lastSlash = p.lastIndexOf('/');
    const base = lastSlash === -1 ? p : p.substring(lastSlash + 1);
    
    // Remove extension if provided
    if (ext && base.endsWith(ext)) {
      return base.substring(0, base.length - ext.length);
    }
    return base;
  },
  sep: '/',
  delimiter: ':'
};

// Empty os implementation for browser
export const os = {
  hostname: () => 'localhost',
  platform: () => 'browser',
  type: () => 'Browser',
  release: () => '',
  arch: () => 'wasm32',
  EOL: '\n',
  tmpdir: () => '/tmp',
  homedir: () => '/',
  cpus: () => [],
  totalmem: () => 2147483648, // 2GB
  freemem: () => 1073741824,  // 1GB
  uptime: () => Math.floor(performance.now() / 1000)
};

// Export all polyfills in a single object
export const BROWSER_POLYFILLS = {
  fs,
  path,
  os,
};
