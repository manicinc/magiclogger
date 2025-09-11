# Function: createConsoleTransport()

> **createConsoleTransport**(`options?`): [`ConsoleTransport`](../classes/ConsoleTransport.md)

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:591](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L591)

Factory function to create a ConsoleTransport instance.

## Parameters

### options?

`Partial`\<[`ConsoleTransportOptions`](../interfaces/ConsoleTransportOptions.md)\> = `{}`

Console transport configuration options

## Returns

[`ConsoleTransport`](../classes/ConsoleTransport.md)

New ConsoleTransport instance

## Example

```typescript
const transport = createConsoleTransport({
  useColors: true,
  showTimestamp: true
});
```
