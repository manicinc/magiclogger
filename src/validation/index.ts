/**
 * @fileoverview Tree-shakeable exports for the validation module.
 * 
 * Import only what you need to keep bundle size minimal:
 * ```typescript
 * import { SchemaValidator, string, object } from 'magiclogger/validation';
 * ```
 * 
 * @module validation
 */

export {
  SchemaValidator,
  // Types
  type ValidationError,
  type ValidationResult,
  type Schema,
  type StringSchema,
  type NumberSchema,
  type BooleanSchema,
  type ObjectSchema,
  type ArraySchema,
  type UnionSchema,
  type LiteralSchema,
  type EnumSchema,
  type AnySchema,
  // Factory functions
  string,
  number,
  boolean,
  object,
  array,
  union,
  literal,
  enumSchema,
  optional,
  nullable
} from './SchemaValidator';