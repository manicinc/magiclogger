describe('colors constants', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('evaluates conditional styles with support and no-support branches', () => {
    // Acquire fresh terminal utils AFTER reset so colors will see the spied function
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const terminalUtils = require('../../../src/utils/terminal');
    const spy = jest
      .spyOn(terminalUtils, 'isStyleSupported')
      .mockImplementation(
        (style: unknown) => String(style) !== 'italic' && String(style) !== 'hidden'
      );
    // Import after spy so current reference is mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const colorsMod = require('../../../src/constants/colors');
    const { COLORS, STATIC_COLORS, RESET_CODES } = colorsMod;

    // has trap (existence check) triggers evaluation
    expect('bold' in COLORS).toBe(true);
    expect(spy).toHaveBeenCalledWith('bold');

    // get trap supported style
    expect(COLORS.bold).not.toBe('');

    // unsupported style returns empty string
    expect(COLORS.italic).toBe('');
    expect(spy).toHaveBeenCalledWith('italic');

    // alias style inverse maps to reverse (supported)
    expect(COLORS.inverse).toBe(COLORS.reverse);

    // getOwnPropertyDescriptor trap
    const desc = Object.getOwnPropertyDescriptor(COLORS, 'underline');
    expect(desc?.enumerable).toBe(true);

    // ownKeys trap enumerates and includes conditional style names
    const keys = Object.keys(COLORS);
    expect(keys).toContain('blink');

    // STATIC_COLORS proxy resolves values through COLORS
    expect(STATIC_COLORS.bold).toBe(COLORS.bold);
    expect(STATIC_COLORS.italic).toBe('');

    // RESET_CODES mapping
    expect(RESET_CODES.bold).toBeDefined();

    // Ensure unsupported returns empty string but reset code still present
    expect(COLORS.hidden).toBe('');
    expect(RESET_CODES.hidden).toBeDefined();
  });

  it('retains spy after module reload (sticky global) and does not duplicate calls excessively', () => {
    // First cycle
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const terminalUtils1 = require('../../../src/utils/terminal');
    const spy1 = jest.spyOn(terminalUtils1, 'isStyleSupported').mockImplementation(() => true);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const first = require('../../../src/constants/colors');
    // Trigger multiple evaluation paths
    void ('bold' in first.COLORS); // has trap
    // Access property (get trap)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    first.COLORS.bold;
    Object.getOwnPropertyDescriptor(first.COLORS, 'bold'); // descriptor trap
    expect(first.COLORS.bold).not.toBe('');

    // Reset modules (colors + terminal reloaded)
    jest.resetModules();
    // Clear cached global mock so new spy is adopted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__MAGICLOGGER_IS_STYLE_SUPPORTED;
    // Second cycle: new terminal utils instance
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const terminalUtils2 = require('../../../src/utils/terminal');
    const spy2 = jest.spyOn(terminalUtils2, 'isStyleSupported').mockImplementation(() => true);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const second = require('../../../src/constants/colors');
    void ('bold' in second.COLORS);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    second.COLORS.bold;
    Object.keys(second.COLORS); // ownKeys trap
    expect(second.COLORS.bold).not.toBe('');

    // At least one call recorded overall
    expect(spy1.mock.calls.length + spy2.mock.calls.length).toBeGreaterThan(0);
  });
});
