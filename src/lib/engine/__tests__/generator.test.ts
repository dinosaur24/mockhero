import { describe, it, expect } from "vitest";
import { generate, generateFromRaw } from "../generator";
import type { GenerateRequest } from "../types";

describe("Generator", () => {
  it("generates a single table with correct record count", async () => {
    const request: GenerateRequest = {
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
      locale: "en",
      seed: 42,
    };

    const result = await generate(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.data.users).toHaveLength(5);
      expect(result.result.meta.total_records).toBe(5);
      expect(result.result.meta.tables).toBe(1);
    }
  });

  it("produces deterministic output with same seed", async () => {
    const request: GenerateRequest = {
      tables: [
        {
          name: "users",
          count: 3,
          fields: [
            { name: "id", type: "uuid" },
            { name: "first_name", type: "first_name" },
            { name: "email", type: "email" },
          ],
        },
      ],
      locale: "en",
      seed: 42,
    };

    const a = await generate(request);
    const b = await generate(request);

    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.result.data.users).toEqual(b.result.data.users);
    }
  });

  it("generates German names with locale de", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 10,
          fields: [
            { name: "first_name", type: "first_name" },
            { name: "last_name", type: "last_name" },
          ],
        },
      ],
      locale: "de",
      seed: 1,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const users = result.result.data.users;
      expect(users).toHaveLength(10);
      // German names should be strings
      expect(typeof users[0].first_name).toBe("string");
      expect(typeof users[0].last_name).toBe("string");
      expect((users[0].first_name as string).length).toBeGreaterThan(0);
    }
  });

  it("generates all basic field types without errors", async () => {
    const result = await generate({
      tables: [
        {
          name: "test",
          count: 3,
          fields: [
            { name: "id", type: "uuid" },
            { name: "auto_id", type: "id" },
            { name: "name", type: "full_name" },
            { name: "email", type: "email" },
            { name: "phone", type: "phone" },
            { name: "city", type: "city" },
            { name: "address", type: "address" },
            { name: "company", type: "company_name" },
            { name: "product", type: "product_name" },
            { name: "price", type: "decimal", params: { min: 10, max: 100 } },
            { name: "created", type: "datetime" },
            { name: "age", type: "age" },
            { name: "active", type: "boolean", params: { probability: 0.8 } },
            { name: "role", type: "enum", params: { values: ["admin", "user", "viewer"] } },
            { name: "title", type: "title" },
            { name: "ip", type: "ip_address" },
            { name: "color", type: "color_hex" },
            { name: "rating", type: "rating" },
            { name: "bio", type: "sentence" },
            { name: "url", type: "url" },
          ],
        },
      ],
      locale: "en",
      seed: 99,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const records = result.result.data.test;
      expect(records).toHaveLength(3);

      // Spot-check types
      const r = records[0];
      expect(typeof r.id).toBe("string"); // uuid
      expect(typeof r.auto_id).toBe("number"); // id
      expect(typeof r.name).toBe("string"); // full_name
      expect(typeof r.email).toBe("string"); // email
      expect((r.email as string)).toContain("@");
      expect(typeof r.phone).toBe("string"); // phone
      expect(typeof r.price).toBe("number"); // decimal
      expect(r.price as number).toBeGreaterThanOrEqual(10);
      expect(r.price as number).toBeLessThanOrEqual(100);
      expect(typeof r.active).toBe("boolean");
      expect(["admin", "user", "viewer"]).toContain(r.role);
      expect(typeof r.ip).toBe("string");
      expect((r.color as string)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("generates count=0 as empty array", async () => {
    const result = await generate({
      tables: [
        {
          name: "empty",
          count: 0,
          fields: [{ name: "id", type: "uuid" }],
        },
      ],
      locale: "en",
      seed: 1,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.data.empty).toHaveLength(0);
    }
  });

  it("handles nullable fields", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 100,
          fields: [
            { name: "id", type: "uuid" },
            { name: "bio", type: "sentence", nullable: true, params: { null_rate: 0.5 } },
          ],
        },
      ],
      locale: "en",
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const nullCount = result.result.data.users.filter(
        (r) => r.bio === null
      ).length;
      // With 50% null rate and 100 records, expect roughly 40-60 nulls
      expect(nullCount).toBeGreaterThan(20);
      expect(nullCount).toBeLessThan(80);
    }
  });

  it("resolves ref fields correctly (relational data)", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 5,
          fields: [{ name: "id", type: "uuid" }],
        },
        {
          name: "orders",
          count: 20,
          fields: [
            { name: "id", type: "uuid" },
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
            { name: "amount", type: "decimal", params: { min: 10, max: 500 } },
          ],
        },
      ],
      locale: "en",
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const userIds = new Set(result.result.data.users.map((u) => u.id));
      const orders = result.result.data.orders;

      // Every order's user_id must exist in users
      for (const order of orders) {
        expect(userIds.has(order.user_id as string)).toBe(true);
      }

      expect(result.result.meta.total_records).toBe(25);
    }
  });

  it("detects circular dependencies", async () => {
    const result = await generate({
      tables: [
        {
          name: "a",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "b_id", type: "ref", params: { table: "b", field: "id" } },
          ],
        },
        {
          name: "b",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "a_id", type: "ref", params: { table: "a", field: "id" } },
          ],
        },
      ],
      locale: "en",
      seed: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success && "cycle" in result) {
      expect(result.cycle.length).toBeGreaterThan(0);
    }
  });

  it("handles the magic moment: 4-table relational schema", async () => {
    const startTime = performance.now();

    const result = await generate({
      tables: [
        {
          name: "users",
          count: 50,
          fields: [
            { name: "id", type: "uuid" },
            { name: "first_name", type: "first_name" },
            { name: "last_name", type: "last_name" },
            { name: "email", type: "email" },
          ],
        },
        {
          name: "products",
          count: 30,
          fields: [
            { name: "id", type: "uuid" },
            { name: "name", type: "product_name" },
            { name: "price", type: "decimal", params: { min: 9.99, max: 499.99 } },
          ],
        },
        {
          name: "orders",
          count: 200,
          fields: [
            { name: "id", type: "uuid" },
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
            { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
            { name: "amount", type: "decimal", params: { min: 9.99, max: 499.99 } },
            { name: "status", type: "enum", params: { values: ["pending", "paid", "shipped", "delivered"], weights: [10, 20, 15, 55] } },
            { name: "ordered_at", type: "datetime", params: { min: "2024-01-01", max: "2025-12-31" } },
          ],
        },
        {
          name: "reviews",
          count: 100,
          fields: [
            { name: "id", type: "uuid" },
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
            { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
            { name: "rating", type: "rating" },
            { name: "text", type: "review" },
          ],
        },
      ],
      locale: "de",
      seed: 42,
    });

    const elapsed = performance.now() - startTime;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.meta.total_records).toBe(380);
      expect(result.result.meta.tables).toBe(4);

      // Verify referential integrity
      const userIds = new Set(result.result.data.users.map((u) => u.id));
      const productIds = new Set(result.result.data.products.map((p) => p.id));

      for (const order of result.result.data.orders) {
        expect(userIds.has(order.user_id as string)).toBe(true);
        expect(productIds.has(order.product_id as string)).toBe(true);
      }

      for (const review of result.result.data.reviews) {
        expect(userIds.has(review.user_id as string)).toBe(true);
        expect(productIds.has(review.product_id as string)).toBe(true);
      }

      // Performance: should complete in under 1 second
      expect(elapsed).toBeLessThan(1000);
    }
  });

  it("generateFromRaw rejects invalid input", async () => {
    const result = await generateFromRaw({ tables: "not an array" });
    expect(result.success).toBe(false);
  });

  it("auto-detects locale from country field (enum with country codes)", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 60,
          fields: [
            { name: "id", type: "uuid" },
            { name: "country", type: "enum", params: { values: ["DE", "FR", "ES"] } },
            { name: "first_name", type: "first_name" },
            { name: "last_name", type: "last_name" },
            { name: "email", type: "email" },
            { name: "phone", type: "phone" },
          ],
        },
      ],
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const users = result.result.data.users;
    expect(users).toHaveLength(60);

    // Verify that German users have German phones (+49), French have +33, Spanish have +34
    const deUsers = users.filter((u) => u.country === "DE");
    const frUsers = users.filter((u) => u.country === "FR");
    const esUsers = users.filter((u) => u.country === "ES");

    expect(deUsers.length).toBeGreaterThan(0);
    expect(frUsers.length).toBeGreaterThan(0);
    expect(esUsers.length).toBeGreaterThan(0);

    // Check phone prefixes match country
    for (const u of deUsers) {
      expect((u.phone as string).startsWith("+49")).toBe(true);
    }
    for (const u of frUsers) {
      expect((u.phone as string).startsWith("+33")).toBe(true);
    }
    for (const u of esUsers) {
      expect((u.phone as string).startsWith("+34")).toBe(true);
    }
  });

  it("auto-locale works with country type field too", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 10,
          fields: [
            { name: "id", type: "uuid" },
            { name: "country", type: "enum", params: { values: ["IT"] } },
            { name: "first_name", type: "first_name" },
            { name: "phone", type: "phone" },
          ],
        },
      ],
      seed: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // All users should have Italian phones
    for (const u of result.result.data.users) {
      expect(u.country).toBe("IT");
      expect((u.phone as string).startsWith("+39")).toBe(true);
    }
  });

  it("falls back to request locale when no country field present", async () => {
    const result = await generate({
      tables: [
        {
          name: "users",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "first_name", type: "first_name" },
            { name: "phone", type: "phone" },
          ],
        },
      ],
      locale: "fr",
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // All should be French (request-level locale)
    for (const u of result.result.data.users) {
      expect((u.phone as string).startsWith("+33")).toBe(true);
    }
  });
});
