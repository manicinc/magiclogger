# Class: ContextManager

Defined in: [src/core/ContextManager.ts:172](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L172)

ContextManager handles context data for logging.

Features:
- Deep merging of context objects
- Circular reference detection
- Value sanitization
- Context validation
- Snapshot management
- Performance optimization

 ContextManager

## Example

```typescript
const contextManager = new ContextManager({
  maxDepth: 5,
  sanitizeMode: 'strict'
});

// Set global context
contextManager.set({
  app: 'my-app',
  version: '1.0.0'
});

// Merge additional context
const merged = contextManager.merge(globalContext, localContext);
```

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new ContextManager**(`options`): `ContextManager`

Defined in: [src/core/ContextManager.ts:226](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L226)

Creates a new ContextManager instance.

#### Parameters

##### options

[`ContextManagerOptions`](../interfaces/ContextManagerOptions.md) = `{}`

Configuration options

#### Returns

`ContextManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/core/ContextManager.ts:268](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L268)

Clear global context.

#### Returns

`void`

***

### clearSnapshots()

> **clearSnapshots**(): `void`

Defined in: [src/core/ContextManager.ts:776](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L776)

Clear all snapshots.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/ContextManager.ts:972](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L972)

Clean up resources.

#### Returns

`void`

***

### extract()

> **extract**(`context`, `fields`): `Record`\<`string`, `unknown`\>

Defined in: [src/core/ContextManager.ts:854](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L854)

Extract specific fields from context.

#### Parameters

##### context

`Record`\<`string`, `unknown`\>

Source context

##### fields

`string`[]

Fields to extract

#### Returns

`Record`\<`string`, `unknown`\>

Extracted context

***

### flatten()

> **flatten**(`context`, `prefix?`): `Record`\<`string`, `unknown`\>

Defined in: [src/core/ContextManager.ts:788](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L788)

Flatten nested context to dot notation.

#### Parameters

##### context

`Record`\<`string`, `unknown`\>

Context to flatten

##### prefix?

`string` = `''`

Key prefix

#### Returns

`Record`\<`string`, `unknown`\>

Flattened context

***

### get()

> **get**(): `Record`\<`string`, `unknown`\>

Defined in: [src/core/ContextManager.ts:259](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L259)

Get global context.

#### Returns

`Record`\<`string`, `unknown`\>

Global context

***

### getSnapshots()

> **getSnapshots**(): [`ContextSnapshot`](../interfaces/ContextSnapshot.md)[]

Defined in: [src/core/ContextManager.ts:769](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L769)

Get all snapshots.

#### Returns

[`ContextSnapshot`](../interfaces/ContextSnapshot.md)[]

All snapshots

***

### getStats()

> **getStats**(): `object`

Defined in: [src/core/ContextManager.ts:927](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L927)

Get context statistics.

#### Returns

`object`

Context statistics

##### depth

> **depth**: `number`

##### propertyCount

> **propertyCount**: `number`

##### size

> **size**: `number`

##### snapshotCount

> **snapshotCount**: `number`

***

### merge()

> **merge**(...`contexts`): `Record`\<`string`, `unknown`\>

Defined in: [src/core/ContextManager.ts:279](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L279)

Merge multiple context objects.

#### Parameters

##### contexts

...(`undefined` \| `Record`\<`string`, `unknown`\>)[]

Contexts to merge

#### Returns

`Record`\<`string`, `unknown`\>

Merged context

***

### restore()

> **restore**(`snapshot`): `void`

Defined in: [src/core/ContextManager.ts:756](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L756)

Restore from a snapshot.

#### Parameters

##### snapshot

[`ContextSnapshot`](../interfaces/ContextSnapshot.md)

Snapshot to restore

#### Returns

`void`

***

### set()

> **set**(`context`): `void`

Defined in: [src/core/ContextManager.ts:249](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L249)

Set global context.

#### Parameters

##### context

`Record`\<`string`, `unknown`\>

Context to set

#### Returns

`void`

***

### setSchema()

> **setSchema**(`schema`, `mode?`): `void`

Defined in: [src/core/ContextManager.ts:998](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L998)

Sets a schema for context validation.

#### Parameters

##### schema

[`AnySchema`](../../../validation/SchemaValidator/type-aliases/AnySchema.md)

The schema to use for validation

##### mode?

Validation mode

`"warn"` | `"silent"` | `"throw"`

#### Returns

`void`

#### Example

```typescript
import { object, string, number } from 'magiclogger/validation';

contextManager.setSchema(
  object({
    userId: string({ format: 'uuid' }),
    sessionId: string(),
    requestCount: number({ min: 0 })
  }),
  'throw' // Strict mode - throw on validation errors
);
```

***

### setValidationRules()

> **setValidationRules**(`rules`): `void`

Defined in: [src/core/ContextManager.ts:622](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L622)

Set validation rules.

#### Parameters

##### rules

[`ContextValidationRules`](../interfaces/ContextValidationRules.md)

Validation rules

#### Returns

`void`

***

### snapshot()

> **snapshot**(`metadata?`): [`ContextSnapshot`](../interfaces/ContextSnapshot.md)

Defined in: [src/core/ContextManager.ts:732](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L732)

Create a snapshot of current context.

#### Parameters

##### metadata?

`Record`\<`string`, `unknown`\>

Optional metadata

#### Returns

[`ContextSnapshot`](../interfaces/ContextSnapshot.md)

Created snapshot

***

### unflatten()

> **unflatten**(`flattened`): `Record`\<`string`, `unknown`\>

Defined in: [src/core/ContextManager.ts:816](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L816)

Unflatten dot notation to nested object.
Converts a flat object with dot-notation keys into a nested object structure.

#### Parameters

##### flattened

`Record`\<`string`, `unknown`\>

Flattened context

#### Returns

`Record`\<`string`, `unknown`\>

Nested context

***

### validate()

> **validate**(`context`): [`ContextValidationResult`](../interfaces/ContextValidationResult.md)

Defined in: [src/core/ContextManager.ts:666](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L666)

Validate context against rules.

#### Parameters

##### context

`Record`\<`string`, `unknown`\>

Context to validate

#### Returns

[`ContextValidationResult`](../interfaces/ContextValidationResult.md)

Validation result
