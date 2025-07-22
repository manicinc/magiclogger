import type { ThemeDefinition } from '../types';

// This is a browser-specific implementation.
// It returns an empty object because themes are not loaded from files in the browser.
export function loadThemes(): Record<string, ThemeDefinition> {
  return {};
}

export function getTheme(name: string): ThemeDefinition | undefined {
  // In a browser context, you might have a default theme or fetch themes from an API.
  // For now, we'll just return undefined if the name isn't 'default'.
  if (name === 'default') {
    // You could return a default theme object here.
  }
  return undefined;
}

export function listThemes(): string[] {
  // Return a default list of themes or an empty array.
  return ['default'];
}
