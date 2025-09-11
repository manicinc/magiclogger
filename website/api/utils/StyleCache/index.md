# utils/StyleCache

## Fileoverview

High-performance style caching for formatted strings.

This module provides a centralized LRU cache for styled text output,
significantly improving performance for repeated style patterns.

Performance improvements:
- Avoids repeated ANSI code generation
- Reduces string concatenation operations
- Minimizes color lookup overhead
- Typical improvement: 30-50% for styled output

## Since

2.1.0

## Classes

- [StyleCache](classes/StyleCache.md)

## Variables

- [styleCache](variables/styleCache.md)
