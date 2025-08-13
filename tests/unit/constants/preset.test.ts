describe('preset constants', () => {
  afterEach(() => {
    jest.resetModules();
    delete (globalThis as Record<string, unknown>).__CUSTOM_THEME__;
  });

  function mockTheme(theme?: Record<string, string[]>) {
    jest.doMock('../../../src/theme', () => ({
      getTheme: () => theme,
    }));
  }

  it('getPresetColors returns theme preset and fallback white when missing', async () => {
    mockTheme({ info: ['cyan'], custom: ['magenta', 'bold'] });
    const { getPresetColors } = await import('../../../src/constants/preset');
    expect(getPresetColors('info')).toEqual(['cyan']);
    expect(getPresetColors('missing')).toEqual(['white']);
  });

  it('getPresetNames returns keys or empty array', async () => {
    mockTheme({ a: ['red'], b: ['blue'] });
    const { getPresetNames } = await import('../../../src/constants/preset');
    expect(getPresetNames()).toEqual(expect.arrayContaining(['a', 'b']));
    jest.resetModules();
    mockTheme(undefined);
    const { getPresetNames: getPresetNames2 } = await import('../../../src/constants/preset');
    expect(getPresetNames2()).toEqual([]);
  });

  it('hasPreset returns true / false depending on theme presence', async () => {
    mockTheme({ one: ['green'] });
    const { hasPreset } = await import('../../../src/constants/preset');
    expect(hasPreset('one')).toBe(true);
    expect(hasPreset('two')).toBe(false);
    jest.resetModules();
    mockTheme(undefined);
    const { hasPreset: hasPreset2 } = await import('../../../src/constants/preset');
    expect(hasPreset2('one')).toBe(false);
  });

  it('getPreset returns preset or undefined', async () => {
    mockTheme({ x: ['yellow'] });
    const { getPreset } = await import('../../../src/constants/preset');
    expect(getPreset('x')).toEqual(['yellow']);
    expect(getPreset('y')).toBeUndefined();
    jest.resetModules();
    mockTheme(undefined);
    const { getPreset: getPreset2 } = await import('../../../src/constants/preset');
    expect(getPreset2('x')).toBeUndefined();
  });

  it('getAllPresets merges theme and extended presets', async () => {
    mockTheme({ base: ['cyan'] });
    const { getAllPresets, EXTENDED_PRESETS } = await import('../../../src/constants/preset');
    const all = getAllPresets();
    expect(all.base).toEqual(['cyan']);
    // spot check an extended preset
    expect(all.alert).toEqual(EXTENDED_PRESETS.alert);
  });
});
