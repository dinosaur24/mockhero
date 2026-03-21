/**
 * Schema detection — converts SQL CREATE TABLE statements or sample JSON
 * into MockHero TableDefinition format.
 *
 * Pure functions, no Next.js or I/O dependencies.
 */

import type { TableDefinition, FieldDefinition, FieldType } from "./types";

// ── SQL Parser ───────────────────────────────────────────

/**
 * Split a CREATE TABLE body on commas, but only commas that aren't
 * inside parentheses. This prevents DECIMAL(10,2) from being split.
 */
function splitColumnsBlock(block: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let current = "";

  for (const ch of block) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === "," && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) results.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }

  const trimmed = current.trim();
  if (trimmed) results.push(trimmed);
  return results;
}

/**
 * Parse CREATE TABLE SQL into MockHero schema format.
 * Supports multiple tables, inline REFERENCES, and CHECK IN (enum detection).
 */
export function detectFromSql(sql: string): { tables: TableDefinition[] } {
  const tables: TableDefinition[] = [];

  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|")?(\w+)(?:`|")?\s*\(([\s\S]*?)(?:\);|\)\s*;)/gi;
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase();
    const columnsBlock = match[2];
    const fields: FieldDefinition[] = [];

    // Parse individual columns (skip constraints)
    // Split on commas that are NOT inside parentheses — prevents breaking
    // types like DECIMAL(10,2), NUMERIC(12,4), VARCHAR(255), etc.
    const lines = splitColumnsBlock(columnsBlock);

    for (const line of lines) {
      if (/^\s*(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT|INDEX)/i.test(line)) {
        continue;
      }

      const colMatch = line.match(/^(?:`|")?(\w+)(?:`|")?\s+(\w+(?:\([^)]*\))?)/i);
      if (!colMatch) continue;

      const colName = colMatch[1].toLowerCase();
      const sqlType = colMatch[2].toUpperCase();

      const mapped = mapSqlType(colName, sqlType);
      const field: FieldDefinition = {
        name: colName,
        type: mapped.type,
        ...(mapped.params ? { params: mapped.params } : {}),
      };

      // Check for inline REFERENCES (foreign key)
      const refMatch = line.match(/REFERENCES\s+(?:`|")?(\w+)(?:`|")?\s*\((?:`|")?(\w+)(?:`|")?\)/i);
      if (refMatch) {
        field.type = "ref";
        field.params = { table: refMatch[1].toLowerCase(), field: refMatch[2].toLowerCase() };
      }

      // Check for CHECK IN constraint (enum detection)
      const checkMatch = line.match(/CHECK\s*\(\s*\w+\s+IN\s*\((.*?)\)\s*\)/i);
      if (checkMatch) {
        field.type = "enum";
        field.params = {
          values: checkMatch[1].split(",").map((v) => v.trim().replace(/'/g, "")),
        };
      }

      fields.push(field);
    }

    tables.push({
      name: tableName,
      count: 50,
      fields,
    });
  }

  return { tables };
}

/**
 * Map SQL column types to MockHero field types, using column name for smart inference.
 * Returns the FieldType and optional params.
 */
export function mapSqlType(colName: string, sqlType: string): { type: FieldType; params?: Record<string, unknown> } {
  const name = colName.toLowerCase();

  // Name-based inference (higher priority — column names are more specific than types)
  if (name === "id") return { type: sqlType.includes("UUID") ? "uuid" : "id" };
  if (name.endsWith("_id")) return { type: "uuid" }; // likely a FK, will be overridden if REFERENCES found
  if (name === "email" || name.includes("email")) return { type: "email" };
  if (name === "phone" || name.includes("phone")) return { type: "phone" };
  if (name === "first_name" || name === "firstname") return { type: "first_name" };
  if (name === "last_name" || name === "lastname") return { type: "last_name" };
  if (name === "name" || name === "full_name" || name === "fullname") return { type: "full_name" };
  if (name === "username") return { type: "username" };
  if (name === "password" || name === "password_hash") return { type: "password_hash" };
  if (name === "avatar" || name === "avatar_url" || name === "image_url") return { type: "avatar_url" };
  if (name === "bio" || name === "biography" || name === "about") return { type: "bio" };
  if (name === "address" || name === "street") return { type: "address" };
  if (name === "city") return { type: "city" };
  if (name === "state" || name === "province") return { type: "state_province" };
  if (name === "country") return { type: "country" };
  if (name === "postal_code" || name === "zip" || name === "zip_code") return { type: "postal_code" };
  if (name === "url" || name === "website" || name === "link") return { type: "url" };
  if (name === "title") return { type: "title" };
  if (name === "slug") return { type: "slug" };
  if (name === "description" || name === "content" || name === "body") return { type: "paragraph" };
  if (name === "role") return { type: "role" };
  if (name === "status") return { type: "enum", params: { values: ["active", "inactive", "pending", "archived"] } };
  if (name === "rating") return { type: "rating" };
  if (name === "price" || name === "cost") return { type: "price" };
  if (name === "amount" || name === "total") return { type: "amount" };
  if (name === "currency") return { type: "currency" };
  if (name === "ip" || name === "ip_address") return { type: "ip_address" };
  if (name === "age") return { type: "age" };
  if (name === "gender") return { type: "gender" };
  if (name === "department") return { type: "department" };
  if (name === "company" || name === "company_name") return { type: "company_name" };
  if (name === "job_title" || name === "position") return { type: "job_title" };
  if (name.includes("latitude") || name === "lat") return { type: "latitude" };
  if (name.includes("longitude") || name === "lng" || name === "lon") return { type: "longitude" };
  if (name.includes("created") || name.includes("updated") || name.includes("deleted")) return { type: "datetime" };

  // SQL type fallback
  if (sqlType.includes("UUID")) return { type: "uuid" };
  if (sqlType.includes("SERIAL") || sqlType.includes("BIGSERIAL")) return { type: "id" };
  if (sqlType === "BOOLEAN" || sqlType === "BOOL" || sqlType === "TINYINT(1)") return { type: "boolean" };
  if (sqlType.includes("TIMESTAMP") || sqlType.includes("DATETIME")) return { type: "datetime" };
  if (sqlType === "DATE") return { type: "date" };
  if (sqlType === "TIME") return { type: "time" };
  if (sqlType.includes("DECIMAL") || sqlType.includes("NUMERIC") || sqlType.includes("FLOAT") || sqlType.includes("DOUBLE")) return { type: "decimal" };
  if (sqlType.includes("INT")) return { type: "integer" };
  if (sqlType.includes("TEXT") || sqlType.includes("VARCHAR") || sqlType.includes("CHAR")) return { type: "sentence" };
  if (sqlType.includes("JSON") || sqlType.includes("JSONB")) return { type: "json" };

  return { type: "sentence" };
}

// ── JSON Parser ──────────────────────────────────────────

/**
 * Infer MockHero field definitions from a sample JSON record.
 */
export function detectFromJson(sample: Record<string, unknown>): { tables: [{ name: string; count: number; fields: FieldDefinition[] }] } {
  const fields: FieldDefinition[] = [];

  for (const [key, value] of Object.entries(sample)) {
    const inferred = inferTypeFromValue(key, value);
    fields.push({
      name: key,
      type: inferred.type,
      ...(inferred.params ? { params: inferred.params } : {}),
    });
  }

  return {
    tables: [{
      name: "records",
      count: 50,
      fields,
    }],
  };
}

/**
 * Infer a MockHero field type from a key name and sample value.
 */
export function inferTypeFromValue(key: string, value: unknown): { type: FieldType; params?: Record<string, unknown> } {
  const name = key.toLowerCase();

  // Name-based inference
  if (name === "id" || name.endsWith("_id")) return { type: "uuid" };
  if (name === "email" || name.includes("email")) return { type: "email" };
  if (name === "phone" || name.includes("phone")) return { type: "phone" };
  if (name === "first_name" || name === "firstname") return { type: "first_name" };
  if (name === "last_name" || name === "lastname") return { type: "last_name" };
  if (name === "name" || name === "full_name") return { type: "full_name" };
  if (name === "username") return { type: "username" };
  if (name === "password" || name.includes("password")) return { type: "password_hash" };
  if (name === "bio" || name === "about") return { type: "bio" };
  if (name === "city") return { type: "city" };
  if (name === "country") return { type: "country" };
  if (name === "address") return { type: "address" };
  if (name === "url" || name === "website") return { type: "url" };
  if (name === "title") return { type: "title" };
  if (name === "slug") return { type: "slug" };
  if (name === "price" || name === "cost") return { type: "price" };
  if (name === "amount" || name === "total") return { type: "amount" };
  if (name === "rating") return { type: "rating" };
  if (name === "age") return { type: "age" };
  if (name === "gender") return { type: "gender" };
  if (name === "role") return { type: "role" };

  // Value-based inference
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { type: "integer" };
    return { type: "decimal" };
  }
  if (typeof value === "string") {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return { type: "uuid" };
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return { type: "datetime" };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: "date" };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { type: "email" };
    if (/^https?:\/\//.test(value)) return { type: "url" };
    if (value.length > 200) return { type: "paragraph" };
    return { type: "sentence" };
  }
  if (Array.isArray(value)) return { type: "array" };
  if (typeof value === "object" && value !== null) return { type: "json" };

  return { type: "sentence" };
}
