import * as fs from 'fs';
import * as path from 'path';
import type { ThemeDefinition } from '../types/theme';

let themesCache: Record<string, ThemeDefinition> | null = null;

function findThemesJson(): string | null {
  let currentDir = __dirname;
  for (let i = 0; i < 5; i++) {
    const themesPath = path.join(currentDir, 'themes.json');
    if (fs.existsSync(themesPath)) {
      return themesPath;
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

export function loadThemes(): Record<string, ThemeDefinition> {
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
}

export function getTheme(name: string): ThemeDefinition | undefined {
  const themes = loadThemes();
  return themes[name];
}

export function listThemes(): string[] {
  const themes = loadThemes();
  return Object.keys(themes);
}
