# magiclogger

## Fileoverview

MagicLogger - High-performance, async-first logging library.

MagicLogger provides two distinct logging modes:
- **Logger** (default): Async with buffering for high performance
- **SyncLogger**: True synchronous I/O for guaranteed delivery

## Example

```typescript
// Default async logger - recommended for production
import { Logger } from 'magiclogger';
const logger = new Logger();

// Explicit sync logger - for debugging/auditing
import { SyncLogger } from 'magiclogger';
const syncLogger = new SyncLogger();
```

## Functions

- [createAsyncLogger](functions/createAsyncLogger.md)
- [createLogger](functions/createLogger.md)
- [~~createSyncLogger~~](functions/createSyncLogger.md)
- [default](functions/default.md)
- [getDefaultLogger](functions/getDefaultLogger.md)
- [isAsyncLogger](functions/isAsyncLogger.md)
- [isSyncLogger](functions/isSyncLogger.md)
- [setDefaultLogger](functions/setDefaultLogger.md)

## References

### ANSI

Re-exports [ANSI](../constants/ansi/variables/ANSI.md)

***

### applyStyles

Re-exports [applyStyles](../utils/style-extractor/functions/applyStyles.md)

***

### AsyncLogger

Re-exports [AsyncLogger](../async/AsyncLogger/classes/AsyncLogger.md)

***

### AsyncLoggerOptions

Re-exports [AsyncLoggerOptions](../async/AsyncLogger/interfaces/AsyncLoggerOptions.md)

***

### BatchingOptions

Re-exports [BatchingOptions](../types/transport/interfaces/BatchingOptions.md)

***

### BatchingTransportOptions

Re-exports [BatchingTransportOptions](../types/transport/interfaces/BatchingTransportOptions.md)

***

### Colorizer

Re-exports [Colorizer](../core/Colorizer/classes/Colorizer.md)

***

### ColorName

Re-exports [ColorName](../types/colors/type-aliases/ColorName.md)

***

### COLORS

Re-exports [COLORS](../constants/colors/variables/COLORS.md)

***

### ConnectionState

Re-exports [ConnectionState](../types/transport/type-aliases/ConnectionState.md)

***

### ConsoleTransportOptions

Re-exports [ConsoleTransportOptions](../types/transport/interfaces/ConsoleTransportOptions.md)

***

### ContextManager

Re-exports [ContextManager](../core/ContextManager/classes/ContextManager.md)

***

### createRedactorPreset

Re-exports [createRedactorPreset](../extensions/Redactor/functions/createRedactorPreset.md)

***

### createSamplerPreset

Re-exports [createSamplerPreset](../extensions/Sampler/functions/createSamplerPreset.md)

***

### DropPolicy

Re-exports [DropPolicy](../extensions/QueueManager/type-aliases/DropPolicy.md)

***

### enhanceConsole

Re-exports [enhanceConsole](../utils/EnhancedConsole/functions/enhanceConsole.md)

***

### EnhanceConsoleOptions

Re-exports [EnhanceConsoleOptions](../utils/EnhancedConsole/interfaces/EnhanceConsoleOptions.md)

***

### EnhancedConsole

Re-exports [EnhancedConsole](../utils/EnhancedConsole/classes/EnhancedConsole.md)

***

### err

Re-exports [err](../utils/meta/functions/err.md)

***

### extractStyles

Re-exports [extractStyles](../utils/style-extractor/functions/extractStyles.md)

***

### FileTransport

Re-exports [FileTransport](../transports/FileTransport/classes/FileTransport.md)

***

### FileTransportOptions

Re-exports [FileTransportOptions](../transports/FileTransport/interfaces/FileTransportOptions.md)

***

### HTTPTransport

Re-exports [HTTPTransport](../transports/HTTPTransport/classes/HTTPTransport.md)

***

### HTTPTransportOptions

Re-exports [HTTPTransportOptions](../transports/HTTPTransport/interfaces/HTTPTransportOptions.md)

***

### LogEntry

Re-exports [LogEntry](../types/transport/interfaces/LogEntry.md)

***

### Logger

Re-exports [Logger](../Logger/classes/Logger.md)

***

### LoggerOptions

Re-exports [LoggerOptions](../types/logger/interfaces/LoggerOptions.md)

***

### LogLevel

Re-exports [LogLevel](../types/logger/type-aliases/LogLevel.md)

***

### meta

Re-exports [meta](../utils/meta/functions/meta.md)

***

### MongoDBTransportOptions

Re-exports [MongoDBTransportOptions](../types/transport/interfaces/MongoDBTransportOptions.md)

