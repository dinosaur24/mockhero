/**
 * CSV output formatter.
 * Generates one CSV string per table, RFC 4180 compliant.
 */

import type { TableDefinition } from "../types";

/** Escape a value for CSV (RFC 4180) */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";

  const str = typeof value === "object" ? JSON.stringify(value) : String(value);

  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Format data as CSV strings.
 * When table definitions are provided, headers use schema-defined field order.
 * Falls back to Object.keys(records[0]) when definitions are unavailable.
 */
export function formatCSV(
  data: Record<string, Record<string, unknown>[]>,
  tables?: TableDefinition[]
): Record<string, string> {
  const result: Record<string, string> = {};

  // Build a lookup from table name → field names in definition order
  const tableFieldOrder = new Map<string, string[]>();
  if (tables) {
    for (const t of tables) {
      tableFieldOrder.set(t.name, t.fields.map((f) => f.name));
    }
  }

  for (const [tableName, records] of Object.entries(data)) {
    if (records.length === 0) {
      result[tableName] = "";
      continue;
    }

    // Prefer schema-defined order; fall back to record keys
    const headers = tableFieldOrder.get(tableName) ?? Object.keys(records[0]);
    const lines: string[] = [];

    // Header row
    lines.push(headers.map(escapeCSV).join(","));

    // Data rows
    for (const record of records) {
      lines.push(headers.map((h) => escapeCSV(record[h])).join(","));
    }

    result[tableName] = lines.join("\n");
  }

  return result;
}
