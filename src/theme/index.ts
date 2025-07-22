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
  // Node.js implementation - dynamically import to avoid webpack bundling
  const fs = eval('require')('fs');
  const path = eval('require')('path');
  
  let themesCache: Record<string, ThemeDefinition> | null = null;

  const findThemesJson = (): string | null => {
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
