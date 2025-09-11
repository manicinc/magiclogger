# Function: err()

> **err**(`error`): [`MetaArg`](../interfaces/MetaArg.md)

Defined in: [src/utils/meta.ts:39](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/meta.ts#L39)

Convenience wrapper to attach an Error as structured metadata
(maps to { error }). The error won't be printed unless you also
pass it separately as a printable argument.

## Parameters

### error

`Error`

## Returns

[`MetaArg`](../interfaces/MetaArg.md)
