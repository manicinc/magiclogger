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

// Ensure setImmediate resolves in tests even with fake timers by delegating to process.nextTick
// This avoids tests hanging on `await new Promise(r => setImmediate(r))`
try {
  const impl = function (cb, ...args) {
    if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
      return process.nextTick(() => cb(...args));
    }
    return setTimeout(() => cb(...args), 0);
  };
  // Define only if not already defined, and keep it writable/configurable to avoid conflicts with Jest
  const hasSetImmediate = typeof globalThis !== 'undefined' && typeof globalThis.setImmediate === 'function';
  if (!hasSetImmediate) {
    Object.defineProperty(globalThis, 'setImmediate', {
      value: impl,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
} catch (_) {
  // Fallback assignment if defineProperty fails
  // eslint-disable-next-line no-global-assign
  // Only assign if it's not already a function
  if (typeof setImmediate !== 'function') {
    // eslint-disable-next-line no-global-assign
    setImmediate = function (cb, ...args) {
      if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
        return process.nextTick(() => cb(...args));
      }
      return setTimeout(() => cb(...args), 0);
    };
  }
}

// ---- DOM safety shims for jsdom tests ----
(function applyDocumentShims(root) {
  if (!root) return;

  const ensureDoc = (doc) => {
    // Only patch existing jsdom documents; never replace or redefine
    if (!doc) return doc;
    try {
      if (typeof doc.addEventListener !== 'function') {
        // Provide a no-op to satisfy consumers that attach listeners
        doc.addEventListener = function () { return undefined; };
      }
      if (typeof doc.removeEventListener !== 'function') {
        doc.removeEventListener = function () { return undefined; };
      }
      if (typeof doc.createElement !== 'function') {
        // Do not synthesize a full element; return minimal object
        doc.createElement = function () {
          return {
            click: function () { return undefined; },
            setAttribute: function () { return undefined; },
            style: {},
          };
        };
      }
      if (!doc.body) {
        // Add minimal body with required methods
        doc.body = {
          appendChild: function () { return undefined; },
          removeChild: function () { return undefined; },
        };
      } else {
        if (typeof doc.body.appendChild !== 'function') {
          doc.body.appendChild = function () { return undefined; };
        }
        if (typeof doc.body.removeChild !== 'function') {
          doc.body.removeChild = function () { return undefined; };
        }
      }
    } catch (_) {
      // ignore
    }
    return doc;
  };

  // Patch existing document only; do not override property descriptors
  if (root.document) {
    ensureDoc(root.document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : undefined));

// Debug: Log that polyfills were loaded
if (process.env.NODE_ENV === 'test') {
  console.log('Jest polyfills loaded: timers and DOM shims available');
}
