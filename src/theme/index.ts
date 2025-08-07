import { isBrowserEnvironment } from '../utils/environment';
import type { ThemeDefinition } from '../types';

let loadThemes: () => Record<string, ThemeDefinition>;
let getTheme: (name: string) => ThemeDefinition | undefined;
let listThemes: () => string[];

if (isBrowserEnvironment()) {
  // Browser implementation - no file system access
  loadThemes = () => ({});
  getTheme = (_name: string) => {
    return undefined;
  };
  listThemes = () => ['default'];
} else {
  // Node.js implementation - use conditional imports
  let fs: typeof import('fs') | undefined;
  let path: typeof import('path') | undefined;

  try {
    const dynamicRequire = new Function('id', 'return require(id)');
    fs = dynamicRequire('fs');
    path = dynamicRequire('path');
  } catch {
    fs = undefined;
    path = undefined;
  }

  let themesCache: Record<string, ThemeDefinition> | null = null;

  const findThemesJson = (): string | null => {
    if (!fs || !path) return null;

    // First try a stable fallback path relative to cwd (for ESM/test environments)
    const fallback = path.resolve(process.cwd(), 'src', 'theme', 'themes.json');
    try {
      if (fs.existsSync(fallback)) {
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
      const themesPath = path.join(currentDir, 'themes.json');
      try {
        if (fs.existsSync(themesPath)) {
          return themesPath;
        }
      } catch {
        // ignore and continue upwards
      }
      currentDir = path.dirname(currentDir);
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
          themesCache = JSON.parse(themesJson);
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
