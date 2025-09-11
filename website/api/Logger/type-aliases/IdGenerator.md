# Type Alias: IdGenerator()

> **IdGenerator** = () => `string`

Defined in: [src/Logger.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L51)

ID generator function type for creating unique log entry identifiers.

## Returns

`string`

A unique identifier string

## Example

```typescript
const customIdGenerator: IdGenerator = () => {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```
