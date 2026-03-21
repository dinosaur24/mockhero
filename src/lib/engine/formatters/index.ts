/**
 * Output formatters index.
 * Converts generated data into JSON, CSV, or SQL format.
 */

import type { GenerateResult, OutputFormat, SqlDialect, TableDefinition } from "../types";
import { formatCSV } from "./csv-formatter";
import { formatSQL } from "./sql-formatter";

export interface FormattedOutput {
  /** The formatted data (JSON object, CSV strings, or SQL string) */
  body: unknown;
  /** Content-Type header for the response */
  contentType: string;
}

export function formatOutput(
  result: GenerateResult,
  tables: TableDefinition[],
  format: OutputFormat,
  sqlDialect?: SqlDialect
): FormattedOutput {
  switch (format) {
    case "csv":
      return {
        body: {
          data: formatCSV(result.data, tables),
          meta: result.meta,
        },
        contentType: "application/json", // CSV is returned as JSON with CSV strings per table
      };

    case "sql":
      return {
        body: {
          sql: formatSQL(result.data, tables, sqlDialect ?? "postgres"),
          meta: result.meta,
        },
        contentType: "application/json",
      };

    case "json":
    default:
      return {
        body: {
          data: result.data,
          meta: result.meta,
        },
        contentType: "application/json",
      };
  }
}
