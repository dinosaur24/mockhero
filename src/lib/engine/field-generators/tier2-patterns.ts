/**
 * Tier 2 field generators — pattern-based, format-driven, and simple logic types.
 *
 * These generators use templates, string patterns, numeric formats,
 * and lightweight algorithms (check digits, base-encoding, etc.)
 * to produce realistic structured data without external dependencies.
 */

import type { FieldGenerator } from "../types";

// ── Helpers ─────────────────────────────────────────────

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const HEX = "0123456789abcdef";
const BASE62 = UPPERCASE + LOWERCASE + DIGITS;
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE64URL = UPPERCASE + LOWERCASE + DIGITS + "_-";

function randomChars(ctx: { prng: { pick<T>(a: readonly T[]): T } }, charset: string, length: number): string {
  const chars = charset.split("");
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ctx.prng.pick(chars);
  }
  return result;
}

function padStart(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function base64urlEncode(str: string): string {
  // Simple base64url encoding for ASCII strings
  const bytes = Array.from(str).map((c) => c.charCodeAt(0));
  const TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += TABLE[(b0 >> 2) & 0x3f];
    result += TABLE[((b0 << 4) | (b1 >> 4)) & 0x3f];
    if (i + 1 < bytes.length) result += TABLE[((b1 << 2) | (b2 >> 6)) & 0x3f];
    if (i + 2 < bytes.length) result += TABLE[b2 & 0x3f];
  }
  return result;
}

// ── IDENTITY ────────────────────────────────────────────

const BIO_ROLES = [
  "Full-stack developer", "Product designer", "Data scientist", "DevOps engineer",
  "Marketing manager", "Startup founder", "Backend engineer", "Frontend developer",
  "UX researcher", "Technical writer", "Engineering manager", "Solutions architect",
  "QA engineer", "Mobile developer", "Security analyst", "Cloud architect",
  "Growth hacker", "CTO", "AI/ML engineer", "Platform engineer",
];

const BIO_LOCATIONS = [
  "based in Austin", "living in Berlin", "from Tokyo", "based in San Francisco",
  "living in London", "from New York", "based in Toronto", "living in Amsterdam",
  "from Sydney", "based in Singapore", "living in Stockholm", "from Lisbon",
  "based in Portland", "living in Dublin", "from Copenhagen",
];

const BIO_INTERESTS = [
  "Coffee enthusiast", "Open-source contributor", "Marathon runner", "Cat person",
  "Avid reader", "Podcast addict", "Weekend hiker", "Amateur chef",
  "Dog lover", "Board game nerd", "Yoga practitioner", "Photography hobbyist",
  "Mechanical keyboard collector", "Craft beer aficionado", "Rock climber",
  "Home barista", "Vinyl record collector", "Trail runner", "Chess player",
  "Piano player",
];

/**
 * 1-3 sentence biography built from role + location + interest templates.
 */
export const bioGenerator: FieldGenerator = (params, ctx) => {
  const role = ctx.prng.pick(BIO_ROLES);
  const location = ctx.prng.pick(BIO_LOCATIONS);
  const interest1 = ctx.prng.pick(BIO_INTERESTS);

  const sentences = ctx.prng.nextInt(1, 3);
  if (sentences === 1) {
    return `${role} ${location}.`;
  }
  if (sentences === 2) {
    return `${role} ${location}. ${interest1}.`;
  }
  // 3 sentences — guard against infinite loop if pool has < 2 unique entries
  let interest2 = ctx.prng.pick(BIO_INTERESTS);
  let attempts = 0;
  while (interest2 === interest1 && attempts < 10) {
    interest2 = ctx.prng.pick(BIO_INTERESTS);
    attempts++;
  }
  return `${role} ${location}. ${interest1} and ${interest2.toLowerCase()}. Always learning something new.`;
};

/**
 * US Social Security Number: XXX-XX-XXXX.
 * Area number 100-899 excluding 666.
 */
export const ssnGenerator: FieldGenerator = (_params, ctx) => {
  let area = ctx.prng.nextInt(100, 899);
  if (area === 666) area = 667;
  const group = ctx.prng.nextInt(1, 99);
  const serial = ctx.prng.nextInt(1, 9999);
  return `${padStart(area, 3)}-${padStart(group, 2)}-${padStart(serial, 4)}`;
};

/**
 * Passport number. Default US format: 1 uppercase letter + 8 digits.
 */
export const passportNumberGenerator: FieldGenerator = (params, ctx) => {
  const letter = ctx.prng.pick(UPPERCASE.split(""));
  let digits = "";
  for (let i = 0; i < 8; i++) {
    digits += ctx.prng.nextInt(0, 9);
  }
  return `${letter}${digits}`;
};

/**
 * E.164 format phone number.
 * Country codes: US=1 (10 digits), GB=44 (10 digits), DE=49 (10-11 digits), FR=33 (9 digits).
 */
export const phoneE164Generator: FieldGenerator = (params, ctx) => {
  const localeMap: Record<string, { code: string; length: number }> = {
    en: { code: "1", length: 10 },
    de: { code: "49", length: ctx.prng.nextInt(10, 11) },
    fr: { code: "33", length: 9 },
    es: { code: "34", length: 9 },
    hr: { code: "385", length: 9 },
  };

  const country = (params.country as string) ?? undefined;
  let config: { code: string; length: number };

  if (country) {
    const countryMap: Record<string, { code: string; length: number }> = {
      US: { code: "1", length: 10 },
      GB: { code: "44", length: 10 },
      DE: { code: "49", length: ctx.prng.nextInt(10, 11) },
      FR: { code: "33", length: 9 },
    };
    config = countryMap[country] ?? { code: "1", length: 10 };
  } else {
    config = localeMap[ctx.locale] ?? { code: "1", length: 10 };
  }

  let subscriber = "";
  for (let i = 0; i < config.length; i++) {
    // Avoid leading zero on subscriber number
    if (i === 0) {
      subscriber += ctx.prng.nextInt(1, 9);
    } else {
      subscriber += ctx.prng.nextInt(0, 9);
    }
  }

  return `+${config.code}${subscriber}`;
};

// ── LOCATION ────────────────────────────────────────────

const STREET_NAMES = [
  "Main Street", "Oak Avenue", "Elm Drive", "Park Road", "Cedar Lane",
  "Maple Court", "Pine Street", "Washington Boulevard", "Highland Avenue",
  "Lake Drive", "River Road", "Sunset Boulevard", "Broadway", "Market Street",
  "Church Street", "Mill Road", "King Street", "Queen Street", "Victoria Road",
  "Station Road", "High Street", "Bridge Street", "Green Lane", "Forest Avenue",
  "Spring Street", "Hill Road", "Valley Drive", "Meadow Lane", "Orchard Road",
  "Garden Way", "Willow Street", "Cherry Lane",
];

/**
 * Street address: "{number} {streetName}".
 */
export const streetAddressGenerator: FieldGenerator = (_params, ctx) => {
  const number = ctx.prng.nextInt(1, 9999);
  const street = ctx.prng.pick(STREET_NAMES);
  return `${number} ${street}`;
};

/**
 * Secondary address line: "Apt 42", "Suite 200", "Unit B", etc.
 */
export const addressLine2Generator: FieldGenerator = (_params, ctx) => {
  const letters = UPPERCASE.split("");
  const patterns = [
    () => `Apt ${ctx.prng.nextInt(1, 999)}`,
    () => `Suite ${ctx.prng.nextInt(1, 999)}`,
    () => `Unit ${ctx.prng.pick(letters)}`,
    () => `Floor ${ctx.prng.nextInt(1, 99)}`,
    () => `# ${ctx.prng.nextInt(1, 999)}`,
    () => `Building ${ctx.prng.pick(letters)}`,
  ];
  return ctx.prng.pick(patterns)();
};

const LOCALE_CODES = [
  "en-US", "en-GB", "en-AU", "de-DE", "de-AT", "fr-FR", "fr-CA",
  "es-ES", "es-MX", "it-IT", "pt-BR", "pt-PT", "nl-NL", "ja-JP",
  "ko-KR", "zh-CN", "zh-TW", "pl-PL", "hr-HR", "sv-SE", "nb-NO",
  "da-DK", "fi-FI", "ru-RU", "tr-TR", "ar-SA", "hi-IN", "th-TH",
];

/**
 * BCP-47 locale code.
 */
export const localeCodeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(LOCALE_CODES);
};

// ── FINANCIAL ───────────────────────────────────────────

/**
 * Credit card expiry in MM/YY format. Always in the future.
 */
