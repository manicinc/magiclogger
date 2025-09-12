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