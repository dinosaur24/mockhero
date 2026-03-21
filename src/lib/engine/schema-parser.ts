/**
 * Schema parser and validator.
 * Validates incoming generation requests against the expected format.
 * Returns structured errors with field paths for helpful API responses.
 */

import { FIELD_TYPES, SUPPORTED_LOCALES, SUPPORTED_FORMATS, SUPPORTED_SQL_DIALECTS } from "./types";
import type { GenerateRequest, ValidationError, FieldType } from "./types";

/** Levenshtein distance for typo suggestions */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/** Find the closest known field type to a typo */
function suggestFieldType(unknown: string): string | undefined {
  let bestMatch: string | undefined;
  let bestDistance = Infinity;

  for (const known of FIELD_TYPES) {
    const d = levenshtein(unknown, known);
    if (d < bestDistance && d <= 3) {
      bestDistance = d;
      bestMatch = known;
    }
  }

  return bestMatch;
}

export type ParseResult =
  | { success: true; data: GenerateRequest }
  | { success: false; errors: ValidationError[] };

export function parseSchema(input: unknown): ParseResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "", message: "Request body must be a JSON object" }],
    };
  }

  const body = input as Record<string, unknown>;

  // ── Validate tables array ──────────────────────────────
  if (!Array.isArray(body.tables)) {
    return {
      success: false,
      errors: [{ field: "tables", message: "\"tables\" must be an array of table definitions" }],
    };
  }

  if (body.tables.length === 0) {
    errors.push({ field: "tables", message: "At least one table is required" });
    return { success: false, errors };
  }

  if (body.tables.length > 20) {
    errors.push({ field: "tables", message: "Maximum 20 tables per request" });
    return { success: false, errors };
  }

  // Check for duplicate table names
  const tableNames = new Set<string>();

  for (let ti = 0; ti < body.tables.length; ti++) {
    const table = body.tables[ti] as Record<string, unknown>;
    const prefix = `tables[${ti}]`;

    // Table name
    if (typeof table.name !== "string" || table.name.trim() === "") {
      errors.push({ field: `${prefix}.name`, message: "Table name is required and must be a non-empty string" });
      continue;
    }

    // Validate identifier format — prevents SQL issues and weird output
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(table.name)) {
      errors.push({ field: `${prefix}.name`, message: `Table name "${table.name}" must start with a letter or underscore, contain only letters/numbers/underscores, and be at most 64 characters` });
    }

    if (tableNames.has(table.name)) {
      errors.push({ field: `${prefix}.name`, message: `Duplicate table name "${table.name}"` });
    }
    tableNames.add(table.name);

    // Count
    if (typeof table.count !== "number" || !Number.isInteger(table.count) || table.count < 1) {
      errors.push({ field: `${prefix}.count`, message: "Count must be a positive integer (minimum 1)" });
    }

    // Fields
    if (!Array.isArray(table.fields)) {
      errors.push({ field: `${prefix}.fields`, message: "Fields must be an array" });
      continue;
    }

    if (table.fields.length === 0) {
      errors.push({ field: `${prefix}.fields`, message: "At least one field is required per table" });
    }

    if (table.fields.length > 200) {
      errors.push({ field: `${prefix}.fields`, message: "Maximum 200 fields per table" });
    }

    // Check for duplicate field names
    const fieldNames = new Set<string>();

    for (let fi = 0; fi < table.fields.length; fi++) {
      const field = table.fields[fi] as Record<string, unknown>;
      const fieldPrefix = `${prefix}.fields[${fi}]`;

      // Field name
      if (typeof field.name !== "string" || field.name.trim() === "") {
        errors.push({ field: `${fieldPrefix}.name`, message: "Field name is required" });
        continue;
      }

      if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(field.name)) {
        errors.push({ field: `${fieldPrefix}.name`, message: `Field name "${field.name}" must start with a letter or underscore, contain only letters/numbers/underscores, and be at most 64 characters` });
      }

      if (fieldNames.has(field.name)) {
        errors.push({ field: `${fieldPrefix}.name`, message: `Duplicate field name "${field.name}" in table "${table.name}"` });
      }
      fieldNames.add(field.name);

      // Field type
      if (typeof field.type !== "string") {
        errors.push({ field: `${fieldPrefix}.type`, message: "Field type is required" });
        continue;
      }

      if (field.type === "nullable") {
        errors.push({ field: `${fieldPrefix}.type`, message: 'Use "nullable": true on any field instead of type "nullable". Example: { "name": "bio", "type": "sentence", "nullable": true }', suggestion: 'Add "nullable": true to your field definition instead' });
        continue;
      }

      if (!FIELD_TYPES.includes(field.type as FieldType)) {
        const suggestion = suggestFieldType(field.type);
        errors.push({
          field: `${fieldPrefix}.type`,
          message: `Unknown field type "${field.type}"`,
          suggestion: suggestion ? `Did you mean "${suggestion}"?` : undefined,
        });
        continue;
      }

      // Type-specific param validation
      const params = (field.params ?? {}) as Record<string, unknown>;

      if (field.type === "enum") {
        if (!Array.isArray(params.values) || params.values.length === 0) {
          errors.push({ field: `${fieldPrefix}.params.values`, message: "Enum type requires a non-empty \"values\" array" });
        }
        if (params.weights && Array.isArray(params.weights) && Array.isArray(params.values)) {
          if (params.weights.length !== params.values.length) {
            errors.push({ field: `${fieldPrefix}.params.weights`, message: "Weights array must match values array length" });
          }
        }
      }

      if (field.type === "ref") {
        if (typeof params.table !== "string") {
          errors.push({ field: `${fieldPrefix}.params.table`, message: "Ref type requires a \"table\" parameter" });
        } else if (params.table === table.name) {
          errors.push({ field: `${fieldPrefix}.params.table`, message: `Table "${table.name}" has a self-referencing field "${field.name}". Self-references are not supported — use a separate join table instead.` });
        } else if (!body.tables.some((t: unknown) => (t as Record<string, unknown>).name === params.table)) {
          errors.push({ field: `${fieldPrefix}.params.table`, message: `Ref references table "${params.table}" which is not defined in this request` });
        }
        if (typeof params.field !== "string") {
          errors.push({ field: `${fieldPrefix}.params.field`, message: "Ref type requires a \"field\" parameter" });
        }
      }

      if (field.type === "datetime" || field.type === "date" || field.type === "date_range") {
        if (params.min && typeof params.min !== "string") {
          errors.push({ field: `${fieldPrefix}.params.min`, message: "Min date must be an ISO date string" });
        }
        if (params.max && typeof params.max !== "string") {
          errors.push({ field: `${fieldPrefix}.params.max`, message: "Max date must be an ISO date string" });
        }
        if (typeof params.min === "string" && typeof params.max === "string") {
          if (new Date(params.min).getTime() > new Date(params.max).getTime()) {
            errors.push({ field: `${fieldPrefix}.params.min`, message: "Min date must be before max date" });
          }
        }
        if (field.type === "date_range") {
          if (params.min_date && typeof params.min_date !== "string") {
            errors.push({ field: `${fieldPrefix}.params.min_date`, message: "min_date must be an ISO date string" });
          }
          if (params.max_date && typeof params.max_date !== "string") {
            errors.push({ field: `${fieldPrefix}.params.max_date`, message: "max_date must be an ISO date string" });
          }
          if (typeof params.min_date === "string" && typeof params.max_date === "string") {
            if (new Date(params.min_date).getTime() > new Date(params.max_date).getTime()) {
              errors.push({ field: `${fieldPrefix}.params.min_date`, message: "min_date must be before max_date" });
            }
          }
          if (typeof params.min_gap_days === "number" && params.min_gap_days < 0) {
            errors.push({ field: `${fieldPrefix}.params.min_gap_days`, message: "min_gap_days must be non-negative" });
          }
          if (typeof params.max_gap_days === "number" && typeof params.min_gap_days === "number" && params.max_gap_days < params.min_gap_days) {
            errors.push({ field: `${fieldPrefix}.params.max_gap_days`, message: "max_gap_days must be >= min_gap_days" });
          }
        }
      }

      // Cap embedding_vector dimensions to prevent memory abuse
      if (field.type === "embedding_vector") {
        const dims = params.dimensions as number | undefined;
        if (dims !== undefined) {
          if (typeof dims !== "number" || !Number.isInteger(dims) || dims < 1) {
            errors.push({ field: `${fieldPrefix}.params.dimensions`, message: "Dimensions must be a positive integer" });
          } else if (dims > 4096) {
            errors.push({ field: `${fieldPrefix}.params.dimensions`, message: "Maximum 4096 dimensions for embedding vectors" });
          }
        }
      }

      // Cap long_string length to prevent memory abuse (max 1MB per field value)
      if (field.type === "long_string") {
        const maxLen = Math.max(
          (params.length as number) ?? 0,
          (params.max_length as number) ?? 0,
          (params.min_length as number) ?? 0,
        );
        if (maxLen > 1_000_000) {
          errors.push({ field: `${fieldPrefix}.params`, message: "Maximum long_string length is 1,000,000 characters" });
        }
      }
    }
  }

  // ── Validate optional top-level fields ─────────────────
  if (body.locale !== undefined) {
    if (!SUPPORTED_LOCALES.includes(body.locale as typeof SUPPORTED_LOCALES[number])) {
      errors.push({ field: "locale", message: `Unsupported locale "${body.locale}". Supported: ${SUPPORTED_LOCALES.join(", ")}` });
    }
  }

  if (body.format !== undefined) {
    if (!SUPPORTED_FORMATS.includes(body.format as typeof SUPPORTED_FORMATS[number])) {
      errors.push({ field: "format", message: `Unsupported format "${body.format}". Supported: ${SUPPORTED_FORMATS.join(", ")}` });
    }
  }

  if (body.sql_dialect !== undefined) {
    if (!SUPPORTED_SQL_DIALECTS.includes(body.sql_dialect as typeof SUPPORTED_SQL_DIALECTS[number])) {
      errors.push({ field: "sql_dialect", message: `Unsupported SQL dialect "${body.sql_dialect}". Supported: ${SUPPORTED_SQL_DIALECTS.join(", ")}` });
    }
  }

  if (body.seed !== undefined) {
    if (typeof body.seed !== "number" || !Number.isFinite(body.seed)) {
      errors.push({ field: "seed", message: "Seed must be a finite number" });
    } else if (!Number.isInteger(body.seed) || body.seed < 0 || body.seed > 4294967295) {
      errors.push({ field: "seed", message: "Seed must be an integer between 0 and 4294967295 (32-bit unsigned)" });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // ── Build validated request ────────────────────────────
  const request: GenerateRequest = {
    tables: (body.tables as Record<string, unknown>[]).map((t) => ({
      name: t.name as string,
      count: t.count as number,
      fields: (t.fields as Record<string, unknown>[]).map((f) => ({
        name: f.name as string,
        type: f.type as FieldType,
        params: (f.params as Record<string, unknown>) ?? {},
        nullable: f.nullable === true,
      })),
    })),
    locale: (body.locale as GenerateRequest["locale"]) ?? "en",
    format: (body.format as GenerateRequest["format"]) ?? "json",
    sql_dialect: (body.sql_dialect as GenerateRequest["sql_dialect"]) ?? "postgres",
    seed: body.seed as number | undefined,
  };

  return { success: true, data: request };
}
