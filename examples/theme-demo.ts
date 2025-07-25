import { Logger } from 'magiclogger';
import * as fs from 'fs';
import type { ColorName, ThemeDefinition } from 'magiclogger';
import { getTheme, listThemes } from 'magiclogger/theme';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manualThemesPath = path.resolve(__dirname, '..', 'src/theme/themes.json');
let manualThemes: Record<string, Record<string, ColorName[]>> = {};

try {
  const raw = fs.readFileSync(manualThemesPath, 'utf-8');
  manualThemes = JSON.parse(raw);
} catch (err) {
  console.warn('Manual theme file not found or invalid:', err);
}

// Use theme functions to get all available themes
const availableThemes = listThemes();

console.log('\n=== MagicLogger Theme Demo ===\n');

for (const themeName of availableThemes) {
  console.log(`\n>>> Theme: ${themeName.toUpperCase()}`);

  const theme = getTheme(themeName);
  if (!theme) continue;

  const logger = new Logger({ verbose: true });

  for (const level of Object.keys(theme)) {
    const colors = theme[level as keyof ThemeDefinition] as ColorName[];
    if (Array.isArray(colors)) {
      logger.custom(
        `This is a '${level}' level message in ${themeName} theme`,
        colors,
        level.toUpperCase()
      );
    }
  }

  logger.header(
    `Header Example in '${themeName}' Theme`,
    (theme.header as ColorName[]) || ['brightWhite', 'bgBlue', 'bold']
  );

  logger.table(
    [
      { level: 'info', color: (theme.info as ColorName[])?.join(', ') || 'cyan, bold' },
      { level: 'success', color: (theme.success as ColorName[])?.join(', ') || 'green, bold' },
      { level: 'warning', color: (theme.warning as ColorName[])?.join(', ') || 'yellow, bold' },
      { level: 'error', color: (theme.error as ColorName[])?.join(', ') || 'red, bold' },
    ],
    (theme.header as ColorName[]) || ['brightWhite', 'bold']
  );

  logger.progressBar(65);
  logger.link('https://magiclogger.dev', 'Visit Docs');

  console.log('\n------------------------------\n');
}

if (Object.keys(manualThemes).length > 0) {
  console.log('\n=== MagicLogger Theme Demo (Manual Themes) ===\n');

  for (const themeName of Object.keys(manualThemes)) {
    console.log(`\n>>> Theme: ${themeName.toUpperCase()}`);

    const logger = new Logger({ verbose: true });
    const theme = manualThemes[themeName];

    for (const level of Object.keys(theme)) {
      const colors = theme[level] as ColorName[];
      logger.custom(
        `This is a '${level}' level message in ${themeName} theme`,
        colors,
        level.toUpperCase()
      );
    }

    logger.header(
      `Header Example in '${themeName}' Theme`,
      (theme.header as ColorName[]) || ['brightWhite', 'bgBlue', 'bold']
    );

    logger.table(
      [
        { level: 'info', color: theme.info?.join(', ') },
        { level: 'success', color: theme.success?.join(', ') },
        { level: 'warning', color: theme.warning?.join(', ') },
        { level: 'error', color: theme.error?.join(', ') },
      ],
      (theme.header as ColorName[]) || ['brightWhite', 'bold']
    );

    logger.progressBar(65);
    logger.link('https://magiclogger.dev', 'Visit Docs');

    console.log('\n------------------------------\n');
  }
}