***

### NetworkTransportOptions

Re-exports [NetworkTransportOptions](../types/transport/interfaces/NetworkTransportOptions.md)

***

### optimizeStyleRanges

Re-exports [optimizeStyleRanges](../utils/style-extractor/functions/optimizeStyleRanges.md)

***

### PRESETS

Re-exports [PRESETS](../constants/preset/variables/PRESETS.md)

***

### QueueManager

Re-exports [QueueManager](../extensions/QueueManager/classes/QueueManager.md)

***

### QueueManagerOptions

Re-exports [QueueManagerOptions](../extensions/QueueManager/interfaces/QueueManagerOptions.md)

***

### QueueStats

Re-exports [QueueStats](../extensions/QueueManager/interfaces/QueueStats.md)

***

### RateLimiter

Re-exports [RateLimiter](../extensions/RateLimiter/classes/RateLimiter.md)

***

### RateLimiterOptions

Re-exports [RateLimiterOptions](../extensions/RateLimiter/interfaces/RateLimiterOptions.md)

***

### RateLimitStrategy

Re-exports [RateLimitStrategy](../extensions/RateLimiter/type-aliases/RateLimitStrategy.md)

***

### RedactionPattern

Re-exports [RedactionPattern](../extensions/Redactor/interfaces/RedactionPattern.md)

***

### RedactionPreset

Re-exports [RedactionPreset](../extensions/Redactor/type-aliases/RedactionPreset.md)

***

### RedactionStrategy

Re-exports [RedactionStrategy](../extensions/Redactor/type-aliases/RedactionStrategy.md)

***

### Redactor

Re-exports [Redactor](../extensions/Redactor/classes/Redactor.md)

***

### RedactorOptions

Re-exports [RedactorOptions](../extensions/Redactor/interfaces/RedactorOptions.md)

***

### RetryOptions

Re-exports [RetryOptions](../types/transport/interfaces/RetryOptions.md)

***

### S3TransportOptions

Re-exports [S3TransportOptions](../types/transport/interfaces/S3TransportOptions.md)

***

### Sampler

Re-exports [Sampler](../extensions/Sampler/classes/Sampler.md)

***

### SamplerOptions

Re-exports [SamplerOptions](../extensions/Sampler/interfaces/SamplerOptions.md)

***

### SamplingStrategy

Re-exports [SamplingStrategy](../extensions/Sampler/type-aliases/SamplingStrategy.md)

***

### StreamTransportOptions

Re-exports [StreamTransportOptions](../types/transport/interfaces/StreamTransportOptions.md)

***

### StyleBuilder

Re-exports [StyleBuilder](../core/StyleBuilder/classes/StyleBuilder.md)

***

### StylePreset

Re-exports [StylePreset](../types/preset/type-aliases/StylePreset.md)

***

### SyncConsoleTransport

Re-exports [SyncConsoleTransport](../transports/SyncConsoleTransport/classes/SyncConsoleTransport.md)

***

### SyncLogger

Re-exports [SyncLogger](../sync/SyncLogger/classes/SyncLogger.md)

***

### TableFormatter

Re-exports [TableFormatter](../utils/TableFormatter/classes/TableFormatter.md)

***

### TableOptions

Re-exports [TableOptions](../utils/TableFormatter/interfaces/TableOptions.md)

***

### TagManager

Re-exports [TagManager](../core/TagManager/classes/TagManager.md)

***

### ThemeDefinition

Re-exports [ThemeDefinition](../types/theme/type-aliases/ThemeDefinition.md)

***

### Transport

Re-exports [Transport](../types/transport/interfaces/Transport.md)

***

### TransportConfig

Re-exports [TransportConfig](../types/transport/interfaces/TransportConfig.md)

***

### TransportEvents

Re-exports [TransportEvents](../types/transport/interfaces/TransportEvents.md)

***

### TransportManager

Re-exports [TransportManager](../transports/base/TransportManager/classes/TransportManager.md)

***

### TransportOptions

Re-exports [TransportOptions](../types/transport/interfaces/TransportOptions.md)

***

### TransportStats

Re-exports [TransportStats](../types/transport/interfaces/TransportStats.md)

***

### TransportType

Re-exports [TransportType](../types/transport/type-aliases/TransportType.md)

***

### validateStyleRanges

Re-exports [validateStyleRanges](../utils/style-extractor/functions/validateStyleRanges.md)

***

### WebSocketTransportOptions

Re-exports [WebSocketTransportOptions](../types/transport/interfaces/WebSocketTransportOptions.md)
