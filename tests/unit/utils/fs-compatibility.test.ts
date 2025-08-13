import { getModuleDirname, readFileCompat, resolvePathCompat } from '../../../src/utils/fs-compatibility';
import path from 'path';
import { pathToFileURL } from 'url';

describe('fs-compatibility utilities', () => {
  describe('getModuleDirname', () => {
    it('uses provided importMeta url when available', () => {
      const expectedDir = path.join(process.cwd(), 'tmp', 'example');
      const fakeUrl = pathToFileURL(path.join(expectedDir, 'file.js')).href;
      const dir = getModuleDirname({ url: fakeUrl });
      expect(dir).toBe(expectedDir);
    });

    it('falls back to process.cwd when no url provided', () => {
      const dir = getModuleDirname({});
      expect(dir).toBe(process.cwd());
    });
  });

  describe('resolvePathCompat', () => {
    it('resolves relative path', () => {
      const base = process.cwd();
      const resolved = resolvePathCompat(base, 'package.json');
      expect(resolved).toContain('package.json');
    });
  });

  describe('readFileCompat', () => {
    it('reads an existing local file via fs', async () => {
      const content = await readFileCompat('package.json');
      expect(content).toContain('name');
    });

    it('falls back to fetch when fs import fails (simulated)', async () => {
      // Monkey patch global import to throw inside dynamic import by temporarily shadowing import() is not feasible.
      // Instead, we simulate by passing an HTTP(S) URL to trigger fetch path (fs.readFile will throw ENOENT then fetch will likely fail). To keep test deterministic, we skip if fetch not available.
      if (typeof fetch !== 'function') return; // environment guard
      // Use a data URL to ensure fetch succeeds without network.
      const dataUrl = 'data:text/plain,hello-world';
      const text = await readFileCompat(dataUrl);
      expect(text).toBe('hello-world');
    });
  });
});
