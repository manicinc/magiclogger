# Variable: JSONFormatters

> `const` **JSONFormatters**: `object`

Defined in: [src/transports/formatters/JSONFormatter.ts:319](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L319)

Create a JSON formatter with common presets.

## Type Declaration

### compact()

> **compact**: () => [`JSONFormatter`](../classes/JSONFormatter.md)

Compact single-line JSON for production.

#### Returns

[`JSONFormatter`](../classes/JSONFormatter.md)

### extended()

> **extended**: () => [`JSONFormatter`](../classes/JSONFormatter.md)

Extended JSON with all fields.

#### Returns

[`JSONFormatter`](../classes/JSONFormatter.md)

### flat()

> **flat**: () => [`JSONFormatter`](../classes/JSONFormatter.md)

Flattened JSON for easier parsing.

#### Returns

[`JSONFormatter`](../classes/JSONFormatter.md)

### minimal()

> **minimal**: () => [`JSONFormatter`](../classes/JSONFormatter.md)

Minimal JSON with only essential fields.

#### Returns

[`JSONFormatter`](../classes/JSONFormatter.md)

### pretty()

> **pretty**: () => [`JSONFormatter`](../classes/JSONFormatter.md)

Pretty-printed JSON for development.

#### Returns

[`JSONFormatter`](../classes/JSONFormatter.md)
