/**
 * Core type definitions for the MockHero data generation engine.
 * Source: docs/prd.md § API Specification
 */

import type { PRNG } from "./prng";

// ── Locales ──────────────────────────────────────────────

export const SUPPORTED_LOCALES = [
  // Tier 1
  "en",
  // Tier 2
  "fr", "de", "es", "ru", "zh",
  // Tier 3
  "ar", "it", "ja", "hi", "pt",
  // Tier 4
  "id", "ko", "tr", "fa", "pl", "nl", "sv", "da", "nb", "th",
  // Tier 5
  "hr",
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// ── Output Formats ───────────────────────────────────────

export const SUPPORTED_FORMATS = ["json", "csv", "sql"] as const;
export type OutputFormat = (typeof SUPPORTED_FORMATS)[number];

export const SUPPORTED_SQL_DIALECTS = ["postgres", "mysql", "sqlite"] as const;
export type SqlDialect = (typeof SUPPORTED_SQL_DIALECTS)[number];

// ── Field Types ──────────────────────────────────────────

export const FIELD_TYPES = [
  // Identity
  "first_name", "last_name", "full_name", "email", "username", "phone", "avatar_url", "avatar",
  "gender", "date_of_birth", "name_prefix", "name_suffix", "nickname", "marital_status",
  "nationality", "blood_type", "pronoun_set", "bio", "ssn", "passport_number", "phone_e164",
  // Location
  "address", "city", "state_province", "country", "postal_code", "latitude", "longitude",
  "timezone", "country_code", "neighborhood", "street_address", "address_line_2", "locale_code",
  // Financial
  "company_name", "job_title", "department", "product_name", "price", "amount", "decimal", "float", "number",
  "currency", "iban", "vat_number", "sku", "credit_card_number", "tracking_number",
  "bank_name", "payment_method", "discount_code", "credit_card_expiry", "credit_card_cvv",
  "invoice_number", "swift_code", "tax_id", "stock_ticker", "wallet_address",
  // Ecommerce
  "shipping_carrier", "order_status", "product_category", "product_description",
  "barcode_ean13", "isbn", "weight",
  // Temporal
  "datetime", "date", "time", "timestamp", "age", "date_range",
  "date_future", "date_past", "duration", "relative_time",
  // Technical
  "uuid", "id", "ip_address", "mac_address", "url", "domain", "user_agent", "color_hex",
  "embedding_vector", "http_method", "mime_type", "file_extension", "programming_language",
  "database_engine", "semver", "api_key", "commit_sha", "hash_md5", "hash_sha256",
  "port_number", "http_status_code", "file_size", "docker_image",
  // Content
  "sentence", "catch_phrase", "paragraph", "title", "slug", "tag", "rating", "review", "markdown",
  "emoji", "hashtag", "message", "notification_text", "blog_post", "blog_comment",
  // Social
  "social_platform", "reaction", "github_username", "twitter_handle",
  // HR & Organization
  "employment_status", "seniority_level", "skill", "leave_type", "employee_id",
  "salary", "team_name", "degree", "university_name",
  // AI / ML
  "label", "confidence_score", "token_count",
  // Healthcare
  "medical_specialty", "allergy",
  // Real Estate
  "property_type",
  // Media
  "music_genre", "color_rgb", "color_name",
  // Security & Auth
  "password_hash", "xss_string", "sql_injection_string", "role", "permission",
  "oauth_scope", "license_key", "totp_secret", "jwt_token",
  // Chaos Testing
  "unicode_string", "long_string", "boundary_integer", "empty_string",
  "error_value", "future_proof_date",
  // Logic
  "boolean", "enum", "ref", "nullable", "sequence", "integer", "constant",
  // Special
  "image_url", "file_path", "json", "array",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

// ── Field Definition ─────────────────────────────────────

export interface FieldDefinition {
  name: string;
  type: FieldType;
  /** Optional parameters specific to the field type */
  params?: Record<string, unknown>;
  /** If true, value may be null based on null_rate (default 0.15) */
  nullable?: boolean;
}

// ── Table Definition ─────────────────────────────────────

export interface TableDefinition {
  name: string;
  count: number;
  fields: FieldDefinition[];
}

// ── Request / Response ───────────────────────────────────

export interface GenerateRequest {
  tables: TableDefinition[];
  locale?: Locale;
  format?: OutputFormat;
  sql_dialect?: SqlDialect;
  seed?: number;
}

export interface GenerateMeta {
  tables: number;
  total_records: number;
  records_per_table: Record<string, number>;
  locale: Locale;
  format: OutputFormat;
  seed: number;
  generation_time_ms: number;
}

export interface GenerateResult {
  data: Record<string, Record<string, unknown>[]>;
  meta: GenerateMeta;
}

// ── Generator Context ────────────────────────────────────

/**
 * Passed to every field generator. Contains the PRNG, locale,
 * and already-generated table data for ref resolution.
 */
export interface GeneratorContext {
  prng: PRNG;
  locale: Locale;
  /** Map of table name → generated records. Used for ref field resolution. */
  tableData: Record<string, Record<string, unknown>[]>;
  /** The current record being generated (for deriving email from name, etc.) */
  currentRecord: Record<string, unknown>;
  /** Current row index (0-based) within the table being generated */
  rowIndex: number;
}

// ── Locale Data ──────────────────────────────────────────

export interface WeightedName {
  value: string;
  weight: number;
}

export interface CityPostal {
  city: string;
  postal: string;
  state?: string;
}

export interface LocaleData {
  firstNames: WeightedName[];
  lastNames: WeightedName[];
  cities: CityPostal[];
  phoneFormat: string;       // e.g., "+1 (XXX) XXX-XXXX" where X = random digit
  emailDomains: WeightedName[];
  streetPatterns: string[];  // e.g., "{number} {street} Street"
  streetNames: string[];
  countryCode: string;       // e.g., "US", "DE"
  countryName: string;       // e.g., "United States", "Germany"
}

// ── Field Generator Function Signature ───────────────────

export type FieldGenerator = (
  params: Record<string, unknown>,
  context: GeneratorContext
) => unknown | Promise<unknown>;

// ── Validation Errors ────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}
