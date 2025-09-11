// Lightweight EventEmitter compatible shim for cross-environment builds.
// In Node, we prefer the native 'events' module if available. In browsers,
// we fall back to a tiny in-memory implementation with on/off/once/emit.

type Listener = (...args: unknown[]) => void;

class InMemoryEmitter {
  private handlers = new Map<string | symbol, Set<Listener>>();

  on(event: string | symbol, listener: Listener): this {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set<Listener>();
      this.handlers.set(event, set);
    }
    set.add(listener);
    return this;
  }

  addListener(event: string | symbol, listener: Listener): this {
    return this.on(event, listener);
  }

  once(event: string | symbol, listener: Listener): this {
    const wrap: Listener = (...args) => {
      this.off(event, wrap);
      listener(...args);
    };
    return this.on(event, wrap);
  }

  off(event: string | symbol, listener: Listener): this {
    const set = this.handlers.get(event);
    if (set) set.delete(listener);
    return this;
  }

  removeListener(event: string | symbol, listener: Listener): this {
    return this.off(event, listener);
  }

  removeAllListeners(event?: string | symbol): this {
    if (typeof event === 'undefined') {
      this.handlers.clear();
    } else {
      this.handlers.delete(event);
    }
    return this;
  }

  emit(event: string | symbol, ...args: unknown[]): boolean {
    const set = this.handlers.get(event);
    if (!set || set.size === 0) return false;
    for (const fn of Array.from(set)) {
      try {
        fn(...args);
      } catch (e) {
        // Swallow errors from listeners to avoid breaking emit loop in browser/demo builds.
      }
    }
    return true;
  }

  // Node compatibility no-ops
  setMaxListeners(_n: number): this {
    return this;
  }
  getMaxListeners(): number {
    return 10;
  }
  listeners(event: string | symbol): Listener[] {
    return Array.from(this.handlers.get(event) ?? []);
  }
  listenerCount(event: string | symbol): number {
    return this.handlers.get(event)?.size ?? 0;
  }
}

// Export a class named Emitter that is either Node's EventEmitter or the in-memory shim
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let NodeEmitter: typeof import('events').EventEmitter | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = typeof require === 'function' ? require('events') : null;
  NodeEmitter = mod?.EventEmitter as typeof import('events').EventEmitter;
} catch {
  NodeEmitter = undefined;
}

export const Emitter: new () => InMemoryEmitter =
  (NodeEmitter as unknown as new () => InMemoryEmitter) || InMemoryEmitter;
