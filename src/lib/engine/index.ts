/**
 * MockHero Engine — barrel export.
 *
 * Additive only: all existing code uses direct paths (e.g. @/lib/engine/generator).
 * This barrel provides a single import point for consumers that prefer it.
 */

// Generation
export { generate, generateFromRaw } from "./generator";
export type { EngineResult } from "./generator";

// Schema parsing
export { parseSchema } from "./schema-parser";

// Schema detection
export { detectFromSql, detectFromJson } from "./schema-detector";

// Templates
export { listTemplates, getTemplate, generateFromTemplate, TEMPLATE_REGISTRY } from "./templates";

// Field type catalog
export { FIELD_TYPE_CATALOG } from "./field-type-catalog";

// Formatters
export { formatOutput } from "./formatters";

// Types
export { FIELD_TYPES, SUPPORTED_LOCALES, SUPPORTED_FORMATS, SUPPORTED_SQL_DIALECTS } from "./types";
export type {
  GenerateRequest,
  GenerateResult,
  TableDefinition,
  FieldDefinition,
  FieldType,
  Locale,
  OutputFormat,
  SqlDialect,
  GeneratorContext,
} from "./types";
