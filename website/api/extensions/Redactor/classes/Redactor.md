# Class: Redactor

Defined in: [src/extensions/Redactor.ts:410](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L410)

Comprehensive PII and sensitive data redactor.

 Redactor

## Constructors

### Constructor

> **new Redactor**(`options`): `Redactor`

Defined in: [src/extensions/Redactor.ts:445](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L445)

Creates a new Redactor instance.

#### Parameters

##### options

[`RedactorOptions`](../interfaces/RedactorOptions.md) = `{}`

Configuration options for the redactor

#### Returns

`Redactor`

## Methods

### addPattern()

> **addPattern**(`pattern`): `void`

Defined in: [src/extensions/Redactor.ts:847](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L847)

Add custom redaction pattern.

#### Parameters

##### pattern

[`RedactionPattern`](../interfaces/RedactionPattern.md)

#### Returns

`void`

***

### exportTokens()

> **exportTokens**(): `Map`\<`string`, `string`\>

Defined in: [src/extensions/Redactor.ts:858](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L858)

Export token map for recovery.

#### Returns

`Map`\<`string`, `string`\>

***

### getAuditTrail()

> **getAuditTrail**(): `object`[]

Defined in: [src/extensions/Redactor.ts:830](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L830)

Get audit trail.

#### Returns

`object`[]

***

### getStats()

> **getStats**(): `object`

Defined in: [src/extensions/Redactor.ts:815](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L815)

Get redaction statistics.

#### Returns

`object`

##### cacheSize

> **cacheSize**: `number`

##### fieldRedactions

> **fieldRedactions**: `Map`\<`string`, `number`\>

##### patternHits

> **patternHits**: `Map`\<`string`, `number`\>

##### tokenCount

> **tokenCount**: `number`

##### totalRedactions

> **totalRedactions**: `number`

***

### importTokens()

> **importTokens**(`tokens`): `void`

Defined in: [src/extensions/Redactor.ts:863](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L863)

Import token map for consistency.

#### Parameters

##### tokens

`Map`\<`string`, `string`\>

#### Returns

`void`

***

### redact()

> **redact**(`data`, `fieldPath`): `unknown`

Defined in: [src/extensions/Redactor.ts:510](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L510)

Redact sensitive data from any value.

#### Parameters

##### data

`unknown`

##### fieldPath

`string` = `''`

#### Returns

`unknown`

***

### redactLogEntry()

> **redactLogEntry**(`entry`): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Defined in: [src/extensions/Redactor.ts:778](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L778)

Redact a LogEntry structure.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

***

### removePattern()

> **removePattern**(`name`): `void`

Defined in: [src/extensions/Redactor.ts:853](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L853)

Remove redaction pattern by name.

#### Parameters

##### name

`string`

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [src/extensions/Redactor.ts:835](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L835)

Clear cache and statistics.

#### Returns

`void`
