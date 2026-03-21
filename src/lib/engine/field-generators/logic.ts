/**
 * Logic field generators: boolean, enum, integer, ref, sequence, constant
 */

import type { FieldGenerator } from "../types";

export const booleanGenerator: FieldGenerator = (params, ctx) => {
  const probability = (params.probability as number) ?? 0.5;
  return ctx.prng.chance(probability);
};

export const enumGenerator: FieldGenerator = (params, ctx) => {
  const values = params.values as unknown[];
  if (!values || values.length === 0) {
    throw new Error("Enum generator requires a non-empty 'values' array");
  }

  const weights = params.weights as number[] | undefined;
  if (weights && weights.length === values.length) {
    return ctx.prng.weightedPick(values, weights);
  }

  return ctx.prng.pick(values);
};

export const integerGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 0;
  const max = (params.max as number) ?? 1000;
  return ctx.prng.nextInt(min, max);
};

/**
 * Ref generator — resolves foreign key references.
 * Picks a real ID from an already-generated parent table.
 */
export const refGenerator: FieldGenerator = (params, ctx) => {
  const tableName = params.table as string;
  const fieldName = params.field as string;
  const distribution = (params.distribution as string) ?? "uniform";

  const parentRecords = ctx.tableData[tableName];
  if (!parentRecords || parentRecords.length === 0) {
    throw new Error(
      `Ref to "${tableName}.${fieldName}" failed: table "${tableName}" has no records. ` +
      `Ensure parent tables are generated before child tables.`
    );
  }

  const values = parentRecords.map((r) => r[fieldName]).filter((v) => v !== undefined);

  if (values.length === 0) {
    throw new Error(
      `Ref to "${tableName}.${fieldName}" failed: field "${fieldName}" not found in any "${tableName}" records. ` +
      `Check that the referenced field name is correct.`
    );
  }

  if (distribution === "power_law") {
    // Zipf-like distribution: rank-based, ~20% of parents get ~80% of refs
    // Lower-indexed items get exponentially more references
    const alpha = (params.alpha as number) ?? 1.0;
    const weights = values.map((_, i) => 1 / Math.pow(i + 1, alpha));
    return ctx.prng.weightedPick(values, weights);
  }

  // Uniform distribution
  return ctx.prng.pick(values);
};

/** Sequence IDs with auto-incrementing values based on row index */
export const sequenceGenerator: FieldGenerator = (params, ctx) => {
  const start = (params.start as number) ?? 1;
  const step = (params.step as number) ?? 1;
  const prefix = (params.prefix as string) ?? "";
  const suffix = (params.suffix as string) ?? "";

  const value = start + ctx.rowIndex * step;

  return `${prefix}${value}${suffix}`;
};

export const constantGenerator: FieldGenerator = (params) => {
  return params.value ?? null;
};
