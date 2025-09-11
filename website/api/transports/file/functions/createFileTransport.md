# Function: createFileTransport()

> **createFileTransport**(`filepath`, `options?`): [`FileTransport`](../../FileTransport/classes/FileTransport.md)

Defined in: [src/transports/file.ts:52](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/file.ts#L52)

Creates a file transport using worker threads.

All file I/O operations happen in a dedicated worker thread,
ensuring the main thread remains responsive.

## Parameters

### filepath

`string`

Path to the log file

### options?

`Record`\<`string`, `unknown`\>

Transport options

## Returns

[`FileTransport`](../../FileTransport/classes/FileTransport.md)

Worker-based file transport

## Example

```typescript
const transport = createFileTransport('./logs/app.log', {
  maxFileSize: 50_000_000,  // 50MB
  compress: true,
  format: 'json'
});
```
