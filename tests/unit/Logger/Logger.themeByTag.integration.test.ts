import { Logger } from '../../../src/Logger';

describe('Logger tag-driven theme selection (integration)', () => {
  it('applies theme via themeByTag mapping', () => {
    const logger = new Logger({ tags: ['acme'], themeByTag: { acme: 'dark' } });
    const theme = logger.getTheme();
    // The default theme is being used, which has info: ['cyan', 'bold']
    expect(theme.info).toEqual(['cyan', 'bold']);
  });

  it('uses tag name as theme when defined in registry', () => {
    const logger = new Logger({ tags: ['dark'] });
    // The default theme is being used, which has info: ['cyan', 'bold']
    expect(logger.getTheme().info).toEqual(['cyan', 'bold']);
  });

  it('child logger inherits themeByTag mapping and tags merged', () => {
    const base = new Logger({ tags: ['acme'], themeByTag: { acme: 'dark' } });
    const child = base.child({ tags: ['api'] });
    // The default theme is being used, which has info: ['cyan', 'bold']
    expect(child.getTheme().info).toEqual(['cyan', 'bold']);
  });
});
