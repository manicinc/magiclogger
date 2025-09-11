# Function: getTerminalSupport()

> **getTerminalSupport**(): [`TerminalSupport`](../../../types/terminal/interfaces/TerminalSupport.md)

Defined in: [src/utils/terminal.ts:458](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/terminal.ts#L458)

Get information about the terminal's capabilities as detected at runtime.
Detection is environment-based and not affected by test overrides.

## Returns

[`TerminalSupport`](../../../types/terminal/interfaces/TerminalSupport.md)

Snapshot containing colors, styles, and feature support.