export const creditCardExpiryGenerator: FieldGenerator = (_params, ctx) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const year = ctx.prng.nextInt(currentYear + 1, currentYear + 5);
  const month = ctx.prng.nextInt(1, 12);
  return `${padStart(month, 2)}/${padStart(year % 100, 2)}`;
};

/**
 * Credit card CVV. 3 digits by default, 4 for Amex.
 * Params: length (3 or 4)
 */
export const creditCardCvvGenerator: FieldGenerator = (params, ctx) => {
  const length = (params.length as number) ?? 3;
  const max = 10 ** length - 1;
  const min = 10 ** (length - 1);
  return padStart(ctx.prng.nextInt(min, max), length);
};

/**
 * Invoice number: "{prefix}-{year}-{seq}".
 * Params: prefix (default "INV")
 */
export const invoiceNumberGenerator: FieldGenerator = (params, ctx) => {
  const prefix = (params.prefix as string) ?? "INV";
  const year = new Date().getFullYear();
  const seq = ctx.prng.nextInt(1, 99999);
  return `${prefix}-${year}-${padStart(seq, 5)}`;
};

const SWIFT_COUNTRIES = ["US", "GB", "DE", "FR", "ES", "IT", "NL", "CH", "JP"];
const ALPHANUMERIC_UPPER = UPPERCASE + DIGITS;

/**
 * SWIFT/BIC code: 4 bank + 2 country + 2 location (+ optional 3 branch).
 */
export const swiftCodeGenerator: FieldGenerator = (_params, ctx) => {
  const bank = randomChars(ctx, UPPERCASE, 4);
  const country = ctx.prng.pick(SWIFT_COUNTRIES);
  const location = randomChars(ctx, ALPHANUMERIC_UPPER, 2);
  const hasBranch = ctx.prng.chance(0.3);
  const branch = hasBranch ? randomChars(ctx, ALPHANUMERIC_UPPER, 3) : "";
  return `${bank}${country}${location}${branch}`;
};

const TAX_ID_PREFIXES = [10, 12, 60, 67, 50, 53, 1, 2, 3, 4];

/**
 * US EIN format: XX-XXXXXXX.
 */
export const taxIdGenerator: FieldGenerator = (_params, ctx) => {
  const prefix = ctx.prng.pick(TAX_ID_PREFIXES);
  let suffix = "";
  for (let i = 0; i < 7; i++) {
    suffix += ctx.prng.nextInt(0, 9);
  }
  return `${padStart(prefix, 2)}-${suffix}`;
};

const STOCK_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM", "V", "JNJ",
  "WMT", "PG", "MA", "UNH", "HD", "DIS", "BAC", "NFLX", "ADBE", "CRM",
  "PYPL", "INTC", "CSCO", "PEP", "KO", "MRK", "ABT", "TMO", "ACN", "COST",
  "NKE", "LLY", "ORCL", "IBM", "GS", "MS", "UBER", "ABNB", "SQ", "SHOP",
];

/**
 * Stock ticker symbol.
 */
export const stockTickerGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(STOCK_TICKERS);
};

/**
 * Cryptocurrency wallet address.
 * Params: chain ("eth" default, "btc").
 * ETH: "0x" + 40 hex chars. BTC: "1" or "3" + 33 base58 chars.
 */
export const walletAddressGenerator: FieldGenerator = (params, ctx) => {
  const chain = (params.chain as string) ?? "eth";
  if (chain === "btc") {
    const prefix = ctx.prng.pick(["1", "3"]);
    return prefix + randomChars(ctx, BASE58, 33);
  }
  return "0x" + randomChars(ctx, HEX, 40);
};

// ── ECOMMERCE ───────────────────────────────────────────

