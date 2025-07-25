import { isBrowserEnvironment } from '../utils/environment';
import type { ThemeDefinition } from '../types';

let loadThemes: () => Record<string, ThemeDefinition>;
let getTheme: (name: string) => ThemeDefinition | undefined;
let listThemes: () => string[];

if (isBrowserEnvironment()) {
  // Browser implementation - no file system access
  loadThemes = () => ({});
  getTheme = (_name: string) => {
    // Return undefined for browser, themes would need to be provided differently
    return undefined;
  };
  listThemes = () => ['default'];
} else {
  // Node.js implementation - use conditional imports
  let fs: any;
  let path: any;

  try {
    // Use function constructor to avoid static analysis
    const dynamicRequire = new Function('id', 'return require(id)');
    fs = dynamicRequire('fs');
    path = dynamicRequire('path');
  } catch {
    // Fallback for environments where require is not available
    fs = null;
    path = null;
  }

  let themesCache: Record<string, ThemeDefinition> | null = null;

  const findThemesJson = (): string | null => {
    if (!fs || !path) return null;
    let currentDir = __dirname;
    for (let i = 0; i < 5; i++) {
      const themesPath = path.join(currentDir, 'themes.json');
      if (fs.existsSync(themesPath)) {
        return themesPath;
      }
      currentDir = path.dirname(currentDir);
    }
    return null;
  };

  loadThemes = () => {
    if (themesCache) {
      return themesCache;
    }

    if (!fs) {
      console.warn('File system not available. Using empty themes cache.');
      themesCache = {};
      return themesCache;
    }

    const themesPath = findThemesJson();
    if (themesPath) {
      try {
        const themesJson = fs.readFileSync(themesPath, 'utf-8');
        themesCache = JSON.parse(themesJson);
      } catch (error) {
        console.error('Error loading themes.json:', error);
        themesCache = {};
      }
    } else {
      console.warn('themes.json not found. Using empty themes cache.');
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
