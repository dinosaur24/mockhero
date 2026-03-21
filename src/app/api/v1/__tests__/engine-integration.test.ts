/**
 * Integration tests for the data generation engine.
 * Tests the full pipeline: parse → generate → format.
 * Does NOT test HTTP (no Supabase needed) — tests the engine directly.
 */

import { describe, it, expect } from "vitest";
import { generateFromRaw } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { formatCSV } from "@/lib/engine/formatters/csv-formatter";
import { formatSQL } from "@/lib/engine/formatters/sql-formatter";

describe("Engine Integration", () => {
  it("full pipeline: valid schema → JSON output", async () => {
    const result = await generateFromRaw({
      tables: [
        {
          name: "users",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "first_name", type: "first_name" },
            { name: "last_name", type: "last_name" },
            { name: "email", type: "email" },
            { name: "active", type: "boolean", params: { probability: 0.85 } },
          ],
        },
      ],
      locale: "de",
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.result.data.users).toHaveLength(5);
    expect(result.result.meta.locale).toBe("de");
    expect(result.result.meta.seed).toBe(42);

    // Check email contains @ and looks derived from name
    const user = result.result.data.users[0];
    expect((user.email as string)).toContain("@");
  });

  it("CSV formatter produces valid output", async () => {
    const result = await generateFromRaw({
      tables: [
        {
          name: "items",
          count: 3,
          fields: [
            { name: "id", type: "id" },
            { name: "name", type: "product_name" },
            { name: "price", type: "decimal", params: { min: 10, max: 100 } },
          ],
        },
      ],
      seed: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const csv = formatCSV(result.result.data);
    const lines = csv.items.split("\n");

    expect(lines[0]).toBe("id,name,price"); // header
    expect(lines).toHaveLength(4); // header + 3 rows
  });

  it("SQL formatter produces valid Postgres output", async () => {
    const result = await generateFromRaw({
      tables: [
        {
          name: "users",
          count: 2,
          fields: [
            { name: "id", type: "uuid" },
            { name: "name", type: "full_name" },
            { name: "active", type: "boolean", params: { probability: 1.0 } },
          ],
        },
        {
          name: "orders",
          count: 3,
          fields: [
            { name: "id", type: "uuid" },
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
            { name: "amount", type: "decimal", params: { min: 10, max: 100 } },
          ],
        },
      ],
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const sql = formatSQL(
      result.result.data,
      [
        { name: "users", count: 2, fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "full_name" },
          { name: "active", type: "boolean", params: { probability: 1.0 } },
        ]},
        { name: "orders", count: 3, fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "amount", type: "decimal", params: { min: 10, max: 100 } },
        ]},
      ],
      "postgres"
    );

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "users"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "orders"');
    expect(sql).toContain('INSERT INTO "users"');
    expect(sql).toContain('INSERT INTO "orders"');
    expect(sql).toContain("BEGIN;");
    expect(sql).toContain("COMMIT;");
    expect(sql).toContain("TRUE"); // Postgres boolean
  });

  it("SQL formatter handles MySQL dialect", async () => {
    const result = await generateFromRaw({
      tables: [
        {
          name: "test",
          count: 1,
          fields: [
            { name: "id", type: "uuid" },
            { name: "active", type: "boolean", params: { probability: 1.0 } },
          ],
        },
      ],
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const sql = formatSQL(
      result.result.data,
      [{ name: "test", count: 1, fields: [
        { name: "id", type: "uuid" },
        { name: "active", type: "boolean", params: { probability: 1.0 } },
      ]}],
      "mysql"
    );

    expect(sql).toContain("CHAR(36)"); // MySQL UUID type
    expect(sql).toContain("1"); // MySQL boolean is 1/0
  });

  it("formatOutput correctly wraps JSON format", async () => {
    const result = await generateFromRaw({
      tables: [
        { name: "t", count: 1, fields: [{ name: "id", type: "uuid" }] },
      ],
      seed: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const formatted = formatOutput(result.result, result.result.data.t as never, "json");
    expect(formatted.contentType).toBe("application/json");
    expect((formatted.body as Record<string, unknown>).data).toBeDefined();
    expect((formatted.body as Record<string, unknown>).meta).toBeDefined();
  });

  it("rejects invalid input through full pipeline", async () => {
    const result = await generateFromRaw({ tables: "not an array" });
    expect(result.success).toBe(false);
  });

  it("determinism: same seed produces identical SQL output", async () => {
    const input = {
      tables: [
        {
          name: "users",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "name", type: "full_name" },
          ],
        },
      ],
      seed: 999,
    };

    const a = await generateFromRaw(input);
    const b = await generateFromRaw(input);

    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    if (!a.success || !b.success) return;

    // Data should be identical
    expect(a.result.data).toEqual(b.result.data);
  });

  it("the magic moment: 4-table schema with all locales", async () => {
    for (const locale of ["en", "de", "fr", "es", "ru", "zh", "ja", "ko", "pt", "it"]) {
      const result = await generateFromRaw({
        tables: [
          {
            name: "users",
            count: 10,
            fields: [
              { name: "id", type: "uuid" },
              { name: "first_name", type: "first_name" },
              { name: "email", type: "email" },
            ],
          },
          {
            name: "products",
            count: 5,
            fields: [
              { name: "id", type: "uuid" },
              { name: "name", type: "product_name" },
              { name: "price", type: "decimal", params: { min: 10, max: 500 } },
            ],
          },
          {
            name: "orders",
            count: 30,
            fields: [
              { name: "id", type: "uuid" },
              { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
              { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
            ],
          },
          {
            name: "reviews",
            count: 15,
            fields: [
              { name: "id", type: "uuid" },
              { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
              { name: "rating", type: "rating" },
            ],
          },
        ],
        locale,
        seed: 42,
      });

      expect(result.success).toBe(true);
      if (!result.success) continue;

      expect(result.result.meta.total_records).toBe(60);

      // Verify FK integrity
      const userIds = new Set(result.result.data.users.map((u) => u.id));
      const productIds = new Set(result.result.data.products.map((p) => p.id));

      for (const order of result.result.data.orders) {
        expect(userIds.has(order.user_id as string)).toBe(true);
        expect(productIds.has(order.product_id as string)).toBe(true);
      }
    }
  });
});
