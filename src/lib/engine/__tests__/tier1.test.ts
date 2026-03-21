/**
 * Tests for Tier 1 field generators.
 * The "holy shit, they thought of everything" types.
 */

import { describe, it, expect } from "vitest";
import { generate } from "../generator";

/** Helper: generate a single table with one field type */
async function generateField(type: string, params?: Record<string, unknown>, count = 5) {
  const result = await generate({
    tables: [{
      name: "test",
      count,
      fields: [
        { name: "id", type: "uuid" },
        { name: "value", type: type as any, ...(params ? { params } : {}) },
      ],
    }],
    seed: 42,
  });

  expect(result.success).toBe(true);
  if (!result.success) throw new Error("Generation failed");
  return result.result.data.test;
}

describe("Tier 1 Field Generators", () => {
  // ── GENDER ──────────────────────────────────────────

  it("gender: returns valid values with defaults", async () => {
    const rows = await generateField("gender");
    const validValues = ["male", "female", "non-binary", "prefer_not_to_say"];
    for (const row of rows) {
      expect(validValues).toContain(row.value);
    }
  });

  it("gender: respects custom values", async () => {
    const rows = await generateField("gender", { values: ["m", "f", "x"] });
    for (const row of rows) {
      expect(["m", "f", "x"]).toContain(row.value);
    }
  });

  // ── DATE OF BIRTH ──────────────────────────────────

  it("date_of_birth: returns valid date in age range", async () => {
    const rows = await generateField("date_of_birth", { min_age: 25, max_age: 35 });
    const now = new Date();

    for (const row of rows) {
      const dob = new Date(row.value as string);
      const age = now.getFullYear() - dob.getFullYear();
      expect(age).toBeGreaterThanOrEqual(25);
      expect(age).toBeLessThanOrEqual(36); // +1 for birthday not yet passed
      expect(row.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // ── TIMEZONE ────────────────────────────────────────

  it("timezone: returns IANA timezone strings", async () => {
    const rows = await generateField("timezone");
    for (const row of rows) {
      expect(row.value).toMatch(/^[A-Z][a-z]+\/[A-Za-z_]+/);
    }
  });

  // ── SKU ─────────────────────────────────────────────

  it("sku: returns formatted product codes", async () => {
    const rows = await generateField("sku");
    for (const row of rows) {
      // Format: PREFIX-CATEGORY-NN-NNN
      expect(row.value).toMatch(/^[A-Z]{2,4}-[A-Z]{3,4}-\d{2}-\d{3}$/);
    }
  });

  // ── CREDIT CARD NUMBER ──────────────────────────────

  it("credit_card_number: generates Luhn-valid numbers", async () => {
    const rows = await generateField("credit_card_number", undefined, 20);

    for (const row of rows) {
      const num = row.value as string;
      // Must be 15 (Amex) or 16 digits
      expect(num).toMatch(/^\d{15,16}$/);

      // Luhn validation
      const digits = num.split("").reverse().map(Number);
      let sum = 0;
      for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === 1) {
          d *= 2;
          if (d > 9) d -= 9;
        }
        sum += d;
      }
      expect(sum % 10).toBe(0); // Luhn check passes
    }
  });

  it("credit_card_number: Visa starts with 4", async () => {
    const rows = await generateField("credit_card_number", { network: "visa" }, 10);
    for (const row of rows) {
      expect((row.value as string).startsWith("4")).toBe(true);
      expect((row.value as string).length).toBe(16);
    }
  });

  it("credit_card_number: Amex starts with 34 or 37", async () => {
    const rows = await generateField("credit_card_number", { network: "amex" }, 10);
    for (const row of rows) {
      const num = row.value as string;
      expect(num.startsWith("34") || num.startsWith("37")).toBe(true);
      expect(num.length).toBe(15);
    }
  });

  // ── TRACKING NUMBER ─────────────────────────────────

  it("tracking_number: UPS format starts with 1Z", async () => {
    const rows = await generateField("tracking_number", { carrier: "ups" });
    for (const row of rows) {
      expect((row.value as string).startsWith("1Z")).toBe(true);
      expect((row.value as string).length).toBe(18);
    }
  });

  it("tracking_number: USPS format starts with 9400", async () => {
    const rows = await generateField("tracking_number", { carrier: "usps" });
    for (const row of rows) {
      expect((row.value as string).startsWith("9400")).toBe(true);
      expect((row.value as string).length).toBe(22);
    }
  });

  // ── DATE RANGE ──────────────────────────────────────

  it("date_range: start is always before end", async () => {
    const rows = await generateField("date_range", undefined, 20);
    for (const row of rows) {
      const range = row.value as { start: string; end: string };
      expect(range).toHaveProperty("start");
      expect(range).toHaveProperty("end");
      expect(new Date(range.start).getTime()).toBeLessThan(new Date(range.end).getTime());
    }
  });

  it("date_range: respects gap constraints", async () => {
    const rows = await generateField("date_range", { min_gap_days: 7, max_gap_days: 14 }, 20);
    for (const row of rows) {
      const range = row.value as { start: string; end: string };
      const gapMs = new Date(range.end).getTime() - new Date(range.start).getTime();
      const gapDays = gapMs / (24 * 60 * 60 * 1000);
      expect(gapDays).toBeGreaterThanOrEqual(7);
      expect(gapDays).toBeLessThanOrEqual(14);
    }
  });

  // ── EMBEDDING VECTOR ────────────────────────────────

  it("embedding_vector: generates correct dimensions", async () => {
    const rows = await generateField("embedding_vector", { dimensions: 128 }, 3);
    for (const row of rows) {
      const vec = row.value as number[];
      expect(vec).toHaveLength(128);
      for (const v of vec) {
        expect(typeof v).toBe("number");
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("embedding_vector: defaults to 1536 dimensions", async () => {
    const rows = await generateField("embedding_vector", undefined, 1);
    const vec = rows[0].value as number[];
    expect(vec).toHaveLength(1536);
  });

  // ── MARKDOWN ────────────────────────────────────────

  it("markdown: contains header and content", async () => {
    const rows = await generateField("markdown");
    for (const row of rows) {
      const md = row.value as string;
      expect(md).toContain("##");
      expect(md.length).toBeGreaterThan(50);
    }
  });

  it("markdown: long format includes code blocks", async () => {
    const rows = await generateField("markdown", { length: "long" });
    for (const row of rows) {
      const md = row.value as string;
      expect(md).toContain("```");
      expect(md).toContain("> **Note:**");
    }
  });

  // ── PASSWORD HASH ──────────────────────────────────

  it("password_hash: generates valid bcrypt format", async () => {
    const rows = await generateField("password_hash");
    for (const row of rows) {
      const hash = row.value as string;
      // Bcrypt format: $2b$XX$<53 chars>
      expect(hash).toMatch(/^\$2b\$\d{2}\$.{53}$/);
    }
  });

  it("password_hash: respects custom rounds", async () => {
    const rows = await generateField("password_hash", { rounds: 12 });
    for (const row of rows) {
      expect((row.value as string).startsWith("$2b$12$")).toBe(true);
    }
  });

  it("password_hash: generates valid argon2 format", async () => {
    const rows = await generateField("password_hash", { algorithm: "argon2" });
    for (const row of rows) {
      const hash = row.value as string;
      expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,t=3,p=4\$/);
    }
  });

  // ── XSS STRING ──────────────────────────────────────

  it("xss_string: returns known XSS payloads", async () => {
    const rows = await generateField("xss_string", undefined, 10);
    for (const row of rows) {
      const val = row.value as string;
      // Should contain script tags, event handlers, or JS protocol
      expect(
        val.includes("<script") ||
        val.includes("onerror") ||
        val.includes("onload") ||
        val.includes("javascript:") ||
        val.includes("alert") ||
        val.includes("onfocus") ||
        val.includes("ontoggle") ||
        val.includes("constructor") ||
        val.includes("${")
      ).toBe(true);
    }
  });

  // ── SQL INJECTION STRING ────────────────────────────

  it("sql_injection_string: returns known SQL injection payloads", async () => {
    const rows = await generateField("sql_injection_string", undefined, 10);
    for (const row of rows) {
      const val = row.value as string;
      expect(
        val.includes("DROP") ||
        val.includes("OR") ||
        val.includes("UNION") ||
        val.includes("SELECT") ||
        val.includes("--") ||
        val.includes("EXEC") ||
        val.includes("WAITFOR") ||
        val.includes("CONVERT") ||
        val.includes("ORDER BY")
      ).toBe(true);
    }
  });

  // ── DETERMINISM ─────────────────────────────────────

  it("all tier 1 types are deterministic with same seed", async () => {
    const schema = {
      tables: [{
        name: "test",
        count: 3,
        fields: [
          { name: "gender", type: "gender" as const },
          { name: "dob", type: "date_of_birth" as const },
          { name: "tz", type: "timezone" as const },
          { name: "sku", type: "sku" as const },
          { name: "card", type: "credit_card_number" as const },
          { name: "tracking", type: "tracking_number" as const },
          { name: "range", type: "date_range" as const },
          { name: "hash", type: "password_hash" as const },
          { name: "xss", type: "xss_string" as const },
          { name: "sqli", type: "sql_injection_string" as const },
        ],
      }],
      seed: 42,
    };

    const result1 = await generate(schema);
    const result2 = await generate(schema);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (!result1.success || !result2.success) return;

    expect(JSON.stringify(result1.result.data)).toBe(JSON.stringify(result2.result.data));
  });
});
