# Function: resolvePathCompat()

> **resolvePathCompat**(`basePath`, `relativePath`): `string`

Defined in: [src/utils/fs-compatibility.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/fs-compatibility.ts#L61)

Resolve a relative path from a base path producing an absolute path (Node semantics).
In browser bundlers this still produces a concatenated path using Node polyfill semantics.

## Parameters

### basePath

`string`

### relativePath

`string`

## Returns

`string`
