# Function: readFileCompat()

> **readFileCompat**(`filePath`, `encoding`): `Promise`\<`string`\>

Defined in: [src/utils/fs-compatibility.ts:40](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/fs-compatibility.ts#L40)

Read file contents in Node or fetch over HTTP(S) in browser as a fallback.

Attempts dynamic import of `fs/promises` first; if that fails (e.g. browser
build), falls back to `fetch`.

## Parameters

### filePath

`string`

Local file system path or URL accessible via fetch

### encoding

`BufferEncoding` = `'utf-8'`

Text encoding when using fs (ignored for fetch -> always UTF-8 text)

## Returns

`Promise`\<`string`\>
