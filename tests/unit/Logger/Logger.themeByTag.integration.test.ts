import { Logger } from '../../../src/Logger';

describe('Logger tag-driven theme selection (integration)', () => {
  it('applies theme via themeByTag mapping', () => {
    const logger = new Logger({ tags: ['acme'], themeByTag: { acme: 'dark' } });
    const theme = logger.getTheme();
    expect(theme.info).toEqual(['brightCyan']);
  });

  it('uses tag name as theme when defined in registry', () => {
    const logger = new Logger({ tags: ['dark'] });
    expect(logger.getTheme().info).toEqual(['brightCyan']);
  });

  it('child logger inherits themeByTag mapping and tags merged', () => {
    const base = new Logger({ tags: ['acme'], themeByTag: { acme: 'dark' } });
    const child = base.child({ tags: ['api'] });
    expect(child.getTheme().info).toEqual(['brightCyan']);
  });
});
