# Function: isStyleSupported()

> **isStyleSupported**(`style`): `boolean`

Defined in: [src/utils/terminal.ts:408](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/terminal.ts#L408)

Check if a specific text style is supported by the current terminal.
In tests, this can be overridden via a global `__TEST_TERMINAL_UTILS` hook.

## Parameters

### style

`string`

Style name to check (e.g., 'bold', 'italic').

## Returns

`boolean`

True if supported, otherwise false. Unknown styles return true by default.
