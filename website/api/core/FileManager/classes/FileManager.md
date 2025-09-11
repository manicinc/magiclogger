# Class: FileManager

Defined in: [src/core/FileManager.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L43)

Provides file-based logging utilities for NodeLogger.
Handles log file initialization, writing, rotation, and cleanup.

## Constructors

### Constructor

> **new FileManager**(`logDir`, `logRetentionDays`, `autoInit`): `FileManager`

Defined in: [src/core/FileManager.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L55)

Constructs a new FileManager.

#### Parameters

##### logDir

`string`

Directory where log files will be stored.

##### logRetentionDays

`number` = `30`

Number of days to retain log files.

##### autoInit

`boolean` = `true`

#### Returns

`FileManager`

## Methods

### appendToFile()

> **appendToFile**(`content`): `boolean`

Defined in: [src/core/FileManager.ts:210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L210)

Appends a line to the current log file.

#### Parameters

##### content

`string`

The content to append.

#### Returns

`boolean`

True if successful, false if error occurred

***

### cleanupDirectory()

> **cleanupDirectory**(`dirPath`): `Promise`\<`void`\>

Defined in: [src/core/FileManager.ts:297](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L297)

Recursively cleans up a directory and its contents.

#### Parameters

##### dirPath

`string`

Directory path to clean

#### Returns

`Promise`\<`void`\>

***

### cleanupOldLogs()

> **cleanupOldLogs**(): `Promise`\<`void`\>

Defined in: [src/core/FileManager.ts:225](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L225)

Cleans up log files older than the retention period.

#### Returns

`Promise`\<`void`\>

***

### getLogDir()

> **getLogDir**(): `string`

Defined in: [src/core/FileManager.ts:261](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L261)

Gets the current log directory path.

#### Returns

`string`

The log directory path.

***

### getLogFile()

> **getLogFile**(): `null` \| `string`

Defined in: [src/core/FileManager.ts:253](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L253)

Returns the path of the current log file.

#### Returns

`null` \| `string`

The log file path or null if none.

***

### getLogRetentionDays()

> **getLogRetentionDays**(): `number`

Defined in: [src/core/FileManager.ts:279](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L279)

Gets the current log retention period in days.

#### Returns

`number`

Days to retain logs.

***

### initializeModulesAsync()

> **initializeModulesAsync**(): `Promise`\<`void`\>

Defined in: [src/core/FileManager.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L78)

Initialize Node.js or browser modules asynchronously (ESM-friendly)

#### Returns

`Promise`\<`void`\>

***

### initLogFile()

> **initLogFile**(): `Promise`\<`null` \| `string`\>

Defined in: [src/core/FileManager.ts:142](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L142)

Initializes a new log file with a timestamp.

#### Returns

`Promise`\<`null` \| `string`\>

The path to the new log file.

***

### initLogFileSync()

> **initLogFileSync**(): `null` \| `string`

Defined in: [src/core/FileManager.ts:174](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L174)

Synchronously initializes a log file.

#### Returns

`null` \| `string`

The log file path if successful, null otherwise

***

### isReady()

> **isReady**(): `boolean`

Defined in: [src/core/FileManager.ts:111](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L111)

Whether file system modules are ready

#### Returns

`boolean`

***

### resolveLogDir()

> **resolveLogDir**(`dirPath`): `string`

Defined in: [src/core/FileManager.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L125)

Resolves a directory path to an absolute path.

#### Parameters

##### dirPath

`string`

The directory path (relative or absolute).

#### Returns

`string`

The absolute directory path.

***

### setLogDir()

> **setLogDir**(`dir`): `void`

Defined in: [src/core/FileManager.ts:271](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L271)

Sets the log directory path.
If the directory doesn't exist, it will be created on next write.

#### Parameters

##### dir

`string`

The new log directory path

#### Returns

`void`

***

### setLogRetentionDays()

> **setLogRetentionDays**(`days`): `void`

Defined in: [src/core/FileManager.ts:289](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/FileManager.ts#L289)

Sets the log retention period in days.
Logs older than this number of days will be deleted during cleanup.

#### Parameters

##### days

`number`

Number of days to retain logs (minimum 1)

#### Returns

`void`
