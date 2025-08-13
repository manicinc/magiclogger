import { isBrowserEnvironment } from '../utils/environment';
import type { ThemeDefinition } from '../types';
import { DEFAULT_THEME as BUILTIN_DEFAULT_THEME } from '../constants/themes';

let loadThemes: () => Record<string, ThemeDefinition>;
let getTheme: (name: string) => ThemeDefinition | undefined;
let listThemes: () => string[];

if (isBrowserEnvironment()) {
  // Browser implementation - no file system access
  loadThemes = () => ({ default: BUILTIN_DEFAULT_THEME });
  getTheme = (_name: string) => {
    return undefined;
  };
  listThemes = () => ['default'];
} else {
  // Node.js implementation - use conditional imports
  let fs: typeof import('fs') | undefined;
  let path: typeof import('path') | undefined;

  try {
    // Prefer native require when available (ts-jest transforms to CJS)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (typeof require === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      path = require('path');
    }
  } catch {
    fs = undefined;
    path = undefined;
  }

  let themesCache: Record<string, ThemeDefinition> | null = null;

  const findThemesJson = (): string | null => {
    if (!fs || !path) return null;
    const localFs = fs;
    const localPath = path;

    // First try a stable fallback path relative to cwd (for ESM/test environments)
    const fallback = localPath.resolve(process.cwd(), 'src', 'theme', 'themes.json');
    try {
      if (localFs.existsSync(fallback)) {
        return fallback;
      }
    } catch {
      // ignore
    }

    // Then attempt to walk up from module directory if available
    let baseDir: string;
    try {
      // eslint-disable-next-line no-undef
      baseDir = typeof __dirname === 'string' ? __dirname : process.cwd();
    } catch {
      baseDir = process.cwd();
    }

    let currentDir = baseDir;
    for (let i = 0; i < 5; i++) {
      const themesPath = localPath.join(currentDir, 'themes.json');
      try {
        if (localFs.existsSync(themesPath)) {
          return themesPath;
        }
      } catch {
        // ignore and continue upwards
      }
      currentDir = localPath.dirname(currentDir);
    }
    return null;
  };

  loadThemes = () => {
    // In tests, avoid caching so fs mocks are respected per test
    if (process.env && process.env.NODE_ENV === 'test') {
      themesCache = null;
    }

    if (themesCache) {
      return themesCache;
    }

    if (!fs || !path) {
      console.warn('[ThemeManager] Theme file not found', 'fs/path unavailable');
      themesCache = {};
      return themesCache;
    }

    const themesPath = findThemesJson();
    if (themesPath) {
      try {
        const themesJson = fs.readFileSync(themesPath, 'utf-8');
        try {
          const parsed = JSON.parse(themesJson) as Record<string, ThemeDefinition>;
          // If the file exists but is empty ({}), fall back to built-in default theme
          if (parsed && Object.keys(parsed).length === 0) {
            themesCache = { default: BUILTIN_DEFAULT_THEME };
          } else {
            themesCache = parsed;
          }
        } catch (error) {
          console.warn('[ThemeManager] Failed to parse themes.json:', error as Error);
          themesCache = {};
        }
      } catch (error) {
        console.warn('[ThemeManager] Failed to read themes.json:', error as Error);
        themesCache = {};
      }
    } else {
      console.warn('[ThemeManager] Theme file not found', 'themes.json');
      themesCache = {};
    }
    // If we resolved a themesPath (file existed) but ended up with an empty object (e.g. parse error or empty file),
    // ensure we still expose a default theme so callers have a usable fallback. Missing-file cases remain empty.
    if (themesPath && themesCache && Object.keys(themesCache).length === 0) {
      themesCache = { default: BUILTIN_DEFAULT_THEME };
    }
    return themesCache ?? {};
  };

  getTheme = (name: string) => {
    const themes = loadThemes();
    return themes[name];
  };

  listThemes = () => {
    const themes = loadThemes();
    return Object.keys(themes);
  };
}

export { loadThemes, getTheme, listThemes };
