# Class: BrowserStorageManager

Defined in: [src/core/BrowserStorageManager.ts:5](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L5)

Provides storage capabilities for the BrowserLogger.
Uses localStorage or IndexedDB depending on configuration and availability.

## Constructors

### Constructor

> **new BrowserStorageManager**(`options`): `BrowserStorageManager`

Defined in: [src/core/BrowserStorageManager.ts:16](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L16)

Creates a new BrowserStorageManager

#### Parameters

##### options

Configuration options

###### maxEntries?

`number`

###### storageName?

`string`

###### useLocalStorage?

`boolean`

#### Returns

`BrowserStorageManager`

## Methods

### addLog()

> **addLog**(`entry`): `void`

Defined in: [src/core/BrowserStorageManager.ts:119](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L119)

Adds a log entry to storage

#### Parameters

##### entry

`string`

The log entry to add

#### Returns

`void`

***

### clearLogs()

> **clearLogs**(): `void`

Defined in: [src/core/BrowserStorageManager.ts:161](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L161)

Clear all stored logs

#### Returns

`void`

***

### downloadLogs()

> **downloadLogs**(`filename`): `void`

Defined in: [src/core/BrowserStorageManager.ts:182](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L182)

Generate a downloadable log file

#### Parameters

##### filename

`string` = `'logs.txt'`

The file name for the download

#### Returns

`void`

***

### getLogs()

> **getLogs**(): `string`[]

Defined in: [src/core/BrowserStorageManager.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L150)

Get all stored logs

#### Returns

`string`[]

Array of log entries

***

### getRetentionDays()

> **getRetentionDays**(): `number`

Defined in: [src/core/BrowserStorageManager.ts:227](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L227)

Get the retention period (always 0 for browser logger)

#### Returns

`number`

***

### setMaxEntries()

> **setMaxEntries**(`maxEntries`): `void`

Defined in: [src/core/BrowserStorageManager.ts:235](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserStorageManager.ts#L235)

Set maximum number of entries to keep

#### Parameters

##### maxEntries

`number`

Number of entries to keep

#### Returns

`void`
