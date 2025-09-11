# Class: LogEntryPool

Defined in: [src/utils/ObjectPool.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/ObjectPool.ts#L13)

Object pool for reusable log entries

## Constructors

### Constructor

> **new LogEntryPool**(`maxSize`): `LogEntryPool`

Defined in: [src/utils/ObjectPool.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/ObjectPool.ts#L20)

#### Parameters

##### maxSize

`number` = `1000`

#### Returns

`LogEntryPool`

## Methods

### acquire()

> **acquire**(): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Defined in: [src/utils/ObjectPool.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/ObjectPool.ts#L31)

Borrow an entry from the pool

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

***

### getStats()

> **getStats**(): `object`

Defined in: [src/utils/ObjectPool.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/ObjectPool.ts#L61)

Get pool statistics

#### Returns

`object`

##### borrowed

> **borrowed**: `number`

##### created

> **created**: `number`

##### hitRate

> **hitRate**: `number`

##### poolSize

> **poolSize**: `number`

##### returned

> **returned**: `number`

***

### release()

> **release**(`entry`): `void`

Defined in: [src/utils/ObjectPool.ts:45](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/ObjectPool.ts#L45)

Return an entry to the pool

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`void`
