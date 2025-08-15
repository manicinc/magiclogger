import { LoggerBase } from '../../../src/core/LoggerBase';
import type { ColorName } from '../../../src/types';

// A minimal concrete logger to test LoggerBase behavior
class TestLogger extends LoggerBase {
  public printed: Array<{ level: string; msg: string }> = [];
  public customPrinted: Array<{ prefix: string; msg: string; colors: ColorName[] }> = [];

  public info(msg: string): void {
    this.printed.push({ level: 'info', msg });
  }
  public warn(msg: string): void {
    this.printed.push({ level: 'warn', msg });
  }
  public error(msg: string): void {
    this.printed.push({ level: 'error', msg });
  }
  public debug(msg: string): void {
    this.printed.push({ level: 'debug', msg });
  }
  public success(msg: string): void {
    this.printed.push({ level: 'success', msg });
  }
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    this.customPrinted.push({ prefix, msg, colors });
  }
  public styled(_msg: string, _preset: string): void {
    /* noop for tests */
  }
  public header(_title: string, _colors: ColorName[] = ['brightWhite']): void {
    /* noop */
  }
  public table(
    _data: Record<string, unknown>[],
    _headerColor: ColorName[] = ['brightWhite']
  ): void {
    /* noop */
  }
  public progressBar(
    _progress: number,
    _length = 40,
    _completeChar = '#',
    _incompleteChar = '-'
  ): void {
    /* noop */
  }
  public link(_url: string, _description?: string): void {
    /* noop */
  }
  public color(..._colors: ColorName[]): (text: string) => string {
    return (t: string) => t;
  }
  public colorParts(message: string, _colorMap: Record<string, ColorName[]>): string {
    return message;
  }
  public separator(_char = '-', _length = 80): void {
    /* noop */
  }

  // Expose protected helper for testing preset resolution without using any
  public presetColors(preset: string): ColorName[] {
    // Access protected via function indirection without using any
    const key = 'getPresetColors' as const;
    const fn = (this as unknown as Record<typeof key, (p: string) => ColorName[]>)[key];
    return fn(preset);
  }
}

describe('LoggerBase themeByTag and theme selection', () => {
  it('selects theme via themeByTag mapping when tags match', () => {
    const logger = new TestLogger({
      tags: ['api'],
      themeByTag: { api: 'dark' },
    });

    const theme = logger.getTheme();
    expect(theme.info).toEqual(['brightCyan']); // dark variant sets info brightCyan
  });

  it('falls back to named theme when a tag equals a known theme name', () => {
    const logger = new TestLogger({ tags: ['dark'] });
    const theme = logger.getTheme();
    expect(theme.info).toEqual(['brightCyan']);
  });

  it('explicit object theme takes precedence over tag mapping and tag-name fallback', () => {
    const logger = new TestLogger({
      tags: ['api', 'dark'],
      themeByTag: { api: 'dark' },
      theme: { info: ['magenta'] },
    });
    expect(logger.getTheme().info).toEqual(['magenta']);
  });

  it('when both string theme and mapping exist with a match, mapping wins', () => {
    const logger = new TestLogger({
      tags: ['api'],
      themeByTag: { api: 'dark' },
      theme: 'light',
    });
    // mapping to dark should override explicit string 'light'
    expect(logger.getTheme().info).toEqual(['brightCyan']);
  });

  it('updateConfig applies themeByTag when tags change (no explicit theme)', () => {
    const logger = new TestLogger();
    logger.updateConfig({ tags: ['none'] });
    // No mapping yet - default theme
    expect(logger.getTheme().info).toBeDefined();

    logger.updateConfig({ tags: ['acme'], themeByTag: { acme: 'dark' } });
    expect(logger.getTheme().info).toEqual(['brightCyan']);
  });
});

describe('LoggerBase presets and strictLevels', () => {
  it('custom preset overrides theme and built-ins in getPresetColors', () => {
    const logger = new TestLogger({ theme: { special: ['cyan'] } });
    logger.addPreset('special', ['yellow']);
    expect(logger.presetColors('special')).toEqual(['yellow']);
  });

  it('strictLevels throws on unknown level; relaxed routes to custom()', () => {
    const strict = new TestLogger({ strictLevels: true });
    expect(() => strict.log('msg', 'custom')).toThrow(/Invalid log level/);

    const relaxed = new TestLogger({ strictLevels: false });
    relaxed.log('hello', 'custom');
    expect(relaxed.customPrinted.length).toBe(1);
    expect(relaxed.customPrinted[0].prefix).toBe('CUSTOM');
  });
});

describe('LoggerBase performance tracking and config snapshot', () => {
  it('tracks performance stats per level', () => {
    const logger = new TestLogger();
    logger.log('a', 'info');
    logger.log('b', 'warn');
    logger.log('c', 'error');
    const stats = logger.getPerformanceStats();
    expect(stats.info.count).toBeGreaterThanOrEqual(1);
    expect(stats.warn.count).toBeGreaterThanOrEqual(1);
    expect(stats.error.count).toBeGreaterThanOrEqual(1);
    logger.resetPerformanceStats();
    const reset = logger.getPerformanceStats();
    expect(Object.keys(reset).length).toBe(0);
  });

  it('getConfig returns theme and themeByTag', () => {
    const logger = new TestLogger({ tags: ['api'], themeByTag: { api: 'dark' } });
    const cfg = logger.getConfig();
    expect(cfg.themeByTag).toEqual({ api: 'dark' });
    expect(cfg.theme.info).toEqual(['brightCyan']);
  });
});
