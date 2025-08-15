/* Tests for theme/theme entry point */

describe('theme entry module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('exports createThemeManager and returns ThemeManager instance', async () => {
    const mod = await import('../../../src/theme/theme');
    const tm = mod.createThemeManager();
    expect(tm).toBeInstanceOf(mod.ThemeManager);
    expect(typeof tm.getCurrentTheme).toBe('function');
  });
});
