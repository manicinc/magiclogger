# Type Alias: LogMetadata

> **LogMetadata** = `Record`\<`string`, `unknown`\>

Defined in: [src/Logger.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L68)

Metadata type for log entries.
Can contain any key-value pairs for additional context.

## Example

```typescript
const metadata: LogMetadata = {
  userId: '12345',
  requestId: 'abc-def-ghi',
  environment: 'production'
};
```
