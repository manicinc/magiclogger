# Interface: PrinterOptions

Defined in: [src/core/Printer.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L13)

Configuration options for Printer.

 PrinterOptions

## Properties

### console?

> `optional` **console**: `Console`

Defined in: [src/core/Printer.ts:40](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L40)

Custom console object (for testing).

***

### stream?

> `optional` **stream**: `WriteStream`

Defined in: [src/core/Printer.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L23)

Output stream (Node.js only).

***

### timestampFormat?

> `optional` **timestampFormat**: `string`

Defined in: [src/core/Printer.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L35)

Timestamp format.

#### Default

```ts
'HH:mm:ss.SSS'
```

***

### timestamps?

> `optional` **timestamps**: `boolean`

Defined in: [src/core/Printer.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L29)

Whether to add timestamps.

#### Default

```ts
false
```

***

### useColors?

> `optional` **useColors**: `boolean`

Defined in: [src/core/Printer.ts:18](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Printer.ts#L18)

Whether to use colors in output.

#### Default

```ts
true
```
