# Class: Printer

Defined in: [src/core/Printer.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L84)

Printer module abstracts output logic for both terminal and browser environments.

Features:
- Cross-platform output handling
- Table formatting for both environments
- Progress bar support
- Stream redirection
- Performance optimizations
- Memory-safe output

 Printer

## Example

```typescript
// Configure printer
Printer.configure({
  useColors: true,
  timestamps: true
});

// Print formatted output
Printer.print('Hello World');

// Print table
Printer.printTable([
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
]);
```

## Constructors

### Constructor

> **new Printer**(): `Printer`

#### Returns

`Printer`

## Methods

### clear()

> `static` **clear**(): `void`

Defined in: [src/core/Printer.ts:944](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L944)

Clear the console/terminal.

#### Returns

`void`

#### Static

***

### clearBuffer()

> `static` **clearBuffer**(): `void`

Defined in: [src/core/Printer.ts:250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L250)

Clear the output buffer without flushing.

#### Returns

`void`

#### Static

***

### configure()

> `static` **configure**(`options`): `void`

Defined in: [src/core/Printer.ts:182](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L182)

Configure printer options.

#### Parameters

##### options

[`PrinterOptions`](../interfaces/PrinterOptions.md)

Configuration options

#### Returns

`void`

#### Static

***

### endProgress()

> `static` **endProgress**(`options`): `void`

Defined in: [src/core/Printer.ts:513](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L513)

Public API to end a progress line.
When clear is true, erase the progress line; otherwise, finalize by moving to next line.

#### Parameters

##### options

###### clear?

`boolean`

#### Returns

`void`

***

### flush()

> `static` **flush**(): `void`

Defined in: [src/core/Printer.ts:219](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L219)

Flush the output buffer.

#### Returns

`void`

#### Static

***

### getStream()

> `static` **getStream**(): `Console` \| `WriteStream`

Defined in: [src/core/Printer.ts:1042](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L1042)

Get output stream.

#### Returns

`Console` \| `WriteStream`

Output stream

#### Static

***

### getTerminalSize()

> `static` **getTerminalSize**(): `object`

Defined in: [src/core/Printer.ts:1011](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L1011)

Get terminal size.

#### Returns

`object`

Terminal dimensions

##### columns

> **columns**: `number`

##### rows

> **rows**: `number`

#### Static

***

### hideCursor()

> `static` **hideCursor**(): `void`

Defined in: [src/core/Printer.ts:989](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L989)

Hide cursor (terminal only).

#### Returns

`void`

#### Static

***

### isTTY()

> `static` **isTTY**(): `boolean`

Defined in: [src/core/Printer.ts:1028](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L1028)

Check if output is a TTY.

#### Returns

`boolean`

True if TTY

#### Static

***

### moveCursor()

> `static` **moveCursor**(`x`, `y`): `void`

Defined in: [src/core/Printer.ts:959](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L959)

Move cursor to specific position (terminal only).

#### Parameters

##### x

`number`

X position

##### y

`number`

Y position

#### Returns

`void`

#### Static

***

### print()

> `static` **print**(`message`): `void`

Defined in: [src/core/Printer.ts:261](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L261)

Prints a log message to console.
Handles browser or terminal output.

#### Parameters

##### message

`string`

The formatted message

#### Returns

`void`

#### Static

***

### printError()

> `static` **printError**(`message`): `void`

Defined in: [src/core/Printer.ts:361](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L361)

Print to error stream.

#### Parameters

##### message

`string`

Error message

#### Returns

`void`

#### Static

***

### printLines()

> `static` **printLines**(`lines`): `void`

Defined in: [src/core/Printer.ts:315](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L315)

Print multiple lines efficiently.

#### Parameters

##### lines

`string`[]

Array of lines to print

#### Returns

`void`

#### Static

***

### printProgress()

> `static` **printProgress**(`bar`, `percent`, `options`): `void`

Defined in: [src/core/Printer.ts:379](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L379)

Print progress bar visually.

#### Parameters

##### bar

`string`

The filled bar string

##### percent

`string`

The percentage string

##### options

Additional options

###### current?

`number`

###### label?

`string`

###### showSpeed?

`boolean`

###### showTime?

`boolean`

###### total?

`number`

#### Returns

`void`

#### Static

***

### printTable()

> `static` **printTable**(`data`, `headerColors`, `options`): `void`

Defined in: [src/core/Printer.ts:530](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L530)

Print tabular data with proper formatting for both environments.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

Array of objects

##### headerColors

`string`[] = `...`

Colors for header row

##### options

Table options

###### borderStyle?

`"none"` \| `"single"` \| `"double"`

###### compact?

`boolean`

###### maxColumnWidth?

`number`

###### showIndex?

`boolean`

###### truncate?

`boolean`

#### Returns

`void`

#### Static

***

### printTree()

> `static` **printTree**(`data`, `options`): `void`

Defined in: [src/core/Printer.ts:841](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L841)

Print a tree structure.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>

Tree data

##### options

Tree options

###### colors?

`boolean`

###### label?

`string`

###### maxDepth?

`number`

###### showValues?

`boolean`

#### Returns

`void`

#### Static

***

### redirect()

> `static` **redirect**(`stream`): `void`

Defined in: [src/core/Printer.ts:1052](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L1052)

Redirect output to a different stream.

#### Parameters

##### stream

`WriteStream`

New output stream

#### Returns

`void`

#### Static

***

### reset()

> `static` **reset**(): `void`

Defined in: [src/core/Printer.ts:1062](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L1062)

Reset output to default stream.

#### Returns

`void`

#### Static

***

### restoreCursor()

> `static` **restoreCursor**(): `void`

Defined in: [src/core/Printer.ts:979](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L979)

Restore cursor position (terminal only).

#### Returns

`void`

#### Static

***

### saveCursor()

> `static` **saveCursor**(): `void`

Defined in: [src/core/Printer.ts:969](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L969)

Save cursor position (terminal only).

#### Returns

`void`

#### Static

***

### setUseColors()

> `static` **setUseColors**(`useColors`): `void`

Defined in: [src/core/Printer.ts:193](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L193)

Set whether to use colors in the output.

#### Parameters

##### useColors

`boolean`

Whether to enable colors

#### Returns

`void`

#### Static

***

### showCursor()

> `static` **showCursor**(): `void`

Defined in: [src/core/Printer.ts:999](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L999)

Show cursor (terminal only).

#### Returns

`void`

#### Static

***

### startBuffering()

> `static` **startBuffering**(): `void`

Defined in: [src/core/Printer.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L202)

Enable output buffering.

#### Returns

`void`

#### Static

***

### stopBuffering()

> `static` **stopBuffering**(): `void`

Defined in: [src/core/Printer.ts:210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L210)

Disable buffering and flush buffer.

#### Returns

`void`

#### Static
