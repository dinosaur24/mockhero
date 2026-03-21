/**
 * Tier 1 field generators — the "holy shit, they thought of everything" types.
 *
 * These are the 12 field types that separate MockHero from every competitor:
 * - password_hash: bcrypt-format hashes for direct DB seeding
 * - embedding_vector: float vectors for pgvector/Pinecone testing
 * - date_of_birth: realistic DOBs with age distribution
 * - gender: configurable modern gender options
 * - date_range: two correlated, logically ordered dates
 * - sku: product SKU codes
 * - tracking_number: carrier-specific shipping numbers
 * - credit_card_number: Luhn-valid fake card numbers
 * - timezone: IANA timezone strings
 * - markdown: realistic formatted content
 * - xss_string: XSS payloads for security testing
 * - sql_injection_string: SQL injection payloads for security testing
 */

import type { FieldGenerator } from "../types";

// ── IDENTITY ─────────────────────────────────────────────

/**
 * Gender with configurable values.
 * Default: ["male", "female", "non-binary", "prefer_not_to_say"]
 * Params: values (string[]), weights (number[])
 */
export const genderGenerator: FieldGenerator = (params, ctx) => {
  const values = (params.values as string[]) ?? [
    "male", "female", "non-binary", "prefer_not_to_say",
  ];
  // If custom values but no custom weights, distribute evenly
  const defaultWeights = values.length === 4
    ? [0.45, 0.45, 0.07, 0.03]
    : values.map(() => 1 / values.length);
  const weights = (params.weights as number[]) ?? defaultWeights;

  return ctx.prng.weightedPick(values, weights);
};

/**
 * Date of birth with realistic age distribution.
 * Params: min_age (default 18), max_age (default 80)
 * Returns ISO date string.
 */
export const dateOfBirthGenerator: FieldGenerator = (params, ctx) => {
  const minAge = (params.min_age as number) ?? 18;
  const maxAge = (params.max_age as number) ?? 80;

  const age = ctx.prng.nextInt(minAge, maxAge);
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = ctx.prng.nextInt(1, 12);
  const maxDay = new Date(year, month, 0).getDate(); // days in month
  const day = ctx.prng.nextInt(1, maxDay);

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// ── LOCATION ─────────────────────────────────────────────

/**
 * IANA timezone string.
 * When locale is set, picks from timezones common to that locale's region.
 */
const TIMEZONES_BY_REGION: Record<string, string[]> = {
  en: [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "America/Anchorage", "Pacific/Honolulu", "Europe/London",
    "Australia/Sydney", "America/Toronto",
  ],
  de: [
    "Europe/Berlin", "Europe/Vienna", "Europe/Zurich",
  ],
  fr: [
    "Europe/Paris", "Europe/Brussels", "America/Montreal", "Indian/Reunion",
  ],
  es: [
    "Europe/Madrid", "America/Mexico_City", "America/Argentina/Buenos_Aires",
    "America/Bogota", "America/Santiago", "America/Lima",
  ],
  hr: [
    "Europe/Zagreb", "Europe/Belgrade", "Europe/Sarajevo", "Europe/Ljubljana",
  ],
};

const ALL_TIMEZONES = [
  ...new Set(Object.values(TIMEZONES_BY_REGION).flat()),
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Seoul", "Asia/Kolkata", "Asia/Singapore",
  "Asia/Dubai", "Africa/Lagos", "Africa/Cairo", "America/Sao_Paulo",
];

export const timezoneGenerator: FieldGenerator = (_params, ctx) => {
  const regional = TIMEZONES_BY_REGION[ctx.locale];
  if (regional) {
    return ctx.prng.pick(regional);
  }
  return ctx.prng.pick(ALL_TIMEZONES);
};

// ── BUSINESS ─────────────────────────────────────────────

/**
 * Product SKU with configurable prefix pattern.
 * Params: prefix (string, default auto-generated from category)
 * Format: PREFIX-XXXX-NNN
 */
const SKU_PREFIXES = [
  "BLK", "WHT", "RED", "BLU", "GRN", "SLV", "GLD",
  "SM", "MD", "LG", "XL", "XXL",
  "ELC", "CLO", "FUR", "SPT", "BKS", "TOY", "HOM",
];

export const skuGenerator: FieldGenerator = (params, ctx) => {
  const prefix = (params.prefix as string) ?? ctx.prng.pick(SKU_PREFIXES);
  const category = ctx.prng.pick(["SHOE", "SHRT", "PANT", "ACCS", "ELEC", "HOME", "FOOD", "BOOK", "TECH", "SPRT"]);
  const size = ctx.prng.nextInt(10, 99);
  const seq = ctx.prng.nextInt(100, 999);

  return `${prefix}-${category}-${size}-${seq}`;
};

/**
 * Luhn-valid credit card number.
 * Params: network ("visa" | "mastercard" | "amex", default random)
 *
 * Generates structurally valid card numbers that pass Luhn check
 * but are guaranteed to not be real card numbers.
 */
const CARD_PREFIXES: Record<string, { prefix: string; length: number }[]> = {
  visa: [{ prefix: "4", length: 16 }],
  mastercard: [
    { prefix: "51", length: 16 },
    { prefix: "52", length: 16 },
    { prefix: "53", length: 16 },
    { prefix: "54", length: 16 },
    { prefix: "55", length: 16 },
  ],
  amex: [
    { prefix: "34", length: 15 },
    { prefix: "37", length: 15 },
  ],
};

function luhnCheckDigit(partial: string): string {
  const digits = partial.split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

export const creditCardNumberGenerator: FieldGenerator = (params, ctx) => {
  const networks = Object.keys(CARD_PREFIXES);
  const network = (params.network as string) ?? ctx.prng.pick(networks);
  const configs = CARD_PREFIXES[network] ?? CARD_PREFIXES.visa;
  const config = ctx.prng.pick(configs);

  // Generate digits: prefix + random middle + Luhn check digit
  let number = config.prefix;
  const middleLength = config.length - config.prefix.length - 1; // -1 for check digit
  for (let i = 0; i < middleLength; i++) {
    number += String(ctx.prng.nextInt(0, 9));
  }
  number += luhnCheckDigit(number);

  return number;
};

/**
 * Shipping tracking number by carrier.
 * Params: carrier ("ups" | "fedex" | "usps" | "dhl", default random)
 */
export const trackingNumberGenerator: FieldGenerator = (params, ctx) => {
  const carrier = (params.carrier as string) ?? ctx.prng.pick(["ups", "fedex", "usps", "dhl"]);

  switch (carrier) {
    case "ups": {
      // UPS: 1Z + 6 alphanumeric + 2 digits + 8 digits
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let tracking = "1Z";
      for (let i = 0; i < 6; i++) tracking += chars[ctx.prng.nextInt(0, chars.length - 1)];
      for (let i = 0; i < 10; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "fedex": {
      // FedEx: 12 or 15 digit number
      const len = ctx.prng.pick([12, 15]);
      let tracking = "";
      for (let i = 0; i < len; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "usps": {
      // USPS: 9400 + 18 digits (22 total)
      let tracking = "9400";
      for (let i = 0; i < 18; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "dhl": {
      // DHL: 10 digit number
      let tracking = "";
      for (let i = 0; i < 10; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    default:
      return `TRK${ctx.prng.nextInt(100000000, 999999999)}`;
  }
};

// ── TEMPORAL ─────────────────────────────────────────────

/**
 * Date range — two correlated dates where start < end.
 * Returns { start: string, end: string } in ISO date format.
 * Params: min_gap_days (default 1), max_gap_days (default 30),
 *         min_date, max_date (bounds for the start date)
 */
export const dateRangeGenerator: FieldGenerator = (params, ctx) => {
  const minGap = (params.min_gap_days as number) ?? 1;
  const maxGap = (params.max_gap_days as number) ?? 30;

  const minDate = params.min_date
    ? new Date(params.min_date as string)
    : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
  const maxDate = params.max_date
    ? new Date(params.max_date as string)
    : new Date();

  const range = maxDate.getTime() - minDate.getTime();
  const startMs = minDate.getTime() + ctx.prng.next() * range;
  const gapDays = ctx.prng.nextInt(minGap, maxGap);
  const endMs = startMs + gapDays * 24 * 60 * 60 * 1000;

  const start = new Date(startMs).toISOString().split("T")[0];
  const end = new Date(endMs).toISOString().split("T")[0];

  return { start, end };
};

// ── TECHNICAL ────────────────────────────────────────────

/**
 * Embedding vector — random float array for vector DB testing.
 * Params: dimensions (default 1536 — OpenAI ada-002 standard)
 *
 * This is the type no competitor offers. Critical for testing
 * pgvector, Pinecone, Weaviate, Qdrant, and any RAG pipeline.
 */
export const embeddingVectorGenerator: FieldGenerator = (params, ctx) => {
  const dimensions = (params.dimensions as number) ?? 1536;
  const vector: number[] = new Array(dimensions);

  for (let i = 0; i < dimensions; i++) {
    // Generate values in [-1, 1] range, typical for normalized embeddings
    vector[i] = Number((ctx.prng.next() * 2 - 1).toFixed(6));
  }

  return vector;
};

// ── CONTENT ──────────────────────────────────────────────

/**
 * Markdown content — realistic formatted text with headers, lists, code blocks.
 * Params: length ("short" | "medium" | "long", default "medium")
 */
const MD_HEADERS = [
  "Getting Started", "Installation", "Quick Start Guide", "Configuration",
  "API Reference", "Authentication", "Usage Examples", "Troubleshooting",
  "Performance Tips", "Best Practices", "Migration Guide", "FAQ",
  "Architecture Overview", "Data Models", "Deployment", "Testing",
];

const MD_LIST_ITEMS = [
  "Install the required dependencies",
  "Configure your environment variables",
  "Run the development server",
  "Set up your database connection",
  "Enable authentication",
  "Deploy to production",
  "Monitor performance metrics",
  "Update your configuration file",
  "Check the logs for errors",
  "Review the documentation for details",
];

const MD_CODE_SNIPPETS = [
  "```js\nconst data = await fetch('/api/data');\nconst json = await data.json();\nconsole.log(json);\n```",
  "```bash\nnpm install mockhero\nnpx mockhero generate --schema users.json\n```",
  "```typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n```",
  "```python\nimport requests\nresponse = requests.get('https://api.example.com/users')\nprint(response.json())\n```",
  "```sql\nSELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.name;\n```",
];

const MD_PARAGRAPHS = [
  "This guide walks you through the basic setup process. Follow each step carefully to ensure everything is configured correctly.",
  "The API supports both JSON and form-encoded request bodies. All responses are returned in JSON format with appropriate HTTP status codes.",
  "Make sure to store your API keys securely and never commit them to version control. Use environment variables for all sensitive configuration.",
  "Performance can be improved by enabling caching and using batch operations where possible. See the optimization guide for more details.",
  "For production deployments, we recommend using a managed database service and enabling automatic backups. Contact support if you need assistance.",
];

export const markdownGenerator: FieldGenerator = (params, ctx) => {
  const length = (params.length as string) ?? "medium";

  const header = ctx.prng.pick(MD_HEADERS);
  const para = ctx.prng.pick(MD_PARAGRAPHS);

  if (length === "short") {
    return `## ${header}\n\n${para}`;
  }

  const listCount = length === "long" ? 5 : 3;
  const items = ctx.prng.shuffle([...MD_LIST_ITEMS]).slice(0, listCount);
  const listMd = items.map((item) => `- ${item}`).join("\n");
  const code = ctx.prng.pick(MD_CODE_SNIPPETS);

  let md = `## ${header}\n\n${para}\n\n### Steps\n\n${listMd}\n\n### Example\n\n${code}`;

  if (length === "long") {
    const para2 = ctx.prng.pick(MD_PARAGRAPHS.filter((p) => p !== para));
    const header2 = ctx.prng.pick(MD_HEADERS.filter((h) => h !== header));
    md += `\n\n## ${header2}\n\n${para2}\n\n> **Note:** Always test in a staging environment before deploying to production.`;
  }

  return md;
};

// ── SECURITY & TESTING ───────────────────────────────────

/**
 * Password hash — bcrypt-format hash for direct DB seeding.
 *
 * Generates a structurally valid bcrypt hash string ($2b$10$ + 53 chars).
 * The hash LOOKS like a real bcrypt hash (correct format, correct length)
 * but is deterministically generated from the PRNG — no actual hashing needed.
 *
 * Params: rounds (default 10), algorithm ("bcrypt" | "argon2", default "bcrypt")
 *
 * This is the type every dev needs and nobody offers.
 * Seed user tables directly without running bcrypt at insert time.
 */
const BCRYPT_CHARS = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const passwordHashGenerator: FieldGenerator = (params, ctx) => {
  const rounds = (params.rounds as number) ?? 10;
  const algorithm = (params.algorithm as string) ?? "bcrypt";

  if (algorithm === "argon2") {
    // Argon2id format: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
    const saltLen = 22;
    const hashLen = 43;
    let salt = "";
    let hash = "";
    const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < saltLen; i++) salt += b64[ctx.prng.nextInt(0, 63)];
    for (let i = 0; i < hashLen; i++) hash += b64[ctx.prng.nextInt(0, 63)];
    return `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`;
  }

  // Bcrypt format: $2b$XX$<22-char salt><31-char hash>
  const paddedRounds = String(rounds).padStart(2, "0");
  let encoded = "";
  // 22 chars salt + 31 chars hash = 53 chars
  for (let i = 0; i < 53; i++) {
    encoded += BCRYPT_CHARS[ctx.prng.nextInt(0, BCRYPT_CHARS.length - 1)];
  }

  return `$2b$${paddedRounds}$${encoded}`;
};

/**
 * XSS payloads for security testing.
 * The kind of data devs SHOULD test against but never do.
 */
const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert("xss")>',
  '"><script>alert(document.cookie)</script>',
  "javascript:alert('xss')",
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert("xss")>',
  '<input onfocus=alert(1) autofocus>',
  "'-alert(1)-'",
  '<a href="javascript:alert(1)">click</a>',
  '<div style="background:url(javascript:alert(1))">',
  "{{constructor.constructor('return this')().alert(1)}}",
  "${alert(1)}",
  '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">',
  '<details open ontoggle=alert(1)>',
];

export const xssStringGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(XSS_PAYLOADS);
};

/**
 * SQL injection payloads for security testing.
 * Test your parameterized queries and input validation.
 */
const SQL_INJECTION_PAYLOADS = [
  "'; DROP TABLE users; --",
  "1 OR 1=1",
  "' OR '1'='1",
  "'; SELECT * FROM information_schema.tables; --",
  "1; UPDATE users SET role='admin' WHERE id=1; --",
  "' UNION SELECT username, password FROM users --",
  "admin'--",
  "1' AND (SELECT COUNT(*) FROM users) > 0 --",
  "'; EXEC xp_cmdshell('dir'); --",
  "' OR EXISTS(SELECT 1 FROM users WHERE username='admin') --",
  "1; WAITFOR DELAY '0:0:5'; --",
  "' AND 1=CONVERT(int, (SELECT TOP 1 table_name FROM information_schema.tables)) --",
  "')) OR 1=1--",
  "' UNION ALL SELECT NULL,NULL,NULL--",
  "1' ORDER BY 100--",
];

export const sqlInjectionStringGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(SQL_INJECTION_PAYLOADS);
};
