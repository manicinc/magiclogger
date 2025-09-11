# Function: getFallbackStyle()

> **getFallbackStyle**(`style`): `string`

Defined in: [src/utils/terminal.ts:435](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/terminal.ts#L435)

Get an appropriate fallback style when a style is not supported by the terminal.
In tests, this returns mapped fallbacks for known styles and 'normal' for unknowns.

## Parameters

### style

`string`

Original style name.

## Returns

`string`

Fallback style name (e.g., 'italic' -> 'normal', 'strikethrough' -> 'normal').
