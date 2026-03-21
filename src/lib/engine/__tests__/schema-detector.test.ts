import { describe, it, expect } from "vitest";
import { detectFromSql, detectFromJson } from "../schema-detector";

describe("detectFromSql", () => {
  it("parses basic CREATE TABLE", () => {
    const result = detectFromSql(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
      );
    `);

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].name).toBe("users");
    expect(result.tables[0].fields).toHaveLength(3);
  });

  it("preserves columns with multi-param SQL types like DECIMAL(10,2)", () => {
    const result = detectFromSql(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        tax NUMERIC(12,4),
        name VARCHAR(255)
      );
    `);

    const fields = result.tables[0].fields;
    expect(fields.map((f) => f.name)).toEqual(["id", "amount", "tax", "name"]);
    // amount and tax should be detected as decimal types, not dropped
    expect(fields.find((f) => f.name === "amount")?.type).toBe("amount"); // name-based inference
    expect(fields.find((f) => f.name === "tax")?.type).toBe("decimal");
  });

  it("handles multiple tables with REFERENCES and DECIMAL", () => {
    const result = detectFromSql(`
      CREATE TABLE products (
        id UUID PRIMARY KEY,
        price DECIMAL(10,2) NOT NULL,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        product_id UUID REFERENCES products(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL
      );
    `);

    expect(result.tables).toHaveLength(2);

    const products = result.tables.find((t) => t.name === "products")!;
    expect(products.fields.map((f) => f.name)).toEqual(["id", "price", "name"]);

    const orderItems = result.tables.find((t) => t.name === "order_items")!;
    expect(orderItems.fields.map((f) => f.name)).toEqual(["id", "product_id", "quantity", "unit_price"]);
    expect(orderItems.fields.find((f) => f.name === "product_id")?.type).toBe("ref");
  });

  it("handles ENUM-like CHECK constraints", () => {
    const result = detectFromSql(`
      CREATE TABLE users (
        id SERIAL,
        status VARCHAR(20) CHECK(status IN ('active', 'inactive', 'banned'))
      );
    `);

    const status = result.tables[0].fields.find((f) => f.name === "status");
    expect(status?.type).toBe("enum");
    expect(status?.params?.values).toEqual(["active", "inactive", "banned"]);
  });
});

describe("detectFromJson", () => {
  it("infers types from sample JSON values", () => {
    const result = detectFromJson({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "test@example.com",
      name: "John",
      age: 30,
      active: true,
      score: 4.5,
    });

    expect(result.tables[0].fields.find((f) => f.name === "id")?.type).toBe("uuid");
    expect(result.tables[0].fields.find((f) => f.name === "email")?.type).toBe("email");
    expect(result.tables[0].fields.find((f) => f.name === "age")?.type).toBe("age");
    expect(result.tables[0].fields.find((f) => f.name === "active")?.type).toBe("boolean");
    expect(result.tables[0].fields.find((f) => f.name === "score")?.type).toBe("decimal");
  });
});
