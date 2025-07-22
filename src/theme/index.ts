import { isBrowserEnvironment } from '../utils/environment';
import type { ThemeDefinition } from '../types';

let themeLoader: {
  loadThemes: () => Record<string, ThemeDefinition>;
  getTheme: (name: string) => ThemeDefinition | undefined;
  listThemes: () => string[];
};

if (isBrowserEnvironment()) {
  themeLoader = require('./loader.browser');
} else {
  themeLoader = require('./loader');
}

export const loadThemes = themeLoader.loadThemes;
export const getTheme = themeLoader.getTheme;
export const listThemes = themeLoader.listThemes;
