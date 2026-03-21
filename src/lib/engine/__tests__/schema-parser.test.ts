import { describe, it, expect } from "vitest";
import { parseSchema } from "../schema-parser";

describe("Schema Parser", () => {
  it("parses a valid single-table schema", () => {
    const result = parseSchema({
      tables: [
        {
          name: "users",
          count: 10,
          fields: [
            { name: "id", type: "uuid" },
            { name: "name", type: "full_name" },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tables).toHaveLength(1);
      expect(result.data.tables[0].name).toBe("users");
      expect(result.data.locale).toBe("en"); // default
      expect(result.data.format).toBe("json"); // default
    }
  });

  it("parses a valid multi-table schema with refs", () => {
    const result = parseSchema({
      tables: [
        {
          name: "users",
          count: 10,
          fields: [{ name: "id", type: "uuid" }],
        },
        {
          name: "orders",
          count: 50,
          fields: [
            { name: "id", type: "uuid" },
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          ],
        },
      ],
      locale: "de",
      format: "sql",
      seed: 42,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tables).toHaveLength(2);
      expect(result.data.locale).toBe("de");
      expect(result.data.seed).toBe(42);
    }
  });

  it("rejects empty body", () => {
    const result = parseSchema(null);
    expect(result.success).toBe(false);
  });

  it("rejects empty tables array", () => {
    const result = parseSchema({ tables: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("At least one table");
    }
  });

  it("rejects unknown field type with suggestion", () => {
    const result = parseSchema({
      tables: [
        {
          name: "users",
          count: 5,
          fields: [{ name: "id", type: "uuiid" }],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("Unknown field type");
      expect(result.errors[0].suggestion).toContain("uuid");
    }
  });

  it("rejects ref to nonexistent table", () => {
    const result = parseSchema({
      tables: [
        {
          name: "orders",
          count: 10,
          fields: [
            { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("not defined");
    }
  });

  it("rejects duplicate table names", () => {
    const result = parseSchema({
      tables: [
        { name: "users", count: 5, fields: [{ name: "id", type: "uuid" }] },
        { name: "users", count: 10, fields: [{ name: "id", type: "uuid" }] },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("Duplicate table name");
    }
  });

  it("rejects enum without values", () => {
    const result = parseSchema({
      tables: [
        {
          name: "users",
          count: 5,
          fields: [{ name: "role", type: "enum", params: {} }],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("values");
    }
  });

  it("rejects more than 20 tables", () => {
    const tables = Array.from({ length: 21 }, (_, i) => ({
      name: `table_${i}`,
      count: 1,
      fields: [{ name: "id", type: "uuid" }],
    }));

    const result = parseSchema({ tables });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].message).toContain("Maximum 20 tables");
    }
  });

  it("rejects unsupported locale", () => {
    const result = parseSchema({
      tables: [{ name: "t", count: 1, fields: [{ name: "id", type: "uuid" }] }],
      locale: "zz",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].field).toBe("locale");
    }
  });
});
