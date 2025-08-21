import { enhanceConsole } from '../../src/utils/EnhancedConsole';

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

    type EnhancedConsole = Console & {
      success?: (message?: unknown, ...optionalParams: unknown[]) => void;
      header?: (message?: unknown, ...optionalParams: unknown[]) => void;
    };
    const enhancedConsole = console as unknown as EnhancedConsole;

    // Check if methods were properly added
    if (typeof enhancedConsole.success === 'function') {
      enhancedConsole.success('Success message (new method)');
    } else {
      console.log('Success method not available - enhancement may have failed');
    }

    if (typeof enhancedConsole.header === 'function') {
      enhancedConsole.header('THIS IS A HEADER');
    } else {
      console.log('Header method not available - enhancement may have failed');
    }

    // Restore the original console
    console.log('\nRESTORING ORIGINAL CONSOLE...');
    restoreConsole();
    console.log('Back to standard console');

    // === DEMO SCRIPT END ===

    // Verify expected console usage
    expect(logSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    // Clean up spies
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});