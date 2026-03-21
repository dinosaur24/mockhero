/**
 * Auto-detect locale from row data.
 * If a row has a "country" field (or similar), map it to the closest locale.
 * Falls back to the request-level locale if no match.
 */

import type { Locale, FieldDefinition } from "./types";
import { SUPPORTED_LOCALES } from "./types";

/**
 * Maps country codes and country names to supported locales.
 * Covers ISO 3166-1 alpha-2 codes and common English names.
 */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  // English-speaking
  US: "en", USA: "en", "United States": "en",
  GB: "en", UK: "en", "United Kingdom": "en",
  AU: "en", Australia: "en",
  CA: "en", Canada: "en",
  NZ: "en", "New Zealand": "en",
  IE: "en", Ireland: "en",
  ZA: "en", "South Africa": "en",

  // French-speaking
  FR: "fr", France: "fr",
  BE: "fr", Belgium: "fr",
  LU: "fr", Luxembourg: "fr",
  SN: "fr", Senegal: "fr",
  CI: "fr", "Ivory Coast": "fr",

  // German-speaking
  DE: "de", Germany: "de",
  AT: "de", Austria: "de",
  CH: "de", Switzerland: "de",

  // Spanish-speaking
  ES: "es", Spain: "es",
  MX: "es", Mexico: "es",
  AR: "es", Argentina: "es",
  CO: "es", Colombia: "es",
  CL: "es", Chile: "es",
  PE: "es", Peru: "es",
  VE: "es", Venezuela: "es",
  EC: "es", Ecuador: "es",

  // Russian-speaking
  RU: "ru", Russia: "ru",
  BY: "ru", Belarus: "ru",
  KZ: "ru", Kazakhstan: "ru",
  UA: "ru", Ukraine: "ru",

  // Chinese-speaking
  CN: "zh", China: "zh",
  TW: "zh", Taiwan: "zh",
  HK: "zh", "Hong Kong": "zh",
  SG: "zh", Singapore: "zh",

  // Arabic-speaking
  SA: "ar", "Saudi Arabia": "ar",
  AE: "ar", "United Arab Emirates": "ar",
  EG: "ar", Egypt: "ar",
  MA: "ar", Morocco: "ar",
  IQ: "ar", Iraq: "ar",
  JO: "ar", Jordan: "ar",
  QA: "ar", Qatar: "ar",
  KW: "ar", Kuwait: "ar",
  BH: "ar", Bahrain: "ar",
  OM: "ar", Oman: "ar",

  // Italian
  IT: "it", Italy: "it",

  // Japanese
  JP: "ja", Japan: "ja",

  // Hindi
  IN: "hi", India: "hi",

  // Portuguese-speaking
  BR: "pt", Brazil: "pt",
  PT: "pt", Portugal: "pt",
  AO: "pt", Angola: "pt",
  MZ: "pt", Mozambique: "pt",

  // Indonesian/Malay
  ID: "id", Indonesia: "id",
  MY: "id", Malaysia: "id",

  // Korean
  KR: "ko", "South Korea": "ko",

  // Turkish
  TR: "tr", Turkey: "tr", Türkiye: "tr",

  // Persian-speaking
  IR: "fa", Iran: "fa",
  AF: "fa", Afghanistan: "fa",
  TJ: "fa", Tajikistan: "fa",

  // Polish
  PL: "pl", Poland: "pl",

  // Dutch
  NL: "nl", Netherlands: "nl",

  // Swedish
  SE: "sv", Sweden: "sv",

  // Danish
  DK: "da", Denmark: "da",

  // Norwegian
  NO: "nb", Norway: "nb",

  // Thai
  TH: "th", Thailand: "th",

  // Croatian
  HR: "hr", Croatia: "hr",
  BA: "hr", "Bosnia and Herzegovina": "hr",
  ME: "hr", Montenegro: "hr",
};

/**
 * Detect which fields in a table determine the locale.
 */
export function findLocaleDeterminingFields(fields: FieldDefinition[]): string[] {
  const result: string[] = [];

  for (const field of fields) {
    if (field.type === "country") {
      result.push(field.name);
      continue;
    }

    if (field.type === "enum" && field.params?.values) {
      const values = field.params.values as string[];
      const countryCodeCount = values.filter(
        (v) => typeof v === "string" && COUNTRY_TO_LOCALE[v] !== undefined
      ).length;
      if (countryCodeCount > values.length * 0.5) {
        result.push(field.name);
      }
    }
  }

  return result;
}

/**
 * Given a row's data, resolve the best locale.
 */
export function resolveRowLocale(
  record: Record<string, unknown>,
  localeDeterminingFields: string[],
  fallback: Locale
): Locale {
  for (const fieldName of localeDeterminingFields) {
    const value = record[fieldName];
    if (typeof value === "string") {
      const mapped = COUNTRY_TO_LOCALE[value];
      if (mapped && SUPPORTED_LOCALES.includes(mapped)) {
        return mapped;
      }
    }
  }

  return fallback;
}

/**
 * Check if a field type is locale-sensitive.
 */
export function isLocaleSensitiveField(type: string): boolean {
  return [
    "first_name", "last_name", "full_name", "email", "username",
    "phone", "city", "address", "postal_code", "state_province",
    "country",
  ].includes(type);
}
