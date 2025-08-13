// File: tests/unit/transports/entrypoints/registryInstall.test.ts
// Import from transports index which should export the helper
import { __installTransportRegistry, TransportRegistry } from '../../../../src/transports/index';

describe('transports index registry install helper', () => {
  beforeEach(() => {
    // Clean any previous globals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__MAGICLOGGER_TRANSPORT_REGISTRY__;
  });

  it('installs on provided global object', () => {
    const g: Record<string, unknown> = {};
    const result = __installTransportRegistry(g, undefined);
    expect(result).toBe('global');
    expect(g.__MAGICLOGGER_TRANSPORT_REGISTRY__).toBe(TransportRegistry);
  });

  it('installs on provided window object when global missing', () => {
    const w: Record<string, unknown> = {};
    const result = __installTransportRegistry(undefined, w);
    expect(result).toBe('window');
    expect(w.__MAGICLOGGER_TRANSPORT_REGISTRY__).toBe(TransportRegistry);
  });

  it('returns none when neither target present', () => {
    const result = __installTransportRegistry(undefined, undefined);
    expect(result).toBe('none');
  });
});
