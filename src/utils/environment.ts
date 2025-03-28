/**
 * Determines if the current environment is a browser.
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Determines if the current environment is Node.js.
 */
export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node;
}
