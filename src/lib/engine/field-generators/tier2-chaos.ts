/**
 * Chaos testing / edge case field generators.
 * These generators produce values specifically designed to surface bugs
 * in data handling: Unicode edge cases, boundary integers, malformed
 * inputs, and date/time gotchas that have caused real-world failures.
 */

import type { FieldGenerator } from "../types";

// ── Unicode String ──────────────────────────────────────

const UNICODE_POOL: string[] = [
  "\u0645\u0631\u062D\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645",              // Arabic
  "\u65E5\u672C\u8A9E\u30C6\u30B9\u30C8",                    // Japanese
  "\uD55C\uAD6D\uC5B4 \uD14C\uC2A4\uD2B8",                  // Korean
  "\u4E2D\u6587\u6D4B\u8BD5\u6570\u636E",                    // Chinese
  "Tes\u035D\u035Ft\u0358\u0357 d\u0330a\u0336t\u0328a\u0327",                 // Zalgo-lite
  "\uD83C\uDF89\uD83D\uDE80\uD83D\uDCBB\uD83D\uDD25\u2728",                   // Emojis only
  "Hello \u4E16\u754C \u0645\u0631\u062D\u0628\u0627 \u043C\u0438\u0440",       // Mixed scripts
  "caf\u00E9 r\u00E9sum\u00E9 na\u00EFve",                   // Accented Latin
  "\u202Ereverse text\u202C",                   // RTL override
  "null\u0000byte",                             // Null byte
  "line1\nline2\ttab",                          // Control characters
  "'quotes' \"double\" `backtick`",             // Quote variants
  "emoji \uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 family",        // ZWJ sequences
  "\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C6\u00C7\u00C8\u00C9\u00CA\u00CB", // Extended Latin
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC \u03B4\u03BF\u03BA\u03B9\u03BC\u03AE",   // Greek
  "\u0939\u093F\u0928\u094D\u0926\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923",         // Hindi/Devanagari
  "\u00F1o\u00F1o a\u00F1o espa\u00F1ol",                    // Spanish special chars
  "Cze\u015B\u0107 \u0141\u00F3d\u017A",                     // Polish
  "\uD835\uDDB3\uD835\uDDBE\uD835\uDDBB\uD835\uDDBB\uD835\uDDC8 \uD835\uDDB2\uD835\uDDC8\uD835\uDDC7\uD835\uDDBB\uD835\uDDC1", // Mathematical symbols
  "<not>html</not>",                            // HTML-like but not XSS
];

export const unicodeStringGenerator: FieldGenerator = (params, ctx) => {
  return ctx.prng.pick(UNICODE_POOL);
};

// ── Long String ─────────────────────────────────────────

export const longStringGenerator: FieldGenerator = (params, ctx) => {
  const minLength = (params.min_length as number) ?? (params.length as number) ?? 10000;
  const maxLength = (params.max_length as number) ?? minLength;
  const baseChar = (params.char as string) ?? "a";

  const targetLength = minLength === maxLength
    ? minLength
    : ctx.prng.nextInt(minLength, maxLength);

  const mixChars = [" ", "\n", "b", "X", "0", "_", "z"];
  const parts: string[] = [];
  let remaining = targetLength;

  while (remaining > 0) {
    // Write a chunk of the base character (~100 chars), then inject variety
    const chunkSize = Math.min(remaining, 100);
    parts.push(baseChar.repeat(chunkSize));
    remaining -= chunkSize;

    if (remaining > 0) {
      const mixChar = ctx.prng.pick(mixChars);
      parts.push(mixChar);
      remaining -= 1;
    }
  }

  return parts.join("").slice(0, targetLength);
};

// ── Boundary Integer ────────────────────────────────────