const CATEGORY_L1 = [
  { name: "Electronics", subs: [
    { name: "Computers", items: ["Laptops", "Desktops", "Monitors", "Keyboards"] },
    { name: "Phones", items: ["Smartphones", "Cases", "Chargers", "Screen Protectors"] },
    { name: "Audio", items: ["Headphones", "Speakers", "Earbuds", "Microphones"] },
  ]},
  { name: "Clothing", subs: [
    { name: "Men", items: ["Shirts", "Pants", "Jackets", "Shoes"] },
    { name: "Women", items: ["Dresses", "Tops", "Skirts", "Boots"] },
    { name: "Kids", items: ["T-Shirts", "Shorts", "Sneakers", "Hoodies"] },
  ]},
  { name: "Home & Garden", subs: [
    { name: "Kitchen", items: ["Appliances", "Cookware", "Utensils", "Storage"] },
    { name: "Furniture", items: ["Chairs", "Tables", "Shelves", "Desks"] },
    { name: "Garden", items: ["Tools", "Plants", "Pots", "Lighting"] },
  ]},
  { name: "Sports & Outdoors", subs: [
    { name: "Fitness", items: ["Yoga Mats", "Dumbbells", "Resistance Bands", "Jump Ropes"] },
    { name: "Cycling", items: ["Bikes", "Helmets", "Locks", "Lights"] },
    { name: "Camping", items: ["Tents", "Sleeping Bags", "Backpacks", "Stoves"] },
  ]},
  { name: "Books", subs: [
    { name: "Fiction", items: ["Novels", "Short Stories", "Sci-Fi", "Fantasy"] },
    { name: "Non-Fiction", items: ["Biographies", "Self-Help", "Business", "History"] },
    { name: "Technical", items: ["Programming", "Data Science", "DevOps", "Design"] },
  ]},
];

/**
 * Hierarchical product category: "Electronics > Computers > Laptops".
 */
export const productCategoryGenerator: FieldGenerator = (_params, ctx) => {
  const l1 = ctx.prng.pick(CATEGORY_L1);
  const l2 = ctx.prng.pick(l1.subs);
  const l3 = ctx.prng.pick(l2.items);
  return `${l1.name} > ${l2.name} > ${l3}`;
};

const PRODUCT_ADJECTIVES = [
  "Premium", "Professional", "Lightweight", "Ultra-thin", "Heavy-duty",
  "Compact", "Ergonomic", "Wireless", "Portable", "Advanced",
  "Eco-friendly", "High-performance", "Smart", "Durable", "Sleek",
];

const PRODUCT_FEATURES = [
  "with noise cancellation", "with built-in LED display", "with Bluetooth 5.0",
  "with USB-C charging", "with water resistance", "with adjustable settings",
  "with touch controls", "with 12-hour battery life", "with fast charging",
  "with anti-slip grip", "with memory foam padding", "with quick-release mechanism",
];

const PRODUCT_BENEFITS = [
  "Perfect for everyday use.", "Ideal for professionals.",
  "Designed for maximum comfort.", "Built to last a lifetime.",
  "Great for travel and commuting.", "Suitable for all skill levels.",
  "A must-have for any workspace.", "Engineered for peak performance.",
  "Makes a wonderful gift.", "Trusted by thousands of customers.",
];

/**
 * 2-4 sentence product description from templates.
 */
export const productDescriptionGenerator: FieldGenerator = (_params, ctx) => {
  const adj = ctx.prng.pick(PRODUCT_ADJECTIVES);
  const feature = ctx.prng.pick(PRODUCT_FEATURES);
  const benefit = ctx.prng.pick(PRODUCT_BENEFITS);

  const sentenceCount = ctx.prng.nextInt(2, 4);
  const sentences: string[] = [];

  sentences.push(`${adj} quality ${feature}.`);
  sentences.push(benefit);

  if (sentenceCount >= 3) {
    const adj2 = ctx.prng.pick(PRODUCT_ADJECTIVES);
    sentences.push(`Features a ${adj2.toLowerCase()} design that stands out.`);
  }
  if (sentenceCount >= 4) {
    sentences.push("Backed by our satisfaction guarantee.");
  }

  return sentences.join(" ");
};

/**
 * EAN-13 barcode with valid check digit.
 */
export const barcodeEan13Generator: FieldGenerator = (_params, ctx) => {
  // Country prefixes
  const prefixes = [
    "000", "001", "002", "003", "004", "005", "006", "007", "008", "009",
    "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
    "400", "401", "410", "420", "430", "440",
    "300", "301", "302", "303",
  ];

  const prefix = ctx.prng.pick(prefixes);
  let code = prefix;

  // Fill remaining digits (12 total before check digit)
  while (code.length < 12) {
    code += ctx.prng.nextInt(0, 9);
  }

  // Calculate EAN-13 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return code + checkDigit;
};

/**
 * ISBN-13: "978-X-XXXX-XXXX-C" with valid check digit.
 */
