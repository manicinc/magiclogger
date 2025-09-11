# Function: generateId()

> **generateId**(): `string`

Defined in: [src/utils/idGenerator.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/idGenerator.ts#L13)

Generate a unique ID for log entries
Uses crypto.randomUUID if available (Node 14.17+, modern browsers)
Falls back to timestamp + counter + random for compatibility

## Returns

`string`
