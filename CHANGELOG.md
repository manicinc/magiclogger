## [0.1.1](https://github.com/manicinc/magiclogger/compare/v0.1.0...v0.1.1) (2026-10-21)


### Bug Fixes

* **exports:** build the declarations under the type checks the typecheck script runs ([718af54](https://github.com/manicinc/magiclogger/commit/718af5465bafa03d74abcaf24842005c81322854))
* **exports:** every file the exports map names is built ([7b0ef44](https://github.com/manicinc/magiclogger/commit/7b0ef44b50248e476c9b6f1cf35a29b4978498fe))
* keep the build when npm packs the package ([d5545e7](https://github.com/manicinc/magiclogger/commit/d5545e7e49a5f87133ccb219674b2f14a7f9f47b))
* publish the built package; prepare deleted dist before npm packed it ([#52](https://github.com/manicinc/magiclogger/issues/52)) ([b1bf1c7](https://github.com/manicinc/magiclogger/commit/b1bf1c7ef7f5401c717f7b9533585fb2fe23eae4))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-09-11

### Added
- Initial release of MagicLogger
- Core logging functionality with async and sync modes
- MAGIC Schema - Universal JSON format for styled logs
- Multiple transport support (Console, File, HTTP, WebSocket, S3, MongoDB, PostgreSQL)
- Styled text support with `<style>text</>` syntax
- Template literal API with `logger.fmt`
- Chainable style API with `logger.s`
- Theme system with built-in and custom themes
- Tag-based categorization and filtering
- Context management for structured metadata
- Schema validation for log data integrity
- Performance optimizations with batching and caching
- TypeScript support with full type definitions
- Browser compatibility
- Comprehensive documentation and examples

[0.1.0]: https://github.com/manicinc/magiclogger/releases/tag/v0.1.0
