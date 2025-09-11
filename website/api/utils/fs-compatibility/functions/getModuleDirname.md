# Function: getModuleDirname()

> **getModuleDirname**(`importMeta?`): `string`

Defined in: [src/utils/fs-compatibility.ts:16](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/fs-compatibility.ts#L16)

Derive a directory name for the current module in an ESM / CJS / browser agnostic way.

Resolution order:
1. Provided ImportMeta (test-injected) if it has a `url`.
2. Native `import.meta.url` (ESM environments).
3. `process.cwd()` (CommonJS / generic Node fallback).
4. '/' (browser fallback when nothing else available).

## Parameters

### importMeta?

Import.meta object (optionally injected for tests / bundlers)

`ImportMeta` | \{ `url?`: `string`; \}

## Returns

`string`

Directory path string (best-effort)