export const isbnGenerator: FieldGenerator = (_params, ctx) => {
  const group = ctx.prng.nextInt(0, 9);
  const publisher = ctx.prng.nextInt(1000, 9999);
  const title = ctx.prng.nextInt(1000, 9999);

  const raw = `978${group}${padStart(publisher, 4)}${padStart(title, 4)}`;

  // ISBN-13 check digit uses same algorithm as EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(raw[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return `978-${group}-${padStart(publisher, 4)}-${padStart(title, 4)}-${checkDigit}`;
};

/**
 * Weight with value and unit.
 * Params: unit ("kg" default, "lb", "oz", "g"), min (0.1), max (100).
 */
export const weightGenerator: FieldGenerator = (params, ctx) => {
  const unit = (params.unit as string) ?? "kg";
  const min = (params.min as number) ?? 0.1;
  const max = (params.max as number) ?? 100;
  const value = ctx.prng.nextFloat(min, max, 2);
  return { value, unit };
};

// ── TEMPORAL ────────────────────────────────────────────

/**
 * Guaranteed future date.
 * Params: min_days (1), max_days (365).
 */
export const dateFutureGenerator: FieldGenerator = (params, ctx) => {
  const minDays = (params.min_days as number) ?? 1;
  const maxDays = (params.max_days as number) ?? 365;
  const days = ctx.prng.nextInt(minDays, maxDays);
  const date = new Date();
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = padStart(date.getMonth() + 1, 2);
  const d = padStart(date.getDate(), 2);
  return `${y}-${m}-${d}`;
};

/**
 * Guaranteed past date.
 * Params: min_days (1), max_days (365).
 */
export const datePastGenerator: FieldGenerator = (params, ctx) => {
  const minDays = (params.min_days as number) ?? 1;
  const maxDays = (params.max_days as number) ?? 365;
  const days = ctx.prng.nextInt(minDays, maxDays);
  const date = new Date();
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = padStart(date.getMonth() + 1, 2);
  const d = padStart(date.getDate(), 2);
  return `${y}-${m}-${d}`;
};

/**
 * ISO 8601 duration: "PT{H}H{M}M".
 * Params: max_hours (default 72).
 */
export const durationGenerator: FieldGenerator = (params, ctx) => {
  const maxHours = (params.max_hours as number) ?? 72;
  const hours = ctx.prng.nextInt(0, maxHours);
  const minutes = ctx.prng.nextInt(0, 59);
  return `PT${hours}H${minutes}M`;
};

const RELATIVE_TIME_TEMPLATES = [
  () => "just now",
  () => "yesterday",
  () => "last week",
  () => "tomorrow",
];

/**
 * Relative time string: "5 minutes ago", "in 3 hours", "just now", etc.
 */
export const relativeTimeGenerator: FieldGenerator = (_params, ctx) => {
  const dynamicTemplates = [
    (n: number) => `${n} seconds ago`,
    (n: number) => `${n} minutes ago`,
    (n: number) => `${n} hours ago`,
    (n: number) => `${n} days ago`,
    (n: number) => `${n} weeks ago`,
    (n: number) => `in ${n} minutes`,
    (n: number) => `in ${n} hours`,
    (n: number) => `in ${n} days`,
  ];

  // 40% chance of a static template, 60% dynamic
  if (ctx.prng.chance(0.4)) {
    return ctx.prng.pick(RELATIVE_TIME_TEMPLATES)();
  }

  const template = ctx.prng.pick(dynamicTemplates);
  const n = ctx.prng.nextInt(1, 59);
  return template(n);
};

// ── TECHNICAL ───────────────────────────────────────────

/**
 * Semantic version: "X.Y.Z". Optional prerelease suffix.
 * Params: prerelease (boolean)
 */
export const semverGenerator: FieldGenerator = (params, ctx) => {
  const major = ctx.prng.nextInt(0, 5);
  const minor = ctx.prng.nextInt(0, 30);
  const patch = ctx.prng.nextInt(0, 99);
  let version = `${major}.${minor}.${patch}`;

  if (params.prerelease) {
    const tag = ctx.prng.pick(["beta", "rc", "alpha"]);
    const n = ctx.prng.nextInt(1, 10);
    version += `-${tag}.${n}`;
  }

  return version;
};

/**
 * API key with prefix + 24 random base62 chars.
 * Params: prefix (default "sk_test_")
 */
export const apiKeyGenerator: FieldGenerator = (params, ctx) => {
  const prefix = (params.prefix as string) ?? "sk_test_";
  return prefix + randomChars(ctx, BASE62, 24);
};

/**
 * Git commit SHA. Full (40 hex chars) or short (7 chars).
 * Params: short (boolean, default false)
 */
