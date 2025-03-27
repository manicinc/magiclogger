import * as LoggerExports from '../../src';

describe('Logger module exports', () => {
  it('should export Logger class and constants', () => {
    expect(LoggerExports.Logger).toBeDefined();
    expect(typeof LoggerExports.Logger).toBe('function');

    expect(LoggerExports.COLORS).toBeDefined();
    expect(typeof LoggerExports.COLORS).toBe('object');

    expect(LoggerExports.PRESETS).toBeDefined();
    expect(typeof LoggerExports.PRESETS).toBe('object');
  });

  it('should export utility functions', () => {
    expect(LoggerExports.enhanceConsole).toBeDefined();
    expect(typeof LoggerExports.enhanceConsole).toBe('function');

    expect(LoggerExports.createWinstonCompatible).toBeDefined();
    expect(LoggerExports.createBunyanCompatible).toBeDefined();
    expect(LoggerExports.createPinoCompatible).toBeDefined();
  });

  it('should have properly defined color and preset objects', () => {
    const { COLORS, PRESETS } = LoggerExports;

    expect(COLORS.red).toBeDefined();
    expect(COLORS.blue).toBeDefined();
    expect(COLORS.green).toBeDefined();
    expect(COLORS.bold).toBeDefined();
    expect(COLORS.reset).toBeDefined();

    expect(Array.isArray(PRESETS.info)).toBe(true);
    expect(Array.isArray(PRESETS.error)).toBe(true);
    expect(Array.isArray(PRESETS.success)).toBe(true);
  });

  it('should export a valid module structure', () => {
    expect(typeof LoggerExports).toBe('object');
    expect(Object.keys(LoggerExports).length).toBeGreaterThan(5); // rough sanity check
  });
});
