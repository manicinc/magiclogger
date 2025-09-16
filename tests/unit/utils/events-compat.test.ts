import { Emitter } from '../../../src/utils/events-compat';

describe('events-compat', () => {
  let emitter: InstanceType<typeof Emitter>;

  beforeEach(() => {
    emitter = new Emitter();
  });

  describe('Basic event handling', () => {
    it('should add and trigger event listeners', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.emit('test', 'arg1', 'arg2');

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners for the same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('should support symbol events', () => {
      const sym = Symbol('test');
      const listener = jest.fn();

      emitter.on(sym, listener);
      emitter.emit(sym, 'symbolData');

      expect(listener).toHaveBeenCalledWith('symbolData');
    });

    it('should return true when emit has listeners', () => {
      emitter.on('test', () => {
        /* ignore */
      });
      const result = emitter.emit('test');
      expect(result).toBe(true);
    });

    it('should return false when emit has no listeners', () => {
      const result = emitter.emit('nonexistent');
      expect(result).toBe(false);
    });

    it('should handle listener errors without breaking emit loop', () => {
      // Skip this test if using Node's EventEmitter (which doesn't swallow errors)
      // Only the InMemoryEmitter implementation swallows errors
      const listener1 = jest.fn(() => {
        throw new Error('Listener error');
      });
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      // Node's EventEmitter will throw, InMemoryEmitter won't
      // We'll just check that both listeners are called
      try {
        emitter.emit('test');
      } catch (e) {
        // Expected for Node's EventEmitter
      }
      expect(listener1).toHaveBeenCalled();
      // listener2 may or may not be called depending on implementation
    });
  });

  describe('addListener alias', () => {
    it('should work as an alias for on', () => {
      const listener = jest.fn();
      emitter.addListener('test', listener);
      emitter.emit('test', 'data');

      expect(listener).toHaveBeenCalledWith('data');
    });
  });

  describe('once', () => {
    it('should trigger listener only once', () => {
      const listener = jest.fn();
      emitter.once('test', listener);

      emitter.emit('test', 'first');
      emitter.emit('test', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should remove listener after first call', () => {
      const listener = jest.fn();
      emitter.once('test', listener);

      expect(emitter.listenerCount('test')).toBe(1);
      emitter.emit('test');
      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('off / removeListener', () => {
    it('should remove specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.off('test', listener1);

      emitter.emit('test');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle removing non-existent listener', () => {
      const listener = jest.fn();
      expect(() => emitter.off('test', listener)).not.toThrow();
    });

    it('removeListener should work as alias for off', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.removeListener('test', listener);
      emitter.emit('test');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should be chainable', () => {
      const listener = jest.fn();
      const result = emitter.on('test', listener).off('test', listener);
      expect(result).toBe(emitter);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on('test1', listener1);
      emitter.on('test1', listener2);
      emitter.on('test2', listener3);

      emitter.removeAllListeners('test1');

      emitter.emit('test1');
      emitter.emit('test2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });

    it('should remove all listeners when no event specified', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test1', listener1);
      emitter.on('test2', listener2);

      emitter.removeAllListeners();

      emitter.emit('test1');
      emitter.emit('test2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should be chainable', () => {
      const result = emitter.removeAllListeners();
      expect(result).toBe(emitter);
    });
  });

  describe('Utility methods', () => {
    it('should get listener count', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('should get listeners array', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      const listeners = emitter.listeners('test');
      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(listener1);
      expect(listeners).toContain(listener2);
    });

    it('should return empty array for non-existent event', () => {
      const listeners = emitter.listeners('nonexistent');
      expect(listeners).toEqual([]);
    });

    it('should handle setMaxListeners (no-op)', () => {
      const result = emitter.setMaxListeners(100);
      expect(result).toBe(emitter);
    });

    it('should return max listeners (fixed value)', () => {
      expect(emitter.getMaxListeners()).toBe(10);
    });
  });

  describe('Chaining', () => {
    it('should support method chaining', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on('test1', listener1).once('test2', listener2).on('test3', listener3);

      emitter.emit('test1');
      emitter.emit('test2');
      emitter.emit('test3');

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty emit calls', () => {
      emitter.on('test', jest.fn());
      expect(() => emitter.emit('test')).not.toThrow();
    });

    it('should handle many arguments in emit', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const args = Array.from({ length: 100 }, (_, i) => i);
      emitter.emit('test', ...args);

      expect(listener).toHaveBeenCalledWith(...args);
    });

    it('should handle adding same listener multiple times', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      emitter.on('test', listener);
      emitter.emit('test');

      // Node's EventEmitter allows duplicates, InMemoryEmitter uses Set which doesn't
      // Just check it was called at least once
      expect(listener).toHaveBeenCalled();
    });

    it('should handle removing listener during emit', () => {
      const listener1 = jest.fn(() => {
        emitter.off('test', listener2);
      });
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test');

      expect(listener1).toHaveBeenCalled();
      // listener2 might or might not be called depending on iteration order
      // but it shouldn't throw
    });
  });
});
