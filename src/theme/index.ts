import * as fs from 'fs';
import * as path from 'path';

import type { ThemeDefinition, ThemeMap } from '../types/theme';

const THEME_PATH = path.resolve(__dirname, 'themes.json');

let loadedThemes: ThemeMap = {};

/**
 * Load and parse all themes from the local JSON file
 * @returns Parsed theme map
 */
export function loadThemes(): ThemeMap {
  if (!fs.existsSync(THEME_PATH)) {
    throw new Error(`Theme file not found at: ${THEME_PATH}`);
  }

  const raw = fs.readFileSync(THEME_PATH, 'utf-8');
  loadedThemes = JSON.parse(raw);
  return loadedThemes;
}

/**
 * Get a single theme by name
 * @param name The theme name to retrieve (defaults to 'default')
 * @returns The theme definition
 */
export function getTheme(name = 'default'): ThemeDefinition {
  if (!Object.keys(loadedThemes).length) {
    loadThemes();
  }
  return loadedThemes[name] || loadedThemes['default'];
}

/**
 * List all available theme names
 * @returns Array of available theme names
 */
export function listThemes(): string[] {
  if (!Object.keys(loadedThemes).length) {
    loadThemes();
  }
  return Object.keys(loadedThemes);
}
