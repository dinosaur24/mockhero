/**
 * Identity field generators: first_name, last_name, full_name, email, username, phone, avatar_url
 */

import type { FieldGenerator, GeneratorContext } from "../types";

/**
 * Transliterate Unicode characters to ASCII.
 * "Kovačević" → "kovacevic", "Müller" → "muller", "José" → "jose"
 *
 * Uses NFD normalization: decomposes "č" into "c" + combining caron,
 * then strips the combining marks. Handles ß, ø, đ, æ separately.
 */
/**
 * Transliterate to ASCII. Falls back to a random alphanumeric string
 * for scripts that can't be transliterated (CJK, Arabic, Thai, etc.).
 */
function toAscii(str: string, fallback?: string): string {
  const result = str
    .normalize("NFD")                    // decompose: č → c + ̌
    .replace(/[\u0300-\u036f]/g, "")     // strip combining diacritical marks
    .replace(/ß/g, "ss")                 // German sharp s
    .replace(/ø/g, "o")                  // Danish/Norwegian
    .replace(/đ/g, "d")                  // Croatian
    .replace(/Đ/g, "d")
    .replace(/æ/g, "ae")                 // ligatures
    .replace(/œ/g, "oe")
    .toLowerCase()
    .replace(/[^a-z]/g, "");             // strip anything remaining

  // If transliteration stripped everything (CJK, Arabic, etc.), use fallback
  return result || (fallback ?? "user");
}

export const firstNameGenerator: FieldGenerator = (_params, ctx) => {
  const { firstNames } = getLocaleData(ctx);
  return ctx.prng.weightedPick(
    firstNames.map((n) => n.value),
    firstNames.map((n) => n.weight)
  );
};

export const lastNameGenerator: FieldGenerator = (_params, ctx) => {
  const { lastNames } = getLocaleData(ctx);
  return ctx.prng.weightedPick(
    lastNames.map((n) => n.value),
    lastNames.map((n) => n.weight)
  );
};

export const fullNameGenerator: FieldGenerator = (_params, ctx) => {
  const firstName = ctx.currentRecord["first_name"] ?? firstNameGenerator({}, ctx);
  const lastName = ctx.currentRecord["last_name"] ?? lastNameGenerator({}, ctx);
  return `${firstName} ${lastName}`;
};

export const emailGenerator: FieldGenerator = (params, ctx) => {
  // Try to derive from name fields in current record
  let firstName = (ctx.currentRecord["first_name"] as string) ?? "";
  let lastName = (ctx.currentRecord["last_name"] as string) ?? "";

  if (!firstName) firstName = firstNameGenerator({}, ctx) as string;
  if (!lastName) lastName = lastNameGenerator({}, ctx) as string;

  // Normalize for email — provide PRNG-based fallbacks for non-Latin scripts
  const fn = toAscii(firstName, `u${ctx.prng.nextInt(100, 999)}`);
  const ln = toAscii(lastName, `x${ctx.prng.nextInt(100, 999)}`);

  // Pick a pattern
  const patterns = [
    `${fn}.${ln}`,           // maximilian.bergmann
    `${fn}${ln}`,            // maximilianbergmann
    `${fn[0]}.${ln}`,        // m.bergmann
    `${ln}.${fn[0]}`,        // bergmann.m
    `${fn}.${ln}${ctx.prng.nextInt(1, 99)}`, // maximilian.bergmann42
    `${fn}${ctx.prng.nextInt(10, 99)}`,      // maximilian42
  ];
  const emailLocal = ctx.prng.pick(patterns);

  // Domain
  const domain = params.domain as string | undefined;
  if (domain) {
    return `${emailLocal}@${domain}`;
  }

  const { emailDomains } = getLocaleData(ctx);
  const emailDomain = ctx.prng.weightedPick(
    emailDomains.map((d) => d.value),
    emailDomains.map((d) => d.weight)
  );

  return `${emailLocal}@${emailDomain}`;
};

