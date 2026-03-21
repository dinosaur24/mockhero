/**
 * Temporal field generators: datetime, date, time, timestamp, age
 */

import type { FieldGenerator } from "../types";

const DEFAULT_MIN_DATE = "2020-01-01";
const DEFAULT_MAX_DATE = "2025-12-31";

function parseDate(str: string): number {
  return new Date(str).getTime();
}

export const datetimeGenerator: FieldGenerator = (params, ctx) => {
  const min = parseDate((params.min as string) ?? DEFAULT_MIN_DATE);
  const max = parseDate((params.max as string) ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return new Date(ts).toISOString();
};

export const dateGenerator: FieldGenerator = (params, ctx) => {
  const min = parseDate((params.min as string) ?? DEFAULT_MIN_DATE);
  const max = parseDate((params.max as string) ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return new Date(ts).toISOString().split("T")[0];
};

export const timeGenerator: FieldGenerator = (_params, ctx) => {
  const hours = ctx.prng.nextInt(0, 23);
  const minutes = ctx.prng.nextInt(0, 59);
  const seconds = ctx.prng.nextInt(0, 59);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const timestampGenerator: FieldGenerator = (params, ctx) => {
  const min = parseDate((params.min as string) ?? DEFAULT_MIN_DATE);
  const max = parseDate((params.max as string) ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return Math.floor(ts / 1000);
};

export const ageGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 18;
  const max = (params.max as number) ?? 80;
  return ctx.prng.nextInt(min, max);
};