const BOUNDARY_VALUES: number[] = [
  0,
  -1,
  1,
  2147483647,             // INT32_MAX
  -2147483648,            // INT32_MIN
  2147483646,             // INT32_MAX - 1
  9007199254740991,       // JS MAX_SAFE_INTEGER
  -9007199254740991,      // JS MIN_SAFE_INTEGER
  255,                    // UINT8_MAX
  256,
  65535,                  // UINT16_MAX
  65536,
  32767,                  // INT16_MAX
  -32768,                // INT16_MIN
  100,
  999,
  1000,
  9999,
  10000,
  99999,
  100000,
];

export const boundaryIntegerGenerator: FieldGenerator = (params, ctx) => {
  return ctx.prng.pick(BOUNDARY_VALUES);
};

// ── Empty String ────────────────────────────────────────

export const emptyStringGenerator: FieldGenerator = (params, ctx) => {
  const frequency = (params.frequency as number) ?? 1.0;

  if (ctx.prng.chance(frequency)) {
    return "";
  }

  // When not empty, randomly return a single space or null
  return ctx.prng.chance(0.5) ? " " : null;
};

// ── Error Value ─────────────────────────────────────────

const ERROR_VALUES_BY_CATEGORY: Record<string, string[]> = {
  email: [
    "not-an-email",
    "@missing-local.com",
    "user@",
    "user@.com",
    "user @space.com",
    "user@domain..com",
  ],
  uuid: [
    "not-a-uuid",
    "12345",
    "g1234567-89ab-cdef-0123-456789abcdef",
  ],
  date: [
    "2024-13-01",
    "2024-02-30",
    "not-a-date",
    "9999-99-99",
  ],
  url: [
    "not-a-url",
    "://missing-scheme.com",
    "http://",
    "ftp:/invalid",
  ],
  phone: [
    "abc-def-ghij",
    "+0000000000",
    "123",
    "",
  ],
  json: [
    '{"unclosed": ',
    '{"key": undefined}',
    "[1,2,3,}",
  ],
  number: [
    "99999999999999999999999",
    "-99999999999999999999999",
  ],
  special: [
    "NULL",
    "undefined",
    "NaN",
    "Infinity",
    "-Infinity",
  ],
};

const ALL_ERROR_VALUES: string[] = Object.values(ERROR_VALUES_BY_CATEGORY).flat();

export const errorValueGenerator: FieldGenerator = (params, ctx) => {
  const targetType = params.target_type as string | undefined;

  if (targetType && targetType in ERROR_VALUES_BY_CATEGORY) {
    return ctx.prng.pick(ERROR_VALUES_BY_CATEGORY[targetType]);
  }

  // No target type or unrecognized — pick from the entire pool
  return ctx.prng.pick(ALL_ERROR_VALUES);
};

// ── Future-Proof Date ───────────────────────────────────

const EDGE_CASE_DATES: string[] = [
  "2038-01-19T03:14:07Z",         // Y2K38 — Unix 32-bit overflow
  "2038-01-19T03:14:08Z",         // One second after Y2K38
  "2024-02-29T12:00:00Z",         // Leap day 2024
  "2025-02-28T23:59:59Z",         // Last second of Feb in non-leap year
  "2000-01-01T00:00:00Z",         // Y2K
  "1999-12-31T23:59:59Z",         // Last second of 1999
  "1970-01-01T00:00:00Z",         // Unix epoch
  "1970-01-01T00:00:01Z",         // One second after epoch
  "2100-01-01T00:00:00Z",         // Year 2100 — not a leap year (divisible by 100, not 400)
  "2099-12-31T23:59:59Z",         // End of century
  "9999-12-31T23:59:59Z",         // Max 4-digit year
  "2024-03-10T02:30:00-05:00",    // US DST spring forward — time doesn't exist in ET
  "2024-11-03T01:30:00-04:00",    // US DST fall back — time exists twice
  "2024-12-31T23:59:60Z",         // Leap second
];

export const futureProofDateGenerator: FieldGenerator = (params, ctx) => {
  return ctx.prng.pick(EDGE_CASE_DATES);
};
