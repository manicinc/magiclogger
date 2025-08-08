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

// ---- DOM safety shims for jsdom tests ----
(function applyDocumentShims(root) {
  if (!root) return;

  const ensureDoc = (doc) => {
    if (!doc) return doc;
    try {
      if (typeof doc.addEventListener !== 'function') {
        doc.addEventListener = function () {};
      }
      if (typeof doc.removeEventListener !== 'function') {
        doc.removeEventListener = function () {};
      }
      if (typeof doc.createElement !== 'function') {
        doc.createElement = function () {
          return {
            click: function () {},
            setAttribute: function () {},
            style: {},
          };
        };
      }
      if (!doc.body) {
        doc.body = {
          appendChild: function () {},
          removeChild: function () {},
        };
      } else {
        if (typeof doc.body.appendChild !== 'function') {
          doc.body.appendChild = function () {};
        }
        if (typeof doc.body.removeChild !== 'function') {
          doc.body.removeChild = function () {};
        }
      }
    } catch (_) {
      // ignore
    }
    return doc;
  };

  // Patch existing document
  if (root.document) {
    ensureDoc(root.document);
  }

  // Intercept future assignments to document to keep shims
  try {
    const desc = Object.getOwnPropertyDescriptor(root, 'document');
    if (!desc || desc.configurable) {
      let _doc = root.document;
      Object.defineProperty(root, 'document', {
        configurable: true,
        enumerable: true,
        get() {
          return _doc;
        },
        set(v) {
          _doc = ensureDoc(v);
        },
      });
    }
  } catch (_) {
    // ignore if we cannot redefine
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : undefined));

// Debug: Log that polyfills were loaded
if (process.env.NODE_ENV === 'test') {
  console.log('Jest polyfills loaded: timers and DOM shims available');
}