export const commitShaGenerator: FieldGenerator = (params, ctx) => {
  const short = (params.short as boolean) ?? false;
  const length = short ? 7 : 40;
  return randomChars(ctx, HEX, length);
};

/**
 * MD5-style hash: 32 hex chars.
 */
export const hashMd5Generator: FieldGenerator = (_params, ctx) => {
  return randomChars(ctx, HEX, 32);
};

/**
 * SHA-256-style hash: 64 hex chars.
 */
export const hashSha256Generator: FieldGenerator = (_params, ctx) => {
  return randomChars(ctx, HEX, 64);
};

const COMMON_PORTS = [80, 443, 3000, 5432, 8080, 8443, 27017, 6379, 3306];

/**
 * Port number with range support and common-port weighting.
 * Params: range ("well_known", "registered", "dynamic")
 */
export const portNumberGenerator: FieldGenerator = (params, ctx) => {
  const range = (params.range as string) ?? "registered";

  // 20% chance of returning a common port
  if (ctx.prng.chance(0.2)) {
    return ctx.prng.pick(COMMON_PORTS);
  }

  switch (range) {
    case "well_known":
      return ctx.prng.nextInt(1, 1023);
    case "dynamic":
      return ctx.prng.nextInt(49152, 65535);
    case "registered":
    default:
      return ctx.prng.nextInt(1024, 49151);
  }
};

const HTTP_STATUS_CODES = [200, 201, 204, 301, 304, 400, 401, 403, 404, 500, 502, 503];
const HTTP_STATUS_WEIGHTS = [0.60, 0.08, 0.03, 0.02, 0.03, 0.06, 0.04, 0.03, 0.05, 0.04, 0.01, 0.01];

/**
 * HTTP status code with realistic distribution weights.
 */
export const httpStatusCodeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(HTTP_STATUS_CODES, HTTP_STATUS_WEIGHTS);
};

/**
 * Human-readable file size: "1.2 KB", "45.6 MB", "1.3 GB".
 * Params: min_bytes (1024), max_bytes (1073741824 = 1GB)
 */
export const fileSizeGenerator: FieldGenerator = (params, ctx) => {
  const minBytes = (params.min_bytes as number) ?? 1024;
  const maxBytes = (params.max_bytes as number) ?? 1073741824;
  const bytes = ctx.prng.nextInt(minBytes, maxBytes);

  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

const DOCKER_IMAGES = [
  "nginx", "postgres", "redis", "node", "python", "golang", "ubuntu", "alpine",
  "mysql", "mongo", "rabbitmq", "elasticsearch", "grafana", "prometheus",
  "traefik", "caddy", "vault", "consul",
];

const DOCKER_TAGS = [
  "latest", "alpine", "16", "18", "20", "3.2", "3.9", "1.25-alpine",
  "14-alpine", "7", "8", "slim", "bullseye", "bookworm",
];

/**
 * Docker image name with tag.
 */
export const dockerImageGenerator: FieldGenerator = (_params, ctx) => {
  const image = ctx.prng.pick(DOCKER_IMAGES);
  const tag = ctx.prng.pick(DOCKER_TAGS);
  return `${image}:${tag}`;
};

// ── SOCIAL ──────────────────────────────────────────────

/**
 * GitHub-style username derived from currentRecord or generated randomly.
 */
export const githubUsernameGenerator: FieldGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const firstName = ((rec.first_name as string) ?? "").toLowerCase();
  const lastName = ((rec.last_name as string) ?? "").toLowerCase();

  if (firstName && lastName) {
    const patterns = [
      () => `${firstName[0]}${lastName}`,
      () => `${firstName}-${lastName}`,
      () => `${firstName}${ctx.prng.nextInt(1, 99)}`,
      () => `${firstName[0]}-${lastName}${ctx.prng.nextInt(1, 99)}`,
      () => `${firstName}codes${ctx.prng.nextInt(1, 99)}`,
    ];
    return ctx.prng.pick(patterns)();
  }

  const prefixes = ["dev", "code", "hack", "build", "x"];
  const suffixes = ["er", "io", "dev", "hq", "labs"];
  const prefix = ctx.prng.pick(prefixes);
  const suffix = ctx.prng.pick(suffixes);
  const num = ctx.prng.nextInt(1, 999);
  return `${prefix}${suffix}${num}`;
};

