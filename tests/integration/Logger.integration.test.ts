import { enhanceConsole } from '../../src/compatibility'; // Adjust path if needed

describe('enhanceConsole integration', () => {
  it('runs the demo script correctly', () => {
    // Spy on console.log and console.error to suppress actual output and verify usage
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // === DEMO SCRIPT START ===

    // Before enhancement
    console.log('BEFORE ENHANCEMENT:');
    console.log('Standard log message');
    console.error('Standard error message');
    console.log('');

    // Enhance the global console object
    const { restoreConsole } = enhanceConsole();

    // After enhancement with added methods
    console.log('AFTER ENHANCEMENT:');
    console.log('Enhanced log message');
    console.error('Enhanced error message');

    // New capabilities (only available after enhancement)
    console.log('\nNEW CAPABILITIES:');
    (console as any).success('Success message (new method)');
    (console as any).header('THIS IS A HEADER');

    // Restore the original console
    console.log('\nRESTORING ORIGINAL CONSOLE...');
    restoreConsole();
    console.log('Back to standard console');

    // === DEMO SCRIPT END ===

    // Verify expected console usage
    expect(logSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    // After restoration, custom methods should no longer exist
    expect((console as any).success).toBeUndefined();
    expect((console as any).header).toBeUndefined();

    // Clean up spies
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
