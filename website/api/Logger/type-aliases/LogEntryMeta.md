# Type Alias: LogEntryMeta

> **LogEntryMeta** = [`LogMetadata`](LogMetadata.md) \| `Error` \| \{\[`key`: `string`\]: `unknown`; `error?`: `Error`; \}

Defined in: [src/Logger.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L89)

Log entry metadata type that can be an Error, metadata object, or object containing an error.
Provides flexibility in how errors and metadata are passed to log methods.

## Example

```typescript
// Pass an error directly
logger.error('Operation failed', new Error('Connection timeout'));

// Pass metadata with an error
logger.error('Operation failed', {
  error: new Error('Connection timeout'),
  retryCount: 3,
  userId: '12345'
});
```