/**
 * Twitter/X handle derived from currentRecord or generated randomly.
 */
export const twitterHandleGenerator: FieldGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const firstName = ((rec.first_name as string) ?? "").toLowerCase();
  const lastName = ((rec.last_name as string) ?? "").toLowerCase();

  if (firstName && lastName) {
    const patterns = [
      () => `@${firstName}_${lastName}`,
      () => `@${firstName}${lastName}`,
      () => `@${firstName}_codes`,
      () => `@dev${firstName}${ctx.prng.nextInt(1, 99)}`,
      () => `@${firstName[0]}${lastName}_tech`,
    ];
    return ctx.prng.pick(patterns)();
  }

  const words = ["dev", "tech", "code", "build", "ship", "data", "cloud"];
  const w1 = ctx.prng.pick(words);
  const w2 = ctx.prng.pick(words);
  const num = ctx.prng.nextInt(1, 999);
  return `@${w1}${w2}${num}`;
};

const MESSAGES = [
  "Hey, did you get a chance to look at the PR?",
  "Thanks for the quick review!",
  "Meeting pushed to 3pm, can you make it?",
  "The deployment went through successfully",
  "Can you take a look at this bug?",
  "Great work on the new feature!",
  "Let me know when you're free to sync",
  "Just pushed a fix for that issue",
  "Quick question about the API design",
  "The tests are passing now",
  "Do you have bandwidth to review this?",
  "I'll be out of office tomorrow",
  "Can we pair on this later?",
  "Found the root cause, fixing now",
  "Dashboard is looking great!",
  "Standup notes are in the doc",
  "PR approved, feel free to merge",
  "The client loved the demo!",
  "Working on it now, ETA 30 min",
  "Good catch, I'll update that",
];

/**
 * Chat-style message from realistic templates.
 */
export const messageGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(MESSAGES);
};

/**
 * App notification text with dynamic names/numbers.
 */
export const notificationTextGenerator: FieldGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const name = (rec.first_name as string) ?? ctx.prng.pick([
    "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn",
  ]);
  const num = ctx.prng.nextInt(1000, 99999);
  const amount = ctx.prng.nextFloat(5, 500, 2);
  const days = ctx.prng.nextInt(1, 30);
  const team = ctx.prng.pick([
    "Engineering", "Design", "Marketing", "Product", "Sales",
  ]);

  const templates = [
    `${name} commented on your post`,
    `${name} liked your photo`,
    `Your order #${num} has been shipped`,
    `${name} started following you`,
    `New message from ${name}`,
    `${name} mentioned you in a comment`,
    `Your subscription expires in ${days} days`,
    `Payment of $${amount.toFixed(2)} received`,
    `${name} invited you to ${team}`,
    `Build #${num} passed successfully`,
  ];

  return ctx.prng.pick(templates);
};

const HASHTAGS = [
  "#javascript", "#typescript", "#react", "#nextjs", "#webdev", "#coding",
  "#opensource", "#buildinpublic", "#indiehacker", "#startup", "#ai",
  "#machinelearning", "#devops", "#cloud", "#aws", "#design", "#ux",
  "#100daysofcode", "#programming", "#developer", "#tech", "#dataengineering",
  "#python", "#rust", "#golang", "#frontend", "#backend", "#fullstack",
  "#api", "#database", "#security", "#performance", "#agile", "#remote",
  "#hiring", "#career", "#tutorial", "#productivity", "#tools", "#saas",
];

/**
 * Hashtag.
 */
export const hashtagGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(HASHTAGS);
};

// ── HR & ORGANIZATION ───────────────────────────────────

/**
 * Employee ID: "{prefix}-{seq}".
 * Params: prefix (default "EMP")
 */
export const employeeIdGenerator: FieldGenerator = (params, ctx) => {
  const prefix = (params.prefix as string) ?? "EMP";
  const seq = ctx.prng.nextInt(1, 99999);
  return `${prefix}-${padStart(seq, 5)}`;
};

/**
 * Salary object: {amount, currency, period}.
 * Params: min (30000), max (200000), currency ("USD"), period ("annual")
 */
export const salaryGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 30000;
  const max = (params.max as number) ?? 200000;
  const currency = (params.currency as string) ?? "USD";
  const period = (params.period as string) ?? "annual";
  const amount = ctx.prng.nextInt(min, max);
  return { amount, currency, period };
};

