// Jest polyfills file - runs before any tests or modules are loaded
// This ensures timer globals are available immediately

// Force override timer globals to ensure they're available
global.setInterval = setInterval;
global.clearInterval = clearInterval;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;

// Also ensure they're available on globalThis for modern environments
/* global globalThis */
if (typeof globalThis !== 'undefined') {
  globalThis.setInterval = setInterval;
  globalThis.clearInterval = clearInterval;
  globalThis.setTimeout = setTimeout;
  globalThis.clearTimeout = clearTimeout;
}

// Debug: Log that polyfills were loaded
if (process.env.NODE_ENV === 'test') {
  console.log('Jest polyfills loaded: timers available');
}
