/* Theme loader browser shim tests */

describe('theme/loader.browser', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns empty themes object and listThemes default', async () => {
    const mod = await import('../../../src/theme/loader.browser');
    expect(mod.loadThemes()).toEqual({});
    expect(mod.getTheme('anything')).toBeUndefined();
    expect(mod.listThemes()).toEqual(['default']);
  });
});
