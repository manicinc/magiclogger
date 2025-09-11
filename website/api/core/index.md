# core

Core Module Exports - TREE-SHAKING WARNING

⚠️ This file exports all core components which may prevent tree-shaking.
For optimal bundle size, import core modules directly:

## Example

```typescript
// ❌ AVOID - Imports all core modules
import { Colorizer, ContextManager } from 'magiclogger/core';

// ✅ RECOMMENDED - Import specific modules
import { Colorizer } from 'magiclogger/core/colorizer';
import { ContextManager } from 'magiclogger/core/context-manager';
```

## References

### BrowserLogger

Re-exports [BrowserLogger](BrowserLogger/classes/BrowserLogger.md)

***

### BrowserStorageManager

Re-exports [BrowserStorageManager](BrowserStorageManager/classes/BrowserStorageManager.md)

***

### Colorizer

Re-exports [Colorizer](Colorizer/classes/Colorizer.md)

***

### ContextManager

Re-exports [ContextManager](ContextManager/classes/ContextManager.md)

***

### ContextManagerOptions

Re-exports [ContextManagerOptions](ContextManager/interfaces/ContextManagerOptions.md)

***

### ContextSnapshot

Re-exports [ContextSnapshot](ContextManager/interfaces/ContextSnapshot.md)

***

### ContextValidationResult

Re-exports [ContextValidationResult](ContextManager/interfaces/ContextValidationResult.md)

***

### ContextValidationRules

Re-exports [ContextValidationRules](ContextManager/interfaces/ContextValidationRules.md)

***

### FileManager

Re-exports [FileManager](FileManager/classes/FileManager.md)

***

### Formatter

Re-exports [Formatter](Formatter/classes/Formatter.md)

***

### LoggerBase

Re-exports [LoggerBase](LoggerBase/classes/LoggerBase.md)

***

### NodeLogger

Re-exports [NodeLogger](NodeLogger/classes/NodeLogger.md)

***

### Printer

Re-exports [Printer](Printer/classes/Printer.md)

***

### SanitizeMode

Re-exports [SanitizeMode](ContextManager/type-aliases/SanitizeMode.md)

***

### TagExtractionOptions

Re-exports [TagExtractionOptions](TagManager/interfaces/TagExtractionOptions.md)

***

### TagFilterOptions

Re-exports [TagFilterOptions](TagManager/interfaces/TagFilterOptions.md)

***

### TagManager

Re-exports [TagManager](TagManager/classes/TagManager.md)

***

### TagManagerOptions

Re-exports [TagManagerOptions](TagManager/interfaces/TagManagerOptions.md)

***

### TagMatchCriteria

Re-exports [TagMatchCriteria](TagManager/interfaces/TagMatchCriteria.md)

***

### TagNormalizationRules

Re-exports [TagNormalizationRules](TagManager/interfaces/TagNormalizationRules.md)

***

### TagValidationResult

Re-exports [TagValidationResult](TagManager/interfaces/TagValidationResult.md)

***

### TagValidationRules

Re-exports [TagValidationRules](TagManager/interfaces/TagValidationRules.md)
