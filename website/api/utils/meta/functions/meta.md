# Function: meta()

> **meta**(`value`): [`MetaArg`](../interfaces/MetaArg.md)

Defined in: [src/utils/meta.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/meta.ts#L20)

Wrap structured metadata so variadic log calls can distinguish it from
printable data. The wrapped object will not be printed to console output
but will be attached to the transport entry as metadata.

## Parameters

### value

`Error` | `Record`\<`string`, `unknown`\> | \{\[`key`: `string`\]: `unknown`; `error?`: `Error`; \}

## Returns

[`MetaArg`](../interfaces/MetaArg.md)
