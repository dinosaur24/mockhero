/**
 * Main data generation engine.
 * Pure TypeScript — no I/O, no imports from Next.js or Supabase.
 *
 * Flow: Validate → Topological Sort → Generate per table → Return
 *
 * KEY FEATURE: Auto-locale detection.
 * If a table has a "country" field (or enum with country codes),
 * each row's locale-sensitive fields (names, emails, phones, addresses)
 * automatically match the country value. No extra config needed.
 */

import { createPRNG } from "./prng";
import { parseSchema } from "./schema-parser";
import { topologicalSort } from "./topological-sort";
import { GENERATOR_REGISTRY } from "./field-generators";
import { loadLocaleData } from "./field-generators/identity";
import {
  findLocaleDeterminingFields,
  resolveRowLocale,
} from "./locale-resolver";
import { SUPPORTED_LOCALES } from "./types";
import type {
  GenerateRequest,
  GenerateResult,
  GeneratorContext,
  ValidationError,
  Locale,
} from "./types";

export type EngineResult =
  | { success: true; result: GenerateResult }
  | { success: false; errors: ValidationError[] }
  | { success: false; cycle: string[] };

/**
 * Generate data from a validated request.
 * Call `parseSchema()` first, then pass the validated request here.
 */
export async function generate(request: GenerateRequest): Promise<EngineResult> {
  const startTime = performance.now();

  // Pre-load the default locale
  const defaultLocale: Locale = request.locale ?? "en";
  await loadLocaleData(defaultLocale);

  // Pre-load ALL locales in case auto-detection switches per-row
  // This is cheap (~5 JSON files, loaded once, cached)
  for (const loc of SUPPORTED_LOCALES) {
    await loadLocaleData(loc);
  }

  // Topological sort
  const sortResult = topologicalSort(request.tables);
  if (!sortResult.success) {
    return { success: false, cycle: sortResult.cycle };
  }

  const prng = createPRNG(request.seed);
  const tableData: Record<string, Record<string, unknown>[]> = {};

  // Generate each table in dependency order
  for (const table of sortResult.sorted) {
    const records: Record<string, unknown>[] = [];

    // Detect locale-determining fields for this table
    const localeDeterminingFields = findLocaleDeterminingFields(table.fields);
    const hasAutoLocale = localeDeterminingFields.length > 0;

    // Split fields: locale-determining first, then everything else
    const localeFields = hasAutoLocale
      ? table.fields.filter((f) => localeDeterminingFields.includes(f.name))
      : [];
    const otherFields = hasAutoLocale
      ? table.fields.filter((f) => !localeDeterminingFields.includes(f.name))
      : table.fields;

    for (let rowIndex = 0; rowIndex < table.count; rowIndex++) {
      const record: Record<string, unknown> = {};

      // Phase 1: Generate locale-determining fields first
      if (hasAutoLocale) {
        const context: GeneratorContext = {
          prng,
          locale: defaultLocale,
          tableData,
          currentRecord: record,
          rowIndex,
        };

        for (const field of localeFields) {
          const generator = GENERATOR_REGISTRY[field.type];
          if (!generator) {
            record[field.name] = null;
            continue;
          }

          // Handle nullable wrapper (same as Phase 3)
          if (field.nullable) {
            const nullRate = (field.params?.null_rate as number) ?? 0.15;
            if (prng.chance(nullRate)) {
              record[field.name] = null;
              continue;
            }
          }

          try {
            record[field.name] = await generator(field.params ?? {}, context);
          } catch {
            record[field.name] = null;
          }
        }
      }

      // Phase 2: Resolve the per-row locale
      const rowLocale = hasAutoLocale
        ? resolveRowLocale(record, localeDeterminingFields, defaultLocale)
        : defaultLocale;

      // Phase 3: Generate remaining fields with the resolved locale
      const context: GeneratorContext = {
        prng,
        locale: rowLocale,
        tableData,
        currentRecord: record,
        rowIndex,
      };

      for (const field of otherFields) {
        const generator = GENERATOR_REGISTRY[field.type];
        if (!generator) {
          record[field.name] = null;
          continue;
        }

        // Handle nullable wrapper
        if (field.nullable) {
          const nullRate = (field.params?.null_rate as number) ?? 0.15;
          if (prng.chance(nullRate)) {
            record[field.name] = null;
            continue;
          }
        }

        try {
          record[field.name] = await generator(field.params ?? {}, context);
        } catch (err) {
          console.error(`Generator error for ${table.name}.${field.name}:`, err);
          record[field.name] = null;
        }
      }

      records.push(record);
    }

    tableData[table.name] = records;
  }

  const endTime = performance.now();

  // Build meta
  const recordsPerTable: Record<string, number> = {};
  let totalRecords = 0;
  for (const table of request.tables) {
    recordsPerTable[table.name] = table.count;
    totalRecords += table.count;
  }

  return {
    success: true,
    result: {
      data: tableData,
      meta: {
        tables: request.tables.length,
        total_records: totalRecords,
        records_per_table: recordsPerTable,
        locale: defaultLocale,
        format: request.format ?? "json",
        seed: prng.seed,
        generation_time_ms: Math.round(endTime - startTime),
      },
    },
  };
}

/**
 * Full pipeline: parse + generate.
 * Use this from API route handlers.
 */
export async function generateFromRaw(input: unknown): Promise<EngineResult> {
  const parsed = parseSchema(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  return generate(parsed.data);
}