const TEAM_NAMES = [
  "Platform Engineering", "Growth", "Customer Success", "Infrastructure",
  "Frontend", "Backend", "Mobile", "Data Science", "DevOps", "Security",
  "QA", "Design", "Product", "Marketing", "Sales", "Support", "Finance",
  "HR", "Legal", "Operations", "Analytics", "Research", "Content",
  "Partnerships", "Developer Experience",
];

/**
 * Team name.
 */
export const teamNameGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(TEAM_NAMES);
};

const DEGREES = [
  "Bachelor of Science in Computer Science",
  "Bachelor of Arts in Business Administration",
  "Master of Science in Data Science",
  "MBA",
  "Bachelor of Engineering",
  "Master of Arts in Design",
  "PhD in Computer Science",
  "Bachelor of Science in Mathematics",
  "Master of Public Health",
  "Juris Doctor",
  "Bachelor of Science in Biology",
  "Master of Engineering",
  "Associate of Science",
  "Bachelor of Fine Arts",
  "Doctor of Medicine",
];

/**
 * Academic degree.
 */
export const degreeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(DEGREES);
};

const UNIVERSITIES = [
  "MIT", "Stanford University", "Harvard University", "University of Cambridge",
  "University of Oxford", "ETH Zurich", "University of Tokyo",
  "National University of Singapore", "University of Toronto",
  "Imperial College London", "UC Berkeley", "Carnegie Mellon University",
  "Georgia Tech", "University of Michigan", "University of Washington",
  "TU Munich", "Sorbonne University", "University of Melbourne",
  "Seoul National University", "IIT Delhi", "University of S\u00e3o Paulo",
  "Tsinghua University", "KAIST", "University of Amsterdam",
  "KTH Royal Institute", "University of Edinburgh",
  "Technical University of Berlin", "University of Zagreb",
  "Politecnico di Milano", "University of Barcelona",
];

/**
 * University name.
 */
export const universityNameGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(UNIVERSITIES);
};

// ── AI / ML ─────────────────────────────────────────────

/**
 * Confidence score: float in [min, max] skewed toward higher values.
 * Params: min (0.5), max (0.99)
 */
export const confidenceScoreGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 0.5;
  const max = (params.max as number) ?? 0.99;
  // Use sqrt to skew toward higher values
  const raw = Math.sqrt(ctx.prng.next());
  const value = min + raw * (max - min);
  return Math.round(value * 10000) / 10000;
};

/**
 * Token count: {input, output, total}.
 * Params: max_input (4096), max_output (2048)
 */
export const tokenCountGenerator: FieldGenerator = (params, ctx) => {
  const maxInput = (params.max_input as number) ?? 4096;
  const maxOutput = (params.max_output as number) ?? 2048;

  // Input skewed toward lower values (use square of random)
  const inputRaw = ctx.prng.next() * ctx.prng.next();
  const input = Math.max(1, Math.floor(inputRaw * maxInput));

  // Output typically 20-80% of input
  const outputRatio = 0.2 + ctx.prng.next() * 0.6;
  const output = Math.max(1, Math.min(Math.floor(input * outputRatio), maxOutput));

  return { input, output, total: input + output };
};

// ── SECURITY & AUTH ─────────────────────────────────────

/**
 * License key: 5 groups of 5 uppercase alphanumeric chars separated by dashes.
 * Example: "A1B2C-D3E4F-G5H6I-J7K8L-M9N0P"
 */
export const licenseKeyGenerator: FieldGenerator = (_params, ctx) => {
  const groups: string[] = [];
  for (let i = 0; i < 5; i++) {
    groups.push(randomChars(ctx, ALPHANUMERIC_UPPER, 5));
  }
  return groups.join("-");
};

/**
 * TOTP secret: 16-char base32 string.
 */
export const totpSecretGenerator: FieldGenerator = (_params, ctx) => {
  return randomChars(ctx, BASE32, 16);
};

/**
 * Structurally valid JWT with 3 base64url-encoded segments.
 */
export const jwtTokenGenerator: FieldGenerator = (_params, ctx) => {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const sub = ctx.prng.nextInt(1000, 999999);
  const iat = now - ctx.prng.nextInt(0, 86400);
  const exp = iat + ctx.prng.nextInt(3600, 604800); // 1h to 7d from iat
  const payload = JSON.stringify({ sub: String(sub), iat, exp });

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const signature = randomChars(ctx, BASE64URL, 43);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};