export const usernameGenerator: FieldGenerator = (_params, ctx) => {
  let firstName = (ctx.currentRecord["first_name"] as string) ?? "";
  let lastName = (ctx.currentRecord["last_name"] as string) ?? "";

  if (!firstName) firstName = firstNameGenerator({}, ctx) as string;
  if (!lastName) lastName = lastNameGenerator({}, ctx) as string;

  const fn = toAscii(firstName, `u${ctx.prng.nextInt(100, 999)}`);
  const ln = toAscii(lastName, `x${ctx.prng.nextInt(100, 999)}`);

  const patterns = [
    `${fn[0]}${ln}`,                          // mbergmann
    `${fn}_${ln}`,                             // maximilian_bergmann
    `${fn}${ctx.prng.nextInt(10, 99)}`,        // maximilian42
    `${fn[0]}${ln}${ctx.prng.nextInt(1, 99)}`, // mbergmann7
    `${ln}.${fn[0]}`,                          // bergmann.m
  ];

  return ctx.prng.pick(patterns);
};

export const phoneGenerator: FieldGenerator = (_params, ctx) => {
  const { phoneFormat } = getLocaleData(ctx);
  return phoneFormat.replace(/X/g, () => String(ctx.prng.nextInt(0, 9)));
};

export const avatarUrlGenerator: FieldGenerator = (_params, ctx) => {
  const seed = ctx.prng.nextInt(1, 100000);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

// ── Locale data loading ──────────────────────────────────

import type { LocaleData } from "../types";

// Lazy-loaded locale data cache
const localeCache: Partial<Record<string, LocaleData>> = {};

function getLocaleData(ctx: GeneratorContext): LocaleData {
  const locale = ctx.locale;
  if (!localeCache[locale]) {
    // Dynamic import is async — we pre-load at generator init.
    // For now, assume it's been loaded into the cache before generators run.
    throw new Error(`Locale data not loaded for "${locale}". Call loadLocaleData() first.`);
  }
  return localeCache[locale]!;
}

/** Pre-load locale data into the cache. Must be called before generating. */
export async function loadLocaleData(locale: string): Promise<LocaleData> {
  if (localeCache[locale]) return localeCache[locale]!;

  // Explicit mapping avoids Vite's dynamic import warning
  const loaders: Record<string, () => Promise<Record<string, LocaleData>>> = {
    // Tier 1
    en: () => import("../locale-data/en"),
    // Tier 2
    fr: () => import("../locale-data/fr"),
    de: () => import("../locale-data/de"),
    es: () => import("../locale-data/es"),
    ru: () => import("../locale-data/ru"),
    zh: () => import("../locale-data/zh"),
    // Tier 3
    ar: () => import("../locale-data/ar"),
    it: () => import("../locale-data/it"),
    ja: () => import("../locale-data/ja"),
    hi: () => import("../locale-data/hi"),
    pt: () => import("../locale-data/pt"),
    // Tier 4
    id: () => import("../locale-data/id"),
    ko: () => import("../locale-data/ko"),
    tr: () => import("../locale-data/tr"),
    fa: () => import("../locale-data/fa"),
    pl: () => import("../locale-data/pl"),
    nl: () => import("../locale-data/nl"),
    sv: () => import("../locale-data/sv"),
    da: () => import("../locale-data/da"),
    nb: () => import("../locale-data/nb"),
    th: () => import("../locale-data/th"),
    hr: () => import("../locale-data/hr"),
  };

  const loader = loaders[locale];
  if (!loader) throw new Error(`No locale data for "${locale}"`);

  const mod = await loader();
  const data: LocaleData = mod[locale] ?? (mod as unknown as { default: LocaleData }).default;
  localeCache[locale] = data;
  return data;
}

/** Synchronously get cached locale data. Throws if not pre-loaded. */
export function getCachedLocaleData(locale: string): LocaleData {
  if (!localeCache[locale]) {
    throw new Error(`Locale "${locale}" not pre-loaded. Call loadLocaleData() first.`);
  }
  return localeCache[locale]!;
}
