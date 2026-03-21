#!/usr/bin/env node

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// ../../src/lib/engine/prng.ts
function createPRNG(seed) {
  let state = seed ?? Math.floor(Math.random() * 2 ** 32);
  const originalSeed = state;
  function next() {
    state |= 0;
    state = state + 1831565813 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function nextInt(min, max) {
    return Math.floor(next() * (max - min + 1)) + min;
  }
  function nextFloat(min, max, precision = 2) {
    const value = next() * (max - min) + min;
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }
  function pick(array) {
    if (array.length === 0) throw new Error("Cannot pick from empty array");
    return array[Math.floor(next() * array.length)];
  }
  function weightedPick(items, weights) {
    if (items.length === 0) throw new Error("Cannot pick from empty array");
    if (items.length !== weights.length) {
      throw new Error("Items and weights must have same length");
    }
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function chance(probability) {
    return next() < probability;
  }
  return {
    next,
    nextInt,
    nextFloat,
    pick,
    weightedPick,
    shuffle,
    chance,
    seed: originalSeed
  };
}

// ../../src/lib/engine/types.ts
var SUPPORTED_LOCALES = [
  // Tier 1
  "en",
  // Tier 2
  "fr",
  "de",
  "es",
  "ru",
  "zh",
  // Tier 3
  "ar",
  "it",
  "ja",
  "hi",
  "pt",
  // Tier 4
  "id",
  "ko",
  "tr",
  "fa",
  "pl",
  "nl",
  "sv",
  "da",
  "nb",
  "th",
  // Tier 5
  "hr"
];
var SUPPORTED_FORMATS = ["json", "csv", "sql"];
var SUPPORTED_SQL_DIALECTS = ["postgres", "mysql", "sqlite"];
var FIELD_TYPES = [
  // Identity
  "first_name",
  "last_name",
  "full_name",
  "email",
  "username",
  "phone",
  "avatar_url",
  "gender",
  "date_of_birth",
  "name_prefix",
  "name_suffix",
  "nickname",
  "marital_status",
  "nationality",
  "blood_type",
  "pronoun_set",
  "bio",
  "ssn",
  "passport_number",
  "phone_e164",
  // Location
  "address",
  "city",
  "state_province",
  "country",
  "postal_code",
  "latitude",
  "longitude",
  "timezone",
  "country_code",
  "neighborhood",
  "street_address",
  "address_line_2",
  "locale_code",
  // Financial
  "company_name",
  "job_title",
  "department",
  "product_name",
  "price",
  "amount",
  "decimal",
  "currency",
  "iban",
  "vat_number",
  "sku",
  "credit_card_number",
  "tracking_number",
  "bank_name",
  "payment_method",
  "discount_code",
  "credit_card_expiry",
  "credit_card_cvv",
  "invoice_number",
  "swift_code",
  "tax_id",
  "stock_ticker",
  "wallet_address",
  // Ecommerce
  "shipping_carrier",
  "order_status",
  "product_category",
  "product_description",
  "barcode_ean13",
  "isbn",
  "weight",
  // Temporal
  "datetime",
  "date",
  "time",
  "timestamp",
  "age",
  "date_range",
  "date_future",
  "date_past",
  "duration",
  "relative_time",
  // Technical
  "uuid",
  "id",
  "ip_address",
  "mac_address",
  "url",
  "domain",
  "user_agent",
  "color_hex",
  "embedding_vector",
  "http_method",
  "mime_type",
  "file_extension",
  "programming_language",
  "database_engine",
  "semver",
  "api_key",
  "commit_sha",
  "hash_md5",
  "hash_sha256",
  "port_number",
  "http_status_code",
  "file_size",
  "docker_image",
  // Content
  "sentence",
  "paragraph",
  "title",
  "slug",
  "tag",
  "rating",
  "review",
  "markdown",
  "emoji",
  "hashtag",
  "message",
  "notification_text",
  // Social
  "social_platform",
  "reaction",
  "github_username",
  "twitter_handle",
  // HR & Organization
  "employment_status",
  "seniority_level",
  "skill",
  "leave_type",
  "employee_id",
  "salary",
  "team_name",
  "degree",
  "university_name",
  // AI / ML
  "label",
  "confidence_score",
  "token_count",
  // Healthcare
  "medical_specialty",
  "allergy",
  // Real Estate
  "property_type",
  // Media
  "music_genre",
  "color_rgb",
  "color_name",
  // Security & Auth
  "password_hash",
  "xss_string",
  "sql_injection_string",
  "role",
  "permission",
  "oauth_scope",
  "license_key",
  "totp_secret",
  "jwt_token",
  // Chaos Testing
  "unicode_string",
  "long_string",
  "boundary_integer",
  "empty_string",
  "error_value",
  "future_proof_date",
  // Logic
  "boolean",
  "enum",
  "ref",
  "nullable",
  "sequence",
  "integer",
  "constant",
  // Special
  "image_url",
  "file_path",
  "json",
  "array"
];

// ../../src/lib/engine/schema-parser.ts
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
function suggestFieldType(unknown) {
  let bestMatch;
  let bestDistance = Infinity;
  for (const known of FIELD_TYPES) {
    const d = levenshtein(unknown, known);
    if (d < bestDistance && d <= 3) {
      bestDistance = d;
      bestMatch = known;
    }
  }
  return bestMatch;
}
function parseSchema(input) {
  const errors = [];
  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "", message: "Request body must be a JSON object" }]
    };
  }
  const body = input;
  if (!Array.isArray(body.tables)) {
    return {
      success: false,
      errors: [{ field: "tables", message: '"tables" must be an array of table definitions' }]
    };
  }
  if (body.tables.length === 0) {
    errors.push({ field: "tables", message: "At least one table is required" });
    return { success: false, errors };
  }
  if (body.tables.length > 20) {
    errors.push({ field: "tables", message: "Maximum 20 tables per request" });
    return { success: false, errors };
  }
  const tableNames = /* @__PURE__ */ new Set();
  for (let ti = 0; ti < body.tables.length; ti++) {
    const table = body.tables[ti];
    const prefix = `tables[${ti}]`;
    if (typeof table.name !== "string" || table.name.trim() === "") {
      errors.push({ field: `${prefix}.name`, message: "Table name is required and must be a non-empty string" });
      continue;
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(table.name)) {
      errors.push({ field: `${prefix}.name`, message: `Table name "${table.name}" must start with a letter or underscore, contain only letters/numbers/underscores, and be at most 64 characters` });
    }
    if (tableNames.has(table.name)) {
      errors.push({ field: `${prefix}.name`, message: `Duplicate table name "${table.name}"` });
    }
    tableNames.add(table.name);
    if (typeof table.count !== "number" || !Number.isInteger(table.count) || table.count < 1) {
      errors.push({ field: `${prefix}.count`, message: "Count must be a positive integer (minimum 1)" });
    }
    if (!Array.isArray(table.fields)) {
      errors.push({ field: `${prefix}.fields`, message: "Fields must be an array" });
      continue;
    }
    if (table.fields.length === 0) {
      errors.push({ field: `${prefix}.fields`, message: "At least one field is required per table" });
    }
    if (table.fields.length > 200) {
      errors.push({ field: `${prefix}.fields`, message: "Maximum 200 fields per table" });
    }
    const fieldNames = /* @__PURE__ */ new Set();
    for (let fi = 0; fi < table.fields.length; fi++) {
      const field = table.fields[fi];
      const fieldPrefix = `${prefix}.fields[${fi}]`;
      if (typeof field.name !== "string" || field.name.trim() === "") {
        errors.push({ field: `${fieldPrefix}.name`, message: "Field name is required" });
        continue;
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(field.name)) {
        errors.push({ field: `${fieldPrefix}.name`, message: `Field name "${field.name}" must start with a letter or underscore, contain only letters/numbers/underscores, and be at most 64 characters` });
      }
      if (fieldNames.has(field.name)) {
        errors.push({ field: `${fieldPrefix}.name`, message: `Duplicate field name "${field.name}" in table "${table.name}"` });
      }
      fieldNames.add(field.name);
      if (typeof field.type !== "string") {
        errors.push({ field: `${fieldPrefix}.type`, message: "Field type is required" });
        continue;
      }
      if (field.type === "nullable") {
        errors.push({ field: `${fieldPrefix}.type`, message: 'Use "nullable": true on any field instead of type "nullable". Example: { "name": "bio", "type": "sentence", "nullable": true }', suggestion: 'Add "nullable": true to your field definition instead' });
        continue;
      }
      if (!FIELD_TYPES.includes(field.type)) {
        const suggestion = suggestFieldType(field.type);
        errors.push({
          field: `${fieldPrefix}.type`,
          message: `Unknown field type "${field.type}"`,
          suggestion: suggestion ? `Did you mean "${suggestion}"?` : void 0
        });
        continue;
      }
      const params = field.params ?? {};
      if (field.type === "enum") {
        if (!Array.isArray(params.values) || params.values.length === 0) {
          errors.push({ field: `${fieldPrefix}.params.values`, message: 'Enum type requires a non-empty "values" array' });
        }
        if (params.weights && Array.isArray(params.weights) && Array.isArray(params.values)) {
          if (params.weights.length !== params.values.length) {
            errors.push({ field: `${fieldPrefix}.params.weights`, message: "Weights array must match values array length" });
          }
        }
      }
      if (field.type === "ref") {
        if (typeof params.table !== "string") {
          errors.push({ field: `${fieldPrefix}.params.table`, message: 'Ref type requires a "table" parameter' });
        } else if (params.table === table.name) {
          errors.push({ field: `${fieldPrefix}.params.table`, message: `Table "${table.name}" has a self-referencing field "${field.name}". Self-references are not supported \u2014 use a separate join table instead.` });
        } else if (!body.tables.some((t) => t.name === params.table)) {
          errors.push({ field: `${fieldPrefix}.params.table`, message: `Ref references table "${params.table}" which is not defined in this request` });
        }
        if (typeof params.field !== "string") {
          errors.push({ field: `${fieldPrefix}.params.field`, message: 'Ref type requires a "field" parameter' });
        }
      }
      if (field.type === "datetime" || field.type === "date" || field.type === "date_range") {
        if (params.min && typeof params.min !== "string") {
          errors.push({ field: `${fieldPrefix}.params.min`, message: "Min date must be an ISO date string" });
        }
        if (params.max && typeof params.max !== "string") {
          errors.push({ field: `${fieldPrefix}.params.max`, message: "Max date must be an ISO date string" });
        }
        if (typeof params.min === "string" && typeof params.max === "string") {
          if (new Date(params.min).getTime() > new Date(params.max).getTime()) {
            errors.push({ field: `${fieldPrefix}.params.min`, message: "Min date must be before max date" });
          }
        }
        if (field.type === "date_range") {
          if (params.min_date && typeof params.min_date !== "string") {
            errors.push({ field: `${fieldPrefix}.params.min_date`, message: "min_date must be an ISO date string" });
          }
          if (params.max_date && typeof params.max_date !== "string") {
            errors.push({ field: `${fieldPrefix}.params.max_date`, message: "max_date must be an ISO date string" });
          }
          if (typeof params.min_date === "string" && typeof params.max_date === "string") {
            if (new Date(params.min_date).getTime() > new Date(params.max_date).getTime()) {
              errors.push({ field: `${fieldPrefix}.params.min_date`, message: "min_date must be before max_date" });
            }
          }
          if (typeof params.min_gap_days === "number" && params.min_gap_days < 0) {
            errors.push({ field: `${fieldPrefix}.params.min_gap_days`, message: "min_gap_days must be non-negative" });
          }
          if (typeof params.max_gap_days === "number" && typeof params.min_gap_days === "number" && params.max_gap_days < params.min_gap_days) {
            errors.push({ field: `${fieldPrefix}.params.max_gap_days`, message: "max_gap_days must be >= min_gap_days" });
          }
        }
      }
      if (field.type === "embedding_vector") {
        const dims = params.dimensions;
        if (dims !== void 0) {
          if (typeof dims !== "number" || !Number.isInteger(dims) || dims < 1) {
            errors.push({ field: `${fieldPrefix}.params.dimensions`, message: "Dimensions must be a positive integer" });
          } else if (dims > 4096) {
            errors.push({ field: `${fieldPrefix}.params.dimensions`, message: "Maximum 4096 dimensions for embedding vectors" });
          }
        }
      }
      if (field.type === "long_string") {
        const maxLen = Math.max(
          params.length ?? 0,
          params.max_length ?? 0,
          params.min_length ?? 0
        );
        if (maxLen > 1e6) {
          errors.push({ field: `${fieldPrefix}.params`, message: "Maximum long_string length is 1,000,000 characters" });
        }
      }
    }
  }
  if (body.locale !== void 0) {
    if (!SUPPORTED_LOCALES.includes(body.locale)) {
      errors.push({ field: "locale", message: `Unsupported locale "${body.locale}". Supported: ${SUPPORTED_LOCALES.join(", ")}` });
    }
  }
  if (body.format !== void 0) {
    if (!SUPPORTED_FORMATS.includes(body.format)) {
      errors.push({ field: "format", message: `Unsupported format "${body.format}". Supported: ${SUPPORTED_FORMATS.join(", ")}` });
    }
  }
  if (body.sql_dialect !== void 0) {
    if (!SUPPORTED_SQL_DIALECTS.includes(body.sql_dialect)) {
      errors.push({ field: "sql_dialect", message: `Unsupported SQL dialect "${body.sql_dialect}". Supported: ${SUPPORTED_SQL_DIALECTS.join(", ")}` });
    }
  }
  if (body.seed !== void 0) {
    if (typeof body.seed !== "number" || !Number.isFinite(body.seed)) {
      errors.push({ field: "seed", message: "Seed must be a finite number" });
    } else if (!Number.isInteger(body.seed) || body.seed < 0 || body.seed > 4294967295) {
      errors.push({ field: "seed", message: "Seed must be an integer between 0 and 4294967295 (32-bit unsigned)" });
    }
  }
  if (errors.length > 0) {
    return { success: false, errors };
  }
  const request = {
    tables: body.tables.map((t) => ({
      name: t.name,
      count: t.count,
      fields: t.fields.map((f) => ({
        name: f.name,
        type: f.type,
        params: f.params ?? {},
        nullable: f.nullable === true
      }))
    })),
    locale: body.locale ?? "en",
    format: body.format ?? "json",
    sql_dialect: body.sql_dialect ?? "postgres",
    seed: body.seed
  };
  return { success: true, data: request };
}

// ../../src/lib/engine/topological-sort.ts
function topologicalSort(tables) {
  const tableMap = /* @__PURE__ */ new Map();
  for (const table of tables) {
    tableMap.set(table.name, table);
  }
  const deps = /* @__PURE__ */ new Map();
  const inDeg = /* @__PURE__ */ new Map();
  for (const table of tables) {
    deps.set(table.name, /* @__PURE__ */ new Set());
    inDeg.set(table.name, 0);
  }
  for (const table of tables) {
    for (const field of table.fields) {
      if (field.type === "ref" && field.params?.table) {
        const parent = field.params.table;
        if (tableMap.has(parent) && parent !== table.name) {
          if (!deps.get(parent).has(table.name)) {
            deps.get(parent).add(table.name);
            inDeg.set(table.name, (inDeg.get(table.name) ?? 0) + 1);
          }
        }
      }
    }
  }
  const queue = [];
  for (const [name, degree] of inDeg) {
    if (degree === 0) queue.push(name);
  }
  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(tableMap.get(current));
    for (const dependent of deps.get(current) ?? []) {
      const newDeg = inDeg.get(dependent) - 1;
      inDeg.set(dependent, newDeg);
      if (newDeg === 0) queue.push(dependent);
    }
  }
  if (sorted.length !== tables.length) {
    const remaining = tables.filter((t) => !sorted.some((s) => s.name === t.name)).map((t) => t.name);
    const cycle = [];
    const visited = /* @__PURE__ */ new Set();
    let current = remaining[0];
    while (current && !visited.has(current)) {
      visited.add(current);
      cycle.push(current);
      const table = tableMap.get(current);
      let next;
      for (const field of table.fields) {
        if (field.type === "ref" && field.params?.table) {
          const ref = field.params.table;
          if (remaining.includes(ref)) {
            next = ref;
            break;
          }
        }
      }
      current = next;
    }
    if (current) cycle.push(current);
    return { success: false, cycle };
  }
  return { success: true, sorted };
}

// ../../src/lib/engine/field-generators/identity.ts
function toAscii(str, fallback) {
  const result = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/ø/g, "o").replace(/đ/g, "d").replace(/Đ/g, "d").replace(/æ/g, "ae").replace(/œ/g, "oe").toLowerCase().replace(/[^a-z]/g, "");
  return result || (fallback ?? "user");
}
var firstNameGenerator = (_params, ctx) => {
  const { firstNames } = getLocaleData(ctx);
  return ctx.prng.weightedPick(
    firstNames.map((n) => n.value),
    firstNames.map((n) => n.weight)
  );
};
var lastNameGenerator = (_params, ctx) => {
  const { lastNames } = getLocaleData(ctx);
  return ctx.prng.weightedPick(
    lastNames.map((n) => n.value),
    lastNames.map((n) => n.weight)
  );
};
var fullNameGenerator = (_params, ctx) => {
  const firstName = ctx.currentRecord["first_name"] ?? firstNameGenerator({}, ctx);
  const lastName = ctx.currentRecord["last_name"] ?? lastNameGenerator({}, ctx);
  return `${firstName} ${lastName}`;
};
var emailGenerator = (params, ctx) => {
  let firstName = ctx.currentRecord["first_name"] ?? "";
  let lastName = ctx.currentRecord["last_name"] ?? "";
  if (!firstName) firstName = firstNameGenerator({}, ctx);
  if (!lastName) lastName = lastNameGenerator({}, ctx);
  const fn = toAscii(firstName, `u${ctx.prng.nextInt(100, 999)}`);
  const ln = toAscii(lastName, `x${ctx.prng.nextInt(100, 999)}`);
  const patterns = [
    `${fn}.${ln}`,
    // maximilian.bergmann
    `${fn}${ln}`,
    // maximilianbergmann
    `${fn[0]}.${ln}`,
    // m.bergmann
    `${ln}.${fn[0]}`,
    // bergmann.m
    `${fn}.${ln}${ctx.prng.nextInt(1, 99)}`,
    // maximilian.bergmann42
    `${fn}${ctx.prng.nextInt(10, 99)}`
    // maximilian42
  ];
  const emailLocal = ctx.prng.pick(patterns);
  const domain = params.domain;
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
var usernameGenerator = (_params, ctx) => {
  let firstName = ctx.currentRecord["first_name"] ?? "";
  let lastName = ctx.currentRecord["last_name"] ?? "";
  if (!firstName) firstName = firstNameGenerator({}, ctx);
  if (!lastName) lastName = lastNameGenerator({}, ctx);
  const fn = toAscii(firstName, `u${ctx.prng.nextInt(100, 999)}`);
  const ln = toAscii(lastName, `x${ctx.prng.nextInt(100, 999)}`);
  const patterns = [
    `${fn[0]}${ln}`,
    // mbergmann
    `${fn}_${ln}`,
    // maximilian_bergmann
    `${fn}${ctx.prng.nextInt(10, 99)}`,
    // maximilian42
    `${fn[0]}${ln}${ctx.prng.nextInt(1, 99)}`,
    // mbergmann7
    `${ln}.${fn[0]}`
    // bergmann.m
  ];
  return ctx.prng.pick(patterns);
};
var phoneGenerator = (_params, ctx) => {
  const { phoneFormat } = getLocaleData(ctx);
  return phoneFormat.replace(/X/g, () => String(ctx.prng.nextInt(0, 9)));
};
var avatarUrlGenerator = (_params, ctx) => {
  const seed = ctx.prng.nextInt(1, 1e5);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};
var localeCache = {};
function getLocaleData(ctx) {
  const locale = ctx.locale;
  if (!localeCache[locale]) {
    throw new Error(`Locale data not loaded for "${locale}". Call loadLocaleData() first.`);
  }
  return localeCache[locale];
}
async function loadLocaleData(locale) {
  if (localeCache[locale]) return localeCache[locale];
  const loaders = {
    // Tier 1
    en: () => import("./en-NUDFKB57.js"),
    // Tier 2
    fr: () => import("./fr-OK3Z4JJO.js"),
    de: () => import("./de-WXPCWXDS.js"),
    es: () => import("./es-JZ67B6FK.js"),
    ru: () => import("./ru-ICT5DW74.js"),
    zh: () => import("./zh-HBJML44G.js"),
    // Tier 3
    ar: () => import("./ar-DSHJJS7I.js"),
    it: () => import("./it-J2PFKT4N.js"),
    ja: () => import("./ja-XSQK47FX.js"),
    hi: () => import("./hi-EPQTRWZI.js"),
    pt: () => import("./pt-AJSH7FCO.js"),
    // Tier 4
    id: () => import("./id-LMD375VF.js"),
    ko: () => import("./ko-ELDUM7FU.js"),
    tr: () => import("./tr-Z6SKYSKP.js"),
    fa: () => import("./fa-J7PEEPBI.js"),
    pl: () => import("./pl-PTKZXBJP.js"),
    nl: () => import("./nl-KPOXLN5T.js"),
    sv: () => import("./sv-XQCJ5FF2.js"),
    da: () => import("./da-ALL4N3EM.js"),
    nb: () => import("./nb-HW6A254Q.js"),
    th: () => import("./th-ULO5NG2Q.js"),
    hr: () => import("./hr-IR5ENNAZ.js")
  };
  const loader = loaders[locale];
  if (!loader) throw new Error(`No locale data for "${locale}"`);
  const mod = await loader();
  const data = mod[locale] ?? mod.default;
  localeCache[locale] = data;
  return data;
}
function getCachedLocaleData(locale) {
  if (!localeCache[locale]) {
    throw new Error(`Locale "${locale}" not pre-loaded. Call loadLocaleData() first.`);
  }
  return localeCache[locale];
}

// ../../src/lib/engine/field-generators/location.ts
var cityGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  return ctx.prng.pick(cities).city;
};
var countryGenerator = (params, ctx) => {
  if (params.code === true) {
    return getCachedLocaleData(ctx.locale).countryCode;
  }
  return getCachedLocaleData(ctx.locale).countryName;
};
var postalCodeGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  return ctx.prng.pick(cities).postal;
};
var stateProvinceGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  const city = ctx.prng.pick(cities);
  return city.state ?? "";
};
var addressGenerator = (_params, ctx) => {
  const localeData = getCachedLocaleData(ctx.locale);
  const city = ctx.prng.pick(localeData.cities);
  const street = ctx.prng.pick(localeData.streetNames);
  const pattern = ctx.prng.pick(localeData.streetPatterns);
  const number = ctx.prng.nextInt(1, 250);
  const address = pattern.replace("{number}", String(number)).replace("{street}", street);
  return `${address}, ${city.postal} ${city.city}`;
};
var latitudeGenerator = (params, ctx) => {
  const min = params.min ?? -90;
  const max = params.max ?? 90;
  return ctx.prng.nextFloat(min, max, 6);
};
var longitudeGenerator = (params, ctx) => {
  const min = params.min ?? -180;
  const max = params.max ?? 180;
  return ctx.prng.nextFloat(min, max, 6);
};

// ../../src/lib/engine/field-generators/business.ts
var COMPANY_PREFIXES = [
  "Global",
  "Digital",
  "Smart",
  "NextGen",
  "Apex",
  "Core",
  "Peak",
  "Prime",
  "Blue",
  "Nova",
  "Stellar",
  "Urban",
  "Green",
  "Bright",
  "Swift",
  "Elite",
  "Vertex",
  "Quantum",
  "Alpha",
  "Zen",
  "Neo",
  "Pulse",
  "Arc",
  "Vibe"
];
var COMPANY_SUFFIXES = [
  "Technologies",
  "Solutions",
  "Systems",
  "Industries",
  "Labs",
  "Digital",
  "Group",
  "Dynamics",
  "Analytics",
  "Ventures",
  "Software",
  "Media",
  "Networks",
  "Cloud",
  "AI",
  "Innovations",
  "Partners",
  "Consulting",
  "Services",
  "Works",
  "Studio",
  "Hub",
  "Co",
  "Inc"
];
var companyNameGenerator = (_params, ctx) => {
  return `${ctx.prng.pick(COMPANY_PREFIXES)} ${ctx.prng.pick(COMPANY_SUFFIXES)}`;
};
var JOB_TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Manager",
  "Senior Product Manager",
  "Product Designer",
  "UX Designer",
  "UI Designer",
  "UX Researcher",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Architect",
  "Engineering Manager",
  "VP of Engineering",
  "CTO",
  "Marketing Manager",
  "Content Strategist",
  "Growth Manager",
  "Sales Representative",
  "Account Executive",
  "Customer Success Manager",
  "Project Manager",
  "Scrum Master",
  "Agile Coach",
  "QA Engineer",
  "Security Engineer",
  "Solutions Architect",
  "Technical Writer",
  "Business Analyst",
  "Financial Analyst",
  "HR Manager",
  "Recruiter",
  "Office Manager",
  "CEO",
  "COO",
  "CFO",
  "CMO"
];
var jobTitleGenerator = (_params, ctx) => {
  return ctx.prng.pick(JOB_TITLES);
};
var DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Customer Success",
  "Operations",
  "Finance",
  "Human Resources",
  "Legal",
  "Research",
  "Data",
  "Security",
  "Infrastructure",
  "QA",
  "DevOps",
  "Support",
  "Executive"
];
var departmentGenerator = (_params, ctx) => {
  return ctx.prng.pick(DEPARTMENTS);
};
var PRODUCT_CATEGORIES = {
  electronics: [
    "Wireless Bluetooth Headphones",
    "USB-C Charging Hub",
    "Mechanical Keyboard",
    "4K Webcam",
    "Portable SSD 1TB",
    "Smart Watch",
    "Noise Cancelling Earbuds",
    "LED Desk Lamp",
    "Gaming Mouse",
    "Wireless Charger Pad",
    "Monitor Stand",
    "Laptop Sleeve",
    "Phone Stand",
    "Power Bank 20000mAh",
    "Smart Speaker"
  ],
  clothing: [
    "Cotton T-Shirt",
    "Slim Fit Jeans",
    "Merino Wool Sweater",
    "Casual Hoodie",
    "Running Shoes",
    "Leather Belt",
    "Wool Scarf",
    "Canvas Backpack",
    "Denim Jacket",
    "Linen Shirt",
    "Sneakers",
    "Baseball Cap"
  ],
  food: [
    "Organic Dark Chocolate 85%",
    "Artisan Sourdough Bread",
    "Cold Brew Coffee",
    "Extra Virgin Olive Oil",
    "Aged Parmesan Cheese",
    "Raw Honey",
    "Matcha Green Tea",
    "Protein Bar Box",
    "Dried Mango Slices",
    "Sparkling Water 12-Pack",
    "Granola Mix",
    "Almond Butter"
  ],
  home: [
    "Ceramic Coffee Mug",
    "Scented Candle",
    "Throw Pillow",
    "Wall Clock",
    "Plant Pot",
    "Kitchen Scale",
    "French Press",
    "Cutting Board",
    "Towel Set",
    "Doormat",
    "Storage Box",
    "Photo Frame"
  ],
  software: [
    "Annual Pro License",
    "Team Subscription",
    "Enterprise Plan",
    "Developer Tools Bundle",
    "Cloud Storage 2TB",
    "VPN Service 1 Year",
    "Password Manager Premium",
    "Design Tool License",
    "IDE Pro License"
  ]
};
var productNameGenerator = (params, ctx) => {
  const category = params.category;
  if (category && PRODUCT_CATEGORIES[category]) {
    return ctx.prng.pick(PRODUCT_CATEGORIES[category]);
  }
  const allProducts = Object.values(PRODUCT_CATEGORIES).flat();
  return ctx.prng.pick(allProducts);
};
var priceGenerator = (params, ctx) => {
  const min = params.min ?? 0.99;
  const max = params.max ?? 999.99;
  const precision = params.precision ?? 2;
  return ctx.prng.nextFloat(min, max, precision);
};
var amountGenerator = priceGenerator;
var decimalGenerator = (params, ctx) => {
  const min = params.min ?? 0;
  const max = params.max ?? 1e3;
  const precision = params.precision ?? 2;
  return ctx.prng.nextFloat(min, max, precision);
};
var CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "SEK", "NOK", "DKK"];
var currencyGenerator = (_params, ctx) => {
  return ctx.prng.pick(CURRENCIES);
};
var ratingGenerator = (params, ctx) => {
  const min = params.min ?? 1;
  const max = params.max ?? 5;
  const precision = params.precision ?? 1;
  const weights = [5, 8, 15, 30, 42];
  const rating = ctx.prng.weightedPick([1, 2, 3, 4, 5], weights);
  if (precision === 0) return Math.max(min, Math.min(max, rating));
  return ctx.prng.nextFloat(Math.max(min, rating - 0.5), Math.min(max, rating + 0.4), precision);
};

// ../../src/lib/engine/field-generators/temporal.ts
var DEFAULT_MIN_DATE = "2020-01-01";
var DEFAULT_MAX_DATE = "2025-12-31";
function parseDate(str) {
  return new Date(str).getTime();
}
var datetimeGenerator = (params, ctx) => {
  const min = parseDate(params.min ?? DEFAULT_MIN_DATE);
  const max = parseDate(params.max ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return new Date(ts).toISOString();
};
var dateGenerator = (params, ctx) => {
  const min = parseDate(params.min ?? DEFAULT_MIN_DATE);
  const max = parseDate(params.max ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return new Date(ts).toISOString().split("T")[0];
};
var timeGenerator = (_params, ctx) => {
  const hours = ctx.prng.nextInt(0, 23);
  const minutes = ctx.prng.nextInt(0, 59);
  const seconds = ctx.prng.nextInt(0, 59);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
var timestampGenerator = (params, ctx) => {
  const min = parseDate(params.min ?? DEFAULT_MIN_DATE);
  const max = parseDate(params.max ?? DEFAULT_MAX_DATE);
  const ts = min + ctx.prng.next() * (max - min);
  return Math.floor(ts / 1e3);
};
var ageGenerator = (params, ctx) => {
  const min = params.min ?? 18;
  const max = params.max ?? 80;
  return ctx.prng.nextInt(min, max);
};

// ../../src/lib/engine/field-generators/technical.ts
var uuidGenerator = (_params, ctx) => {
  const hex = (n) => Array.from(
    { length: n },
    () => ctx.prng.nextInt(0, 15).toString(16)
  ).join("");
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${["8", "9", "a", "b"][ctx.prng.nextInt(0, 3)]}${hex(3)}-${hex(12)}`;
};
var idGenerator = (params, ctx) => {
  const start = params.start ?? 1;
  const step = params.step ?? 1;
  return start + ctx.rowIndex * step;
};
var ipAddressGenerator = (params, ctx) => {
  const version = params.version ?? "v4";
  if (version === "v6") {
    const groups = Array.from(
      { length: 8 },
      () => ctx.prng.nextInt(0, 65535).toString(16).padStart(4, "0")
    );
    return groups.join(":");
  }
  const first = ctx.prng.nextInt(1, 223);
  return `${first}.${ctx.prng.nextInt(0, 255)}.${ctx.prng.nextInt(0, 255)}.${ctx.prng.nextInt(1, 254)}`;
};
var macAddressGenerator = (_params, ctx) => {
  const pairs = Array.from(
    { length: 6 },
    () => ctx.prng.nextInt(0, 255).toString(16).padStart(2, "0")
  );
  return pairs.join(":").toUpperCase();
};
var URL_DOMAINS = [
  "example.com",
  "test.io",
  "demo.dev",
  "sample.org",
  "myapp.co",
  "techblog.dev",
  "startup.io",
  "devtools.app",
  "api.services"
];
var URL_PATHS = [
  "/about",
  "/blog",
  "/pricing",
  "/contact",
  "/docs",
  "/api",
  "/products",
  "/features",
  "/team",
  "/careers",
  "/support",
  "/blog/getting-started",
  "/docs/api-reference",
  "/blog/release-notes"
];
var urlGenerator = (_params, ctx) => {
  const domain = ctx.prng.pick(URL_DOMAINS);
  const path = ctx.prng.pick(URL_PATHS);
  return `https://${domain}${path}`;
};
var domainGenerator = (_params, ctx) => {
  const prefixes = [
    "app",
    "dev",
    "api",
    "cloud",
    "data",
    "labs",
    "hub",
    "core",
    "tech",
    "web",
    "smart",
    "fast",
    "next",
    "pro",
    "go",
    "my"
  ];
  const tlds = [".com", ".io", ".dev", ".co", ".app", ".org", ".net"];
  return `${ctx.prng.pick(prefixes)}${ctx.prng.pick(tlds)}`;
};
var USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
];
var userAgentGenerator = (_params, ctx) => {
  return ctx.prng.pick(USER_AGENTS);
};
var colorHexGenerator = (_params, ctx) => {
  const hex = ctx.prng.nextInt(0, 16777215).toString(16).padStart(6, "0");
  return `#${hex}`;
};

// ../../src/lib/engine/field-generators/content.ts
var SUBJECTS = [
  "The team",
  "Our platform",
  "The new feature",
  "This approach",
  "The system",
  "Performance",
  "The dashboard",
  "User feedback",
  "The API",
  "Testing",
  "The database",
  "Our customers",
  "The deployment",
  "This update",
  "Security",
  "The workflow",
  "Analytics",
  "The integration",
  "Our infrastructure",
  "The service"
];
var VERBS = [
  "improved",
  "enabled",
  "streamlined",
  "reduced",
  "optimized",
  "simplified",
  "enhanced",
  "delivered",
  "resolved",
  "accelerated",
  "automated",
  "scaled",
  "validated",
  "transformed",
  "supported",
  "achieved",
  "generated",
  "configured",
  "monitored",
  "deployed"
];
var OBJECTS = [
  "response times by 40%",
  "the onboarding experience",
  "data processing speed",
  "developer productivity",
  "customer satisfaction scores",
  "deployment frequency",
  "error rates significantly",
  "resource utilization",
  "the authentication flow",
  "cross-team collaboration",
  "real-time monitoring",
  "automated testing coverage",
  "the migration process",
  "API reliability",
  "user engagement metrics",
  "code quality standards",
  "the review process",
  "load balancing efficiency",
  "database query performance",
  "the notification system"
];
var CONNECTORS = [
  "Additionally,",
  "Furthermore,",
  "As a result,",
  "Meanwhile,",
  "In particular,",
  "Notably,",
  "Consequently,",
  "Similarly,",
  "On the other hand,",
  "In contrast,",
  "Moreover,",
  "However,"
];
var sentenceGenerator = (params, ctx) => {
  const minWords = params.min_words ?? 8;
  const maxWords = params.max_words ?? 16;
  const subject = ctx.prng.pick(SUBJECTS);
  const verb = ctx.prng.pick(VERBS);
  const object = ctx.prng.pick(OBJECTS);
  let sentence = `${subject} ${verb} ${object}.`;
  while (sentence.split(" ").length < minWords) {
    sentence = `${ctx.prng.pick(CONNECTORS)} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
  }
  const words = sentence.split(" ");
  if (words.length > maxWords) {
    sentence = words.slice(0, maxWords).join(" ");
    if (!sentence.endsWith(".")) sentence += ".";
  }
  return sentence;
};
var paragraphGenerator = (params, ctx) => {
  const minSentences = params.min ?? 3;
  const maxSentences = params.max ?? 5;
  const count = ctx.prng.nextInt(minSentences, maxSentences);
  const sentences = [];
  for (let i = 0; i < count; i++) {
    sentences.push(sentenceGenerator({ min_words: 8, max_words: 16 }, ctx));
  }
  return sentences.join(" ");
};
var TITLE_ADJECTIVES = [
  "Complete",
  "Essential",
  "Advanced",
  "Modern",
  "Practical",
  "Comprehensive",
  "Ultimate",
  "Quick",
  "Effective",
  "Simple",
  "Proven",
  "Strategic",
  "Innovative",
  "Powerful",
  "Smart"
];
var TITLE_TOPICS = [
  "Guide to API Design",
  "Approach to Testing",
  "Database Optimization Tips",
  "Strategies for Scale",
  "Framework Comparison",
  "Security Best Practices",
  "Performance Monitoring",
  "Developer Workflow",
  "Deployment Pipeline",
  "Architecture Patterns",
  "Code Review Process",
  "Team Collaboration",
  "Data Migration Strategy",
  "Authentication Methods",
  "Error Handling"
];
var titleGenerator = (_params, ctx) => {
  const adj = ctx.prng.pick(TITLE_ADJECTIVES);
  const topic = ctx.prng.pick(TITLE_TOPICS);
  return `${adj} ${topic}`;
};
var slugGenerator = (_params, ctx) => {
  const title = titleGenerator({}, ctx);
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
};
var TAGS = [
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "api",
  "database",
  "testing",
  "devops",
  "security",
  "performance",
  "design",
  "ux",
  "mobile",
  "cloud",
  "ai",
  "machine-learning",
  "data",
  "analytics",
  "automation",
  "tutorial",
  "guide",
  "best-practices",
  "tips",
  "review"
];
var tagGenerator = (_params, ctx) => {
  return ctx.prng.pick(TAGS);
};
var REVIEW_TEMPLATES = [
  "Great product, exactly what I needed. {detail}",
  "Works well for our use case. {detail}",
  "Solid quality, would recommend. {detail}",
  "Does what it says. {detail} Will buy again.",
  "Exceeded my expectations. {detail}",
  "Good value for the price. {detail}",
  "Not bad, but could be better. {detail}",
  "Perfect for small teams. {detail}",
  "Easy to set up and use. {detail}",
  "Reliable and fast. {detail}"
];
var REVIEW_DETAILS = [
  "Setup took less than 5 minutes.",
  "The documentation is excellent.",
  "Customer support was very responsive.",
  "Been using it daily for 3 months now.",
  "Integrates perfectly with our existing stack.",
  "The API is clean and well-designed.",
  "Performance has been consistently good.",
  "Price is reasonable for what you get.",
  "Would love to see more customization options.",
  "The learning curve was minimal."
];
var reviewGenerator = (_params, ctx) => {
  const template = ctx.prng.pick(REVIEW_TEMPLATES);
  const detail = ctx.prng.pick(REVIEW_DETAILS);
  return template.replace("{detail}", detail);
};
var imageUrlGenerator = (params, ctx) => {
  const width = params.width ?? 640;
  const height = params.height ?? 480;
  const id = ctx.prng.nextInt(1, 1e3);
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
};
var FILE_EXTENSIONS = ["pdf", "docx", "xlsx", "csv", "png", "jpg", "zip", "txt", "json"];
var FILE_PREFIXES = [
  "report",
  "invoice",
  "summary",
  "data",
  "export",
  "backup",
  "document",
  "analysis",
  "presentation",
  "screenshot"
];
var filePathGenerator = (_params, ctx) => {
  const prefix = ctx.prng.pick(FILE_PREFIXES);
  const ext = ctx.prng.pick(FILE_EXTENSIONS);
  const year = ctx.prng.nextInt(2022, 2025);
  const quarter = ctx.prng.pick(["q1", "q2", "q3", "q4"]);
  return `/documents/${prefix}-${quarter}-${year}.${ext}`;
};
var jsonGenerator = (params, ctx) => {
  const keys = params.keys ?? ["key", "value", "active"];
  const obj = {};
  for (const key of keys) {
    if (key === "active" || key === "enabled") {
      obj[key] = ctx.prng.chance(0.7);
    } else if (key === "count" || key === "total") {
      obj[key] = ctx.prng.nextInt(0, 100);
    } else {
      obj[key] = `value_${ctx.prng.nextInt(1, 999)}`;
    }
  }
  return obj;
};
var arrayGenerator = (params, ctx) => {
  const min = params.min_length ?? 1;
  const max = params.max_length ?? 5;
  const length = ctx.prng.nextInt(min, max);
  const values = params.values ?? TAGS;
  return Array.from({ length }, () => ctx.prng.pick(values));
};

// ../../src/lib/engine/field-generators/logic.ts
var booleanGenerator = (params, ctx) => {
  const probability = params.probability ?? 0.5;
  return ctx.prng.chance(probability);
};
var enumGenerator = (params, ctx) => {
  const values = params.values;
  if (!values || values.length === 0) {
    throw new Error("Enum generator requires a non-empty 'values' array");
  }
  const weights = params.weights;
  if (weights && weights.length === values.length) {
    return ctx.prng.weightedPick(values, weights);
  }
  return ctx.prng.pick(values);
};
var integerGenerator = (params, ctx) => {
  const min = params.min ?? 0;
  const max = params.max ?? 1e3;
  return ctx.prng.nextInt(min, max);
};
var refGenerator = (params, ctx) => {
  const tableName = params.table;
  const fieldName = params.field;
  const distribution = params.distribution ?? "uniform";
  const parentRecords = ctx.tableData[tableName];
  if (!parentRecords || parentRecords.length === 0) {
    throw new Error(
      `Ref to "${tableName}.${fieldName}" failed: table "${tableName}" has no records. Ensure parent tables are generated before child tables.`
    );
  }
  const values = parentRecords.map((r) => r[fieldName]).filter((v) => v !== void 0);
  if (values.length === 0) {
    throw new Error(
      `Ref to "${tableName}.${fieldName}" failed: field "${fieldName}" not found in any "${tableName}" records. Check that the referenced field name is correct.`
    );
  }
  if (distribution === "power_law") {
    const alpha = params.alpha ?? 1;
    const weights = values.map((_, i) => 1 / Math.pow(i + 1, alpha));
    return ctx.prng.weightedPick(values, weights);
  }
  return ctx.prng.pick(values);
};
var sequenceGenerator = (params, ctx) => {
  const start = params.start ?? 1;
  const step = params.step ?? 1;
  const prefix = params.prefix ?? "";
  const suffix = params.suffix ?? "";
  const value = start + ctx.rowIndex * step;
  return `${prefix}${value}${suffix}`;
};
var constantGenerator = (params) => {
  return params.value ?? null;
};

// ../../src/lib/engine/field-generators/tier1.ts
var genderGenerator = (params, ctx) => {
  const values = params.values ?? [
    "male",
    "female",
    "non-binary",
    "prefer_not_to_say"
  ];
  const defaultWeights = values.length === 4 ? [0.45, 0.45, 0.07, 0.03] : values.map(() => 1 / values.length);
  const weights = params.weights ?? defaultWeights;
  return ctx.prng.weightedPick(values, weights);
};
var dateOfBirthGenerator = (params, ctx) => {
  const minAge = params.min_age ?? 18;
  const maxAge = params.max_age ?? 80;
  const age = ctx.prng.nextInt(minAge, maxAge);
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear() - age;
  const month = ctx.prng.nextInt(1, 12);
  const maxDay = new Date(year, month, 0).getDate();
  const day = ctx.prng.nextInt(1, maxDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};
var TIMEZONES_BY_REGION = {
  en: [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "Pacific/Honolulu",
    "Europe/London",
    "Australia/Sydney",
    "America/Toronto"
  ],
  de: [
    "Europe/Berlin",
    "Europe/Vienna",
    "Europe/Zurich"
  ],
  fr: [
    "Europe/Paris",
    "Europe/Brussels",
    "America/Montreal",
    "Indian/Reunion"
  ],
  es: [
    "Europe/Madrid",
    "America/Mexico_City",
    "America/Argentina/Buenos_Aires",
    "America/Bogota",
    "America/Santiago",
    "America/Lima"
  ],
  hr: [
    "Europe/Zagreb",
    "Europe/Belgrade",
    "Europe/Sarajevo",
    "Europe/Ljubljana"
  ]
};
var ALL_TIMEZONES = [
  ...new Set(Object.values(TIMEZONES_BY_REGION).flat()),
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Dubai",
  "Africa/Lagos",
  "Africa/Cairo",
  "America/Sao_Paulo"
];
var timezoneGenerator = (_params, ctx) => {
  const regional = TIMEZONES_BY_REGION[ctx.locale];
  if (regional) {
    return ctx.prng.pick(regional);
  }
  return ctx.prng.pick(ALL_TIMEZONES);
};
var SKU_PREFIXES = [
  "BLK",
  "WHT",
  "RED",
  "BLU",
  "GRN",
  "SLV",
  "GLD",
  "SM",
  "MD",
  "LG",
  "XL",
  "XXL",
  "ELC",
  "CLO",
  "FUR",
  "SPT",
  "BKS",
  "TOY",
  "HOM"
];
var skuGenerator = (params, ctx) => {
  const prefix = params.prefix ?? ctx.prng.pick(SKU_PREFIXES);
  const category = ctx.prng.pick(["SHOE", "SHRT", "PANT", "ACCS", "ELEC", "HOME", "FOOD", "BOOK", "TECH", "SPRT"]);
  const size = ctx.prng.nextInt(10, 99);
  const seq = ctx.prng.nextInt(100, 999);
  return `${prefix}-${category}-${size}-${seq}`;
};
var CARD_PREFIXES = {
  visa: [{ prefix: "4", length: 16 }],
  mastercard: [
    { prefix: "51", length: 16 },
    { prefix: "52", length: 16 },
    { prefix: "53", length: 16 },
    { prefix: "54", length: 16 },
    { prefix: "55", length: 16 }
  ],
  amex: [
    { prefix: "34", length: 15 },
    { prefix: "37", length: 15 }
  ]
};
function luhnCheckDigit(partial) {
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
  return String((10 - sum % 10) % 10);
}
var creditCardNumberGenerator = (params, ctx) => {
  const networks = Object.keys(CARD_PREFIXES);
  const network = params.network ?? ctx.prng.pick(networks);
  const configs = CARD_PREFIXES[network] ?? CARD_PREFIXES.visa;
  const config = ctx.prng.pick(configs);
  let number = config.prefix;
  const middleLength = config.length - config.prefix.length - 1;
  for (let i = 0; i < middleLength; i++) {
    number += String(ctx.prng.nextInt(0, 9));
  }
  number += luhnCheckDigit(number);
  return number;
};
var trackingNumberGenerator = (params, ctx) => {
  const carrier = params.carrier ?? ctx.prng.pick(["ups", "fedex", "usps", "dhl"]);
  switch (carrier) {
    case "ups": {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let tracking = "1Z";
      for (let i = 0; i < 6; i++) tracking += chars[ctx.prng.nextInt(0, chars.length - 1)];
      for (let i = 0; i < 10; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "fedex": {
      const len = ctx.prng.pick([12, 15]);
      let tracking = "";
      for (let i = 0; i < len; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "usps": {
      let tracking = "9400";
      for (let i = 0; i < 18; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    case "dhl": {
      let tracking = "";
      for (let i = 0; i < 10; i++) tracking += String(ctx.prng.nextInt(0, 9));
      return tracking;
    }
    default:
      return `TRK${ctx.prng.nextInt(1e8, 999999999)}`;
  }
};
var dateRangeGenerator = (params, ctx) => {
  const minGap = params.min_gap_days ?? 1;
  const maxGap = params.max_gap_days ?? 30;
  const minDate = params.min_date ? new Date(params.min_date) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1e3);
  const maxDate = params.max_date ? new Date(params.max_date) : /* @__PURE__ */ new Date();
  const range = maxDate.getTime() - minDate.getTime();
  const startMs = minDate.getTime() + ctx.prng.next() * range;
  const gapDays = ctx.prng.nextInt(minGap, maxGap);
  const endMs = startMs + gapDays * 24 * 60 * 60 * 1e3;
  const start = new Date(startMs).toISOString().split("T")[0];
  const end = new Date(endMs).toISOString().split("T")[0];
  return { start, end };
};
var embeddingVectorGenerator = (params, ctx) => {
  const dimensions = params.dimensions ?? 1536;
  const vector = new Array(dimensions);
  for (let i = 0; i < dimensions; i++) {
    vector[i] = Number((ctx.prng.next() * 2 - 1).toFixed(6));
  }
  return vector;
};
var MD_HEADERS = [
  "Getting Started",
  "Installation",
  "Quick Start Guide",
  "Configuration",
  "API Reference",
  "Authentication",
  "Usage Examples",
  "Troubleshooting",
  "Performance Tips",
  "Best Practices",
  "Migration Guide",
  "FAQ",
  "Architecture Overview",
  "Data Models",
  "Deployment",
  "Testing"
];
var MD_LIST_ITEMS = [
  "Install the required dependencies",
  "Configure your environment variables",
  "Run the development server",
  "Set up your database connection",
  "Enable authentication",
  "Deploy to production",
  "Monitor performance metrics",
  "Update your configuration file",
  "Check the logs for errors",
  "Review the documentation for details"
];
var MD_CODE_SNIPPETS = [
  "```js\nconst data = await fetch('/api/data');\nconst json = await data.json();\nconsole.log(json);\n```",
  "```bash\nnpm install mockhero\nnpx mockhero generate --schema users.json\n```",
  "```typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n```",
  "```python\nimport requests\nresponse = requests.get('https://api.example.com/users')\nprint(response.json())\n```",
  "```sql\nSELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.name;\n```"
];
var MD_PARAGRAPHS = [
  "This guide walks you through the basic setup process. Follow each step carefully to ensure everything is configured correctly.",
  "The API supports both JSON and form-encoded request bodies. All responses are returned in JSON format with appropriate HTTP status codes.",
  "Make sure to store your API keys securely and never commit them to version control. Use environment variables for all sensitive configuration.",
  "Performance can be improved by enabling caching and using batch operations where possible. See the optimization guide for more details.",
  "For production deployments, we recommend using a managed database service and enabling automatic backups. Contact support if you need assistance."
];
var markdownGenerator = (params, ctx) => {
  const length = params.length ?? "medium";
  const header = ctx.prng.pick(MD_HEADERS);
  const para = ctx.prng.pick(MD_PARAGRAPHS);
  if (length === "short") {
    return `## ${header}

${para}`;
  }
  const listCount = length === "long" ? 5 : 3;
  const items = ctx.prng.shuffle([...MD_LIST_ITEMS]).slice(0, listCount);
  const listMd = items.map((item) => `- ${item}`).join("\n");
  const code = ctx.prng.pick(MD_CODE_SNIPPETS);
  let md = `## ${header}

${para}

### Steps

${listMd}

### Example

${code}`;
  if (length === "long") {
    const para2 = ctx.prng.pick(MD_PARAGRAPHS.filter((p) => p !== para));
    const header2 = ctx.prng.pick(MD_HEADERS.filter((h) => h !== header));
    md += `

## ${header2}

${para2}

> **Note:** Always test in a staging environment before deploying to production.`;
  }
  return md;
};
var BCRYPT_CHARS = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var passwordHashGenerator = (params, ctx) => {
  const rounds = params.rounds ?? 10;
  const algorithm = params.algorithm ?? "bcrypt";
  if (algorithm === "argon2") {
    const saltLen = 22;
    const hashLen = 43;
    let salt = "";
    let hash = "";
    const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < saltLen; i++) salt += b64[ctx.prng.nextInt(0, 63)];
    for (let i = 0; i < hashLen; i++) hash += b64[ctx.prng.nextInt(0, 63)];
    return `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`;
  }
  const paddedRounds = String(rounds).padStart(2, "0");
  let encoded = "";
  for (let i = 0; i < 53; i++) {
    encoded += BCRYPT_CHARS[ctx.prng.nextInt(0, BCRYPT_CHARS.length - 1)];
  }
  return `$2b$${paddedRounds}$${encoded}`;
};
var XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  "<img src=x onerror=alert(1)>",
  '<svg onload=alert("xss")>',
  '"><script>alert(document.cookie)</script>',
  "javascript:alert('xss')",
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert("xss")>',
  "<input onfocus=alert(1) autofocus>",
  "'-alert(1)-'",
  '<a href="javascript:alert(1)">click</a>',
  '<div style="background:url(javascript:alert(1))">',
  "{{constructor.constructor('return this')().alert(1)}}",
  "${alert(1)}",
  '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">',
  "<details open ontoggle=alert(1)>"
];
var xssStringGenerator = (_params, ctx) => {
  return ctx.prng.pick(XSS_PAYLOADS);
};
var SQL_INJECTION_PAYLOADS = [
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
  "1' ORDER BY 100--"
];
var sqlInjectionStringGenerator = (_params, ctx) => {
  return ctx.prng.pick(SQL_INJECTION_PAYLOADS);
};

// ../../src/lib/engine/field-generators/tier2-enums.ts
var NAME_PREFIXES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
var NAME_PREFIX_WEIGHTS = [0.3, 0.25, 0.25, 0.12, 0.08];
var namePrefixGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(NAME_PREFIXES, NAME_PREFIX_WEIGHTS);
};
var NAME_SUFFIXES = ["Jr.", "Sr.", "II", "III", "PhD", "MD", "Esq."];
var NAME_SUFFIX_WEIGHTS = [0.3, 0.2, 0.15, 0.1, 0.1, 0.1, 0.05];
var nameSuffixGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(NAME_SUFFIXES, NAME_SUFFIX_WEIGHTS);
};
var NICKNAMES = [
  "Ace",
  "Buddy",
  "Chief",
  "Doc",
  "Flash",
  "Jazz",
  "Max",
  "Red",
  "Spike",
  "Tex",
  "Zippy",
  "Bear",
  "Blue",
  "Chip",
  "Duke",
  "Echo",
  "Frost",
  "Ghost",
  "Hawk",
  "Iron",
  "Jinx",
  "Kit",
  "Luna",
  "Neon",
  "Pixel",
  "Rocky",
  "Shadow",
  "Storm",
  "Turbo",
  "Viper"
];
var SHORT_FORM_SUFFIXES = ["ny", "y", "ie"];
var nicknameGenerator = (_params, ctx) => {
  const firstName = ctx.currentRecord.first_name;
  if (firstName && firstName.length >= 3 && ctx.prng.chance(0.4)) {
    const base = firstName.slice(0, ctx.prng.nextInt(3, Math.min(4, firstName.length)));
    const suffix = ctx.prng.pick(SHORT_FORM_SUFFIXES);
    return base + suffix;
  }
  return ctx.prng.pick(NICKNAMES);
};
var MARITAL_STATUSES = [
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
  "domestic_partnership"
];
var MARITAL_WEIGHTS = [0.35, 0.4, 0.1, 0.05, 0.05, 0.05];
var maritalStatusGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(MARITAL_STATUSES, MARITAL_WEIGHTS);
};
var NATIONALITIES = [
  "American",
  "British",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Japanese",
  "Chinese",
  "Korean",
  "Indian",
  "Brazilian",
  "Canadian",
  "Australian",
  "Mexican",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Croatian",
  "Russian",
  "Turkish",
  "Egyptian",
  "Nigerian",
  "South African",
  "Argentinian",
  "Colombian",
  "Thai",
  "Vietnamese"
];
var nationalityGenerator = (_params, ctx) => {
  return ctx.prng.pick(NATIONALITIES);
};
var BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
var BLOOD_TYPE_WEIGHTS = [0.374, 0.357, 0.085, 0.034, 0.066, 0.063, 0.015, 6e-3];
var bloodTypeGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(BLOOD_TYPES, BLOOD_TYPE_WEIGHTS);
};
var PRONOUN_SETS = ["he/him", "she/her", "they/them", "he/they", "she/they", "ze/hir"];
var PRONOUN_WEIGHTS = [0.42, 0.42, 0.1, 0.03, 0.02, 0.01];
var pronounSetGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(PRONOUN_SETS, PRONOUN_WEIGHTS);
};
var COUNTRY_CODES = [
  "US",
  "GB",
  "DE",
  "FR",
  "ES",
  "IT",
  "JP",
  "CN",
  "KR",
  "IN",
  "BR",
  "CA",
  "AU",
  "MX",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "HR",
  "RU",
  "TR",
  "EG",
  "NG",
  "ZA",
  "AR",
  "CO",
  "TH",
  "VN",
  "PT",
  "IE",
  "CH",
  "AT",
  "BE"
];
var countryCodeGenerator = (_params, ctx) => {
  return ctx.prng.pick(COUNTRY_CODES);
};
var NEIGHBORHOODS = [
  "SoHo",
  "Tribeca",
  "Williamsburg",
  "Silver Lake",
  "Capitol Hill",
  "Nob Hill",
  "Gaslamp Quarter",
  "Wicker Park",
  "Midtown",
  "Downtown",
  "Westside",
  "Eastside",
  "Old Town",
  "Riverside",
  "Lakeside",
  "Harbor District",
  "Arts District",
  "Financial District",
  "Tech Quarter",
  "University District",
  "Garden District",
  "Historic Quarter",
  "Market District",
  "Waterfront",
  "Le Marais",
  "Shibuya",
  "Kreuzberg",
  "Gracia",
  "Trastevere",
  "Jordaan",
  "Sodermalm",
  "Alfama",
  "Shimokitazawa",
  "Coyoacan",
  "Palermo Soho",
  "Fitzroy",
  "Shoreditch",
  "Prenzlauer Berg",
  "Barrio Gotico",
  "Bairro Alto"
];
var neighborhoodGenerator = (_params, ctx) => {
  return ctx.prng.pick(NEIGHBORHOODS);
};
var BANK_NAMES = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "Goldman Sachs",
  "Morgan Stanley",
  "HSBC",
  "Barclays",
  "Deutsche Bank",
  "BNP Paribas",
  "Credit Suisse",
  "UBS",
  "ING",
  "Revolut",
  "N26",
  "Wise",
  "Monzo",
  "Chime",
  "SoFi",
  "Ally Bank",
  "Capital One",
  "TD Bank",
  "US Bank",
  "PNC",
  "Santander"
];
var bankNameGenerator = (_params, ctx) => {
  return ctx.prng.pick(BANK_NAMES);
};
var PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "paypal",
  "apple_pay",
  "google_pay",
  "bank_transfer",
  "crypto",
  "cash",
  "invoice",
  "afterpay"
];
var PAYMENT_METHOD_WEIGHTS = [0.3, 0.2, 0.15, 0.1, 0.08, 0.07, 0.03, 0.02, 0.03, 0.02];
var paymentMethodGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(PAYMENT_METHODS, PAYMENT_METHOD_WEIGHTS);
};
var DISCOUNT_TEMPLATES = [
  "SPRING",
  "WELCOME",
  "FREESHIP",
  "SAVE",
  "FLASH",
  "VIP",
  "SUMMER",
  "HOLIDAY",
  "FIRST",
  "LOYALTY",
  "WINTER",
  "DEAL",
  "EXTRA",
  "MEGA",
  "NEWUSER",
  "THANKS",
  "SPECIAL",
  "CYBER",
  "BLACK",
  "TREAT"
];
var discountCodeGenerator = (_params, ctx) => {
  const template = ctx.prng.pick(DISCOUNT_TEMPLATES);
  const number = ctx.prng.nextInt(5, 50) * 5;
  return `${template}${number}`;
};
var SHIPPING_CARRIERS = [
  "UPS",
  "FedEx",
  "USPS",
  "DHL",
  "Royal Mail",
  "Australia Post",
  "Canada Post",
  "Deutsche Post",
  "La Poste",
  "Correos"
];
var shippingCarrierGenerator = (_params, ctx) => {
  return ctx.prng.pick(SHIPPING_CARRIERS);
};
var ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "returned",
  "refunded",
  "cancelled"
];
var ORDER_STATUS_WEIGHTS = [0.08, 0.07, 0.1, 0.1, 0.08, 0.05, 0.35, 0.05, 0.07, 0.05];
var orderStatusGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(ORDER_STATUSES, ORDER_STATUS_WEIGHTS);
};
var HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
var HTTP_METHOD_WEIGHTS = [0.4, 0.25, 0.12, 0.08, 0.08, 0.04, 0.03];
var httpMethodGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(HTTP_METHODS, HTTP_METHOD_WEIGHTS);
};
var MIME_TYPES = [
  "application/json",
  "application/pdf",
  "application/xml",
  "text/html",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "video/mp4",
  "audio/mpeg",
  "application/zip",
  "application/gzip",
  "application/javascript",
  "text/css",
  "application/octet-stream",
  "multipart/form-data",
  "application/x-www-form-urlencoded",
  "font/woff2"
];
var mimeTypeGenerator = (_params, ctx) => {
  return ctx.prng.pick(MIME_TYPES);
};
var FILE_EXTENSIONS2 = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".css",
  ".js",
  ".ts",
  ".py",
  ".go",
  ".rs",
  ".jpg",
  ".png",
  ".svg",
  ".mp4",
  ".mp3",
  ".zip",
  ".gz",
  ".tar",
  ".md",
  ".txt",
  ".yaml",
  ".toml"
];
var fileExtensionGenerator = (_params, ctx) => {
  return ctx.prng.pick(FILE_EXTENSIONS2);
};
var PROGRAMMING_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "Elixir",
  "Haskell",
  "Clojure",
  "Dart",
  "R",
  "Julia",
  "Zig"
];
var programmingLanguageGenerator = (_params, ctx) => {
  return ctx.prng.pick(PROGRAMMING_LANGUAGES);
};
var DATABASE_ENGINES = [
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "DynamoDB",
  "Cassandra",
  "Neo4j",
  "ClickHouse",
  "CockroachDB",
  "Supabase",
  "PlanetScale",
  "Neon",
  "Turso",
  "Firebase"
];
var databaseEngineGenerator = (_params, ctx) => {
  return ctx.prng.pick(DATABASE_ENGINES);
};
var EMOJIS = [
  "\u{1F680}",
  "\u{1F389}",
  "\u2728",
  "\u{1F525}",
  "\u{1F4A1}",
  "\u2764\uFE0F",
  "\u{1F44D}",
  "\u{1F3AF}",
  "\u26A1",
  "\u{1F31F}",
  "\u{1F4AA}",
  "\u{1F64C}",
  "\u{1F91D}",
  "\u{1F4BB}",
  "\u{1F4F1}",
  "\u{1F3A8}",
  "\u{1F527}",
  "\u{1F4CA}",
  "\u{1F3C6}",
  "\u{1F308}",
  "\u2615",
  "\u{1F3B5}",
  "\u{1F4DD}",
  "\u{1F511}",
  "\u{1F48E}",
  "\u{1F30D}",
  "\u{1F3AA}",
  "\u{1F6E0}\uFE0F",
  "\u{1F9EA}",
  "\u{1F52C}",
  "\u{1F4E6}",
  "\u{1F5C2}\uFE0F",
  "\u{1F512}",
  "\u{1F513}",
  "\u2705",
  "\u274C",
  "\u26A0\uFE0F",
  "\u{1F4AC}",
  "\u{1F4E2}",
  "\u{1F381}",
  "\u{1F355}",
  "\u{1F331}",
  "\u{1F41B}",
  "\u{1F980}",
  "\u{1F40D}",
  "\u2601\uFE0F",
  "\u{1F319}",
  "\u{1F52E}",
  "\u{1F3B2}",
  "\u{1F9E9}"
];
var emojiGenerator = (_params, ctx) => {
  return ctx.prng.pick(EMOJIS);
};
var REACTIONS = ["like", "love", "haha", "wow", "sad", "angry", "care", "celebrate"];
var REACTION_WEIGHTS = [0.35, 0.2, 0.15, 0.1, 0.08, 0.05, 0.04, 0.03];
var reactionGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(REACTIONS, REACTION_WEIGHTS);
};
var SOCIAL_PLATFORMS = [
  "Twitter/X",
  "Instagram",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Reddit",
  "Facebook",
  "Threads",
  "Mastodon",
  "Bluesky",
  "Discord",
  "Twitch"
];
var socialPlatformGenerator = (_params, ctx) => {
  return ctx.prng.pick(SOCIAL_PLATFORMS);
};
var EMPLOYMENT_STATUSES = [
  "full-time",
  "part-time",
  "contractor",
  "freelance",
  "intern",
  "temporary",
  "remote",
  "hybrid"
];
var EMPLOYMENT_STATUS_WEIGHTS = [0.45, 0.12, 0.15, 0.1, 0.05, 0.03, 0.05, 0.05];
var employmentStatusGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(EMPLOYMENT_STATUSES, EMPLOYMENT_STATUS_WEIGHTS);
};
var SENIORITY_LEVELS = [
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Staff",
  "Principal",
  "Lead",
  "Manager",
  "Director",
  "VP",
  "C-Suite"
];
var SENIORITY_LEVEL_WEIGHTS = [0.05, 0.12, 0.25, 0.25, 0.1, 0.05, 0.05, 0.05, 0.04, 0.02, 0.02];
var seniorityLevelGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(SENIORITY_LEVELS, SENIORITY_LEVEL_WEIGHTS);
};
var SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST APIs",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Tailwind CSS",
  "Figma",
  "Data Analysis",
  "Machine Learning",
  "Project Management",
  "Agile/Scrum",
  "Communication",
  "Leadership",
  "Product Strategy",
  "UX Design",
  "DevOps",
  "Security",
  "Testing/QA",
  "Technical Writing",
  "Cloud Architecture",
  "Microservices",
  "System Design",
  "Mobile Development",
  "iOS",
  "Android",
  "Flutter",
  "Vue.js",
  "Angular"
];
var skillGenerator = (_params, ctx) => {
  return ctx.prng.pick(SKILLS);
};
var LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Parental Leave",
  "Bereavement",
  "Personal Day",
  "Jury Duty",
  "Military Leave",
  "Sabbatical",
  "Unpaid Leave",
  "Work From Home"
];
var leaveTypeGenerator = (_params, ctx) => {
  return ctx.prng.pick(LEAVE_TYPES);
};
var MEDICAL_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology"
];
var medicalSpecialtyGenerator = (_params, ctx) => {
  return ctx.prng.pick(MEDICAL_SPECIALTIES);
};
var ALLERGIES = [
  "Penicillin",
  "Peanuts",
  "Shellfish",
  "Latex",
  "Bee Stings",
  "Sulfa Drugs",
  "Aspirin",
  "Ibuprofen",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat/Gluten",
  "Tree Nuts",
  "Fish",
  "Dust Mites",
  "Mold",
  "Pet Dander",
  "Pollen",
  "Codeine",
  "Contrast Dye"
];
var allergyGenerator = (_params, ctx) => {
  return ctx.prng.pick(ALLERGIES);
};
var PROPERTY_TYPES = [
  "Single Family Home",
  "Condo",
  "Apartment",
  "Townhouse",
  "Duplex",
  "Studio",
  "Loft",
  "Penthouse",
  "Villa",
  "Commercial Office",
  "Retail Space",
  "Warehouse",
  "Land/Lot"
];
var propertyTypeGenerator = (_params, ctx) => {
  return ctx.prng.pick(PROPERTY_TYPES);
};
var MUSIC_GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Jazz",
  "Classical",
  "Electronic",
  "Country",
  "Blues",
  "Reggae",
  "Metal",
  "Punk",
  "Indie",
  "Folk",
  "Soul",
  "Funk",
  "Latin",
  "K-Pop",
  "Lo-fi",
  "Ambient",
  "Techno",
  "House",
  "Drum & Bass",
  "Synthwave",
  "Gospel"
];
var musicGenreGenerator = (_params, ctx) => {
  return ctx.prng.pick(MUSIC_GENRES);
};
var DEFAULT_LABELS = [
  "positive",
  "negative",
  "neutral",
  "spam",
  "not_spam",
  "urgent",
  "normal",
  "low_priority",
  "approved",
  "rejected",
  "pending_review"
];
var labelGenerator = (params, ctx) => {
  const values = params.values ?? DEFAULT_LABELS;
  return ctx.prng.pick(values);
};
var colorRgbGenerator = (_params, ctx) => {
  const r = ctx.prng.nextInt(0, 255);
  const g = ctx.prng.nextInt(0, 255);
  const b = ctx.prng.nextInt(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
};
var COLOR_NAMES = [
  "Cerulean Blue",
  "Coral",
  "Slate Gray",
  "Forest Green",
  "Royal Purple",
  "Burnt Orange",
  "Dusty Rose",
  "Teal",
  "Champagne",
  "Burgundy",
  "Sage",
  "Terracotta",
  "Navy",
  "Blush",
  "Emerald",
  "Ivory",
  "Charcoal",
  "Mauve",
  "Mint",
  "Rust",
  "Pewter",
  "Indigo",
  "Crimson",
  "Lavender",
  "Copper",
  "Olive",
  "Plum",
  "Sand",
  "Azure",
  "Maroon"
];
var colorNameGenerator = (_params, ctx) => {
  return ctx.prng.pick(COLOR_NAMES);
};

// ../../src/lib/engine/field-generators/tier2-patterns.ts
var UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
var DIGITS = "0123456789";
var HEX = "0123456789abcdef";
var BASE62 = UPPERCASE + LOWERCASE + DIGITS;
var BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var BASE64URL = UPPERCASE + LOWERCASE + DIGITS + "_-";
function randomChars(ctx, charset, length) {
  const chars = charset.split("");
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ctx.prng.pick(chars);
  }
  return result;
}
function padStart(n, width) {
  return String(n).padStart(width, "0");
}
function base64urlEncode(str) {
  const bytes = Array.from(str).map((c) => c.charCodeAt(0));
  const TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += TABLE[b0 >> 2 & 63];
    result += TABLE[(b0 << 4 | b1 >> 4) & 63];
    if (i + 1 < bytes.length) result += TABLE[(b1 << 2 | b2 >> 6) & 63];
    if (i + 2 < bytes.length) result += TABLE[b2 & 63];
  }
  return result;
}
var BIO_ROLES = [
  "Full-stack developer",
  "Product designer",
  "Data scientist",
  "DevOps engineer",
  "Marketing manager",
  "Startup founder",
  "Backend engineer",
  "Frontend developer",
  "UX researcher",
  "Technical writer",
  "Engineering manager",
  "Solutions architect",
  "QA engineer",
  "Mobile developer",
  "Security analyst",
  "Cloud architect",
  "Growth hacker",
  "CTO",
  "AI/ML engineer",
  "Platform engineer"
];
var BIO_LOCATIONS = [
  "based in Austin",
  "living in Berlin",
  "from Tokyo",
  "based in San Francisco",
  "living in London",
  "from New York",
  "based in Toronto",
  "living in Amsterdam",
  "from Sydney",
  "based in Singapore",
  "living in Stockholm",
  "from Lisbon",
  "based in Portland",
  "living in Dublin",
  "from Copenhagen"
];
var BIO_INTERESTS = [
  "Coffee enthusiast",
  "Open-source contributor",
  "Marathon runner",
  "Cat person",
  "Avid reader",
  "Podcast addict",
  "Weekend hiker",
  "Amateur chef",
  "Dog lover",
  "Board game nerd",
  "Yoga practitioner",
  "Photography hobbyist",
  "Mechanical keyboard collector",
  "Craft beer aficionado",
  "Rock climber",
  "Home barista",
  "Vinyl record collector",
  "Trail runner",
  "Chess player",
  "Piano player"
];
var bioGenerator = (params, ctx) => {
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
  let interest2 = ctx.prng.pick(BIO_INTERESTS);
  let attempts = 0;
  while (interest2 === interest1 && attempts < 10) {
    interest2 = ctx.prng.pick(BIO_INTERESTS);
    attempts++;
  }
  return `${role} ${location}. ${interest1} and ${interest2.toLowerCase()}. Always learning something new.`;
};
var ssnGenerator = (_params, ctx) => {
  let area = ctx.prng.nextInt(100, 899);
  if (area === 666) area = 667;
  const group = ctx.prng.nextInt(1, 99);
  const serial = ctx.prng.nextInt(1, 9999);
  return `${padStart(area, 3)}-${padStart(group, 2)}-${padStart(serial, 4)}`;
};
var passportNumberGenerator = (params, ctx) => {
  const _format = params.format ?? "US";
  const letter = ctx.prng.pick(UPPERCASE.split(""));
  let digits = "";
  for (let i = 0; i < 8; i++) {
    digits += ctx.prng.nextInt(0, 9);
  }
  return `${letter}${digits}`;
};
var phoneE164Generator = (params, ctx) => {
  const localeMap = {
    en: { code: "1", length: 10 },
    de: { code: "49", length: ctx.prng.nextInt(10, 11) },
    fr: { code: "33", length: 9 },
    es: { code: "34", length: 9 },
    hr: { code: "385", length: 9 }
  };
  const country = params.country ?? void 0;
  let config;
  if (country) {
    const countryMap = {
      US: { code: "1", length: 10 },
      GB: { code: "44", length: 10 },
      DE: { code: "49", length: ctx.prng.nextInt(10, 11) },
      FR: { code: "33", length: 9 }
    };
    config = countryMap[country] ?? { code: "1", length: 10 };
  } else {
    config = localeMap[ctx.locale] ?? { code: "1", length: 10 };
  }
  let subscriber = "";
  for (let i = 0; i < config.length; i++) {
    if (i === 0) {
      subscriber += ctx.prng.nextInt(1, 9);
    } else {
      subscriber += ctx.prng.nextInt(0, 9);
    }
  }
  return `+${config.code}${subscriber}`;
};
var STREET_NAMES = [
  "Main Street",
  "Oak Avenue",
  "Elm Drive",
  "Park Road",
  "Cedar Lane",
  "Maple Court",
  "Pine Street",
  "Washington Boulevard",
  "Highland Avenue",
  "Lake Drive",
  "River Road",
  "Sunset Boulevard",
  "Broadway",
  "Market Street",
  "Church Street",
  "Mill Road",
  "King Street",
  "Queen Street",
  "Victoria Road",
  "Station Road",
  "High Street",
  "Bridge Street",
  "Green Lane",
  "Forest Avenue",
  "Spring Street",
  "Hill Road",
  "Valley Drive",
  "Meadow Lane",
  "Orchard Road",
  "Garden Way",
  "Willow Street",
  "Cherry Lane"
];
var streetAddressGenerator = (_params, ctx) => {
  const number = ctx.prng.nextInt(1, 9999);
  const street = ctx.prng.pick(STREET_NAMES);
  return `${number} ${street}`;
};
var addressLine2Generator = (_params, ctx) => {
  const letters = UPPERCASE.split("");
  const patterns = [
    () => `Apt ${ctx.prng.nextInt(1, 999)}`,
    () => `Suite ${ctx.prng.nextInt(1, 999)}`,
    () => `Unit ${ctx.prng.pick(letters)}`,
    () => `Floor ${ctx.prng.nextInt(1, 99)}`,
    () => `# ${ctx.prng.nextInt(1, 999)}`,
    () => `Building ${ctx.prng.pick(letters)}`
  ];
  return ctx.prng.pick(patterns)();
};
var LOCALE_CODES = [
  "en-US",
  "en-GB",
  "en-AU",
  "de-DE",
  "de-AT",
  "fr-FR",
  "fr-CA",
  "es-ES",
  "es-MX",
  "it-IT",
  "pt-BR",
  "pt-PT",
  "nl-NL",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "pl-PL",
  "hr-HR",
  "sv-SE",
  "nb-NO",
  "da-DK",
  "fi-FI",
  "ru-RU",
  "tr-TR",
  "ar-SA",
  "hi-IN",
  "th-TH"
];
var localeCodeGenerator = (_params, ctx) => {
  return ctx.prng.pick(LOCALE_CODES);
};
var creditCardExpiryGenerator = (_params, ctx) => {
  const now = /* @__PURE__ */ new Date();
  const currentYear = now.getFullYear();
  const year = ctx.prng.nextInt(currentYear + 1, currentYear + 5);
  const month = ctx.prng.nextInt(1, 12);
  return `${padStart(month, 2)}/${padStart(year % 100, 2)}`;
};
var creditCardCvvGenerator = (params, ctx) => {
  const length = params.length ?? 3;
  const max = 10 ** length - 1;
  const min = 10 ** (length - 1);
  return padStart(ctx.prng.nextInt(min, max), length);
};
var invoiceNumberGenerator = (params, ctx) => {
  const prefix = params.prefix ?? "INV";
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const seq = ctx.prng.nextInt(1, 99999);
  return `${prefix}-${year}-${padStart(seq, 5)}`;
};
var SWIFT_COUNTRIES = ["US", "GB", "DE", "FR", "ES", "IT", "NL", "CH", "JP"];
var ALPHANUMERIC_UPPER = UPPERCASE + DIGITS;
var swiftCodeGenerator = (_params, ctx) => {
  const bank = randomChars(ctx, UPPERCASE, 4);
  const country = ctx.prng.pick(SWIFT_COUNTRIES);
  const location = randomChars(ctx, ALPHANUMERIC_UPPER, 2);
  const hasBranch = ctx.prng.chance(0.3);
  const branch = hasBranch ? randomChars(ctx, ALPHANUMERIC_UPPER, 3) : "";
  return `${bank}${country}${location}${branch}`;
};
var TAX_ID_PREFIXES = [10, 12, 60, 67, 50, 53, 1, 2, 3, 4];
var taxIdGenerator = (_params, ctx) => {
  const prefix = ctx.prng.pick(TAX_ID_PREFIXES);
  let suffix = "";
  for (let i = 0; i < 7; i++) {
    suffix += ctx.prng.nextInt(0, 9);
  }
  return `${padStart(prefix, 2)}-${suffix}`;
};
var STOCK_TICKERS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "NVDA",
  "JPM",
  "V",
  "JNJ",
  "WMT",
  "PG",
  "MA",
  "UNH",
  "HD",
  "DIS",
  "BAC",
  "NFLX",
  "ADBE",
  "CRM",
  "PYPL",
  "INTC",
  "CSCO",
  "PEP",
  "KO",
  "MRK",
  "ABT",
  "TMO",
  "ACN",
  "COST",
  "NKE",
  "LLY",
  "ORCL",
  "IBM",
  "GS",
  "MS",
  "UBER",
  "ABNB",
  "SQ",
  "SHOP"
];
var stockTickerGenerator = (_params, ctx) => {
  return ctx.prng.pick(STOCK_TICKERS);
};
var walletAddressGenerator = (params, ctx) => {
  const chain = params.chain ?? "eth";
  if (chain === "btc") {
    const prefix = ctx.prng.pick(["1", "3"]);
    return prefix + randomChars(ctx, BASE58, 33);
  }
  return "0x" + randomChars(ctx, HEX, 40);
};
var CATEGORY_L1 = [
  { name: "Electronics", subs: [
    { name: "Computers", items: ["Laptops", "Desktops", "Monitors", "Keyboards"] },
    { name: "Phones", items: ["Smartphones", "Cases", "Chargers", "Screen Protectors"] },
    { name: "Audio", items: ["Headphones", "Speakers", "Earbuds", "Microphones"] }
  ] },
  { name: "Clothing", subs: [
    { name: "Men", items: ["Shirts", "Pants", "Jackets", "Shoes"] },
    { name: "Women", items: ["Dresses", "Tops", "Skirts", "Boots"] },
    { name: "Kids", items: ["T-Shirts", "Shorts", "Sneakers", "Hoodies"] }
  ] },
  { name: "Home & Garden", subs: [
    { name: "Kitchen", items: ["Appliances", "Cookware", "Utensils", "Storage"] },
    { name: "Furniture", items: ["Chairs", "Tables", "Shelves", "Desks"] },
    { name: "Garden", items: ["Tools", "Plants", "Pots", "Lighting"] }
  ] },
  { name: "Sports & Outdoors", subs: [
    { name: "Fitness", items: ["Yoga Mats", "Dumbbells", "Resistance Bands", "Jump Ropes"] },
    { name: "Cycling", items: ["Bikes", "Helmets", "Locks", "Lights"] },
    { name: "Camping", items: ["Tents", "Sleeping Bags", "Backpacks", "Stoves"] }
  ] },
  { name: "Books", subs: [
    { name: "Fiction", items: ["Novels", "Short Stories", "Sci-Fi", "Fantasy"] },
    { name: "Non-Fiction", items: ["Biographies", "Self-Help", "Business", "History"] },
    { name: "Technical", items: ["Programming", "Data Science", "DevOps", "Design"] }
  ] }
];
var productCategoryGenerator = (_params, ctx) => {
  const l1 = ctx.prng.pick(CATEGORY_L1);
  const l2 = ctx.prng.pick(l1.subs);
  const l3 = ctx.prng.pick(l2.items);
  return `${l1.name} > ${l2.name} > ${l3}`;
};
var PRODUCT_ADJECTIVES = [
  "Premium",
  "Professional",
  "Lightweight",
  "Ultra-thin",
  "Heavy-duty",
  "Compact",
  "Ergonomic",
  "Wireless",
  "Portable",
  "Advanced",
  "Eco-friendly",
  "High-performance",
  "Smart",
  "Durable",
  "Sleek"
];
var PRODUCT_FEATURES = [
  "with noise cancellation",
  "with built-in LED display",
  "with Bluetooth 5.0",
  "with USB-C charging",
  "with water resistance",
  "with adjustable settings",
  "with touch controls",
  "with 12-hour battery life",
  "with fast charging",
  "with anti-slip grip",
  "with memory foam padding",
  "with quick-release mechanism"
];
var PRODUCT_BENEFITS = [
  "Perfect for everyday use.",
  "Ideal for professionals.",
  "Designed for maximum comfort.",
  "Built to last a lifetime.",
  "Great for travel and commuting.",
  "Suitable for all skill levels.",
  "A must-have for any workspace.",
  "Engineered for peak performance.",
  "Makes a wonderful gift.",
  "Trusted by thousands of customers."
];
var productDescriptionGenerator = (_params, ctx) => {
  const adj = ctx.prng.pick(PRODUCT_ADJECTIVES);
  const feature = ctx.prng.pick(PRODUCT_FEATURES);
  const benefit = ctx.prng.pick(PRODUCT_BENEFITS);
  const sentenceCount = ctx.prng.nextInt(2, 4);
  const sentences = [];
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
var barcodeEan13Generator = (_params, ctx) => {
  const prefixes = [
    "000",
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
    "009",
    "010",
    "011",
    "012",
    "013",
    "014",
    "015",
    "016",
    "017",
    "018",
    "019",
    "400",
    "401",
    "410",
    "420",
    "430",
    "440",
    "300",
    "301",
    "302",
    "303"
  ];
  const prefix = ctx.prng.pick(prefixes);
  let code = prefix;
  while (code.length < 12) {
    code += ctx.prng.nextInt(0, 9);
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - sum % 10) % 10;
  return code + checkDigit;
};
var isbnGenerator = (_params, ctx) => {
  const group = ctx.prng.nextInt(0, 9);
  const publisher = ctx.prng.nextInt(1e3, 9999);
  const title = ctx.prng.nextInt(1e3, 9999);
  const raw = `978${group}${padStart(publisher, 4)}${padStart(title, 4)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(raw[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - sum % 10) % 10;
  return `978-${group}-${padStart(publisher, 4)}-${padStart(title, 4)}-${checkDigit}`;
};
var weightGenerator = (params, ctx) => {
  const unit = params.unit ?? "kg";
  const min = params.min ?? 0.1;
  const max = params.max ?? 100;
  const value = ctx.prng.nextFloat(min, max, 2);
  return { value, unit };
};
var dateFutureGenerator = (params, ctx) => {
  const minDays = params.min_days ?? 1;
  const maxDays = params.max_days ?? 365;
  const days = ctx.prng.nextInt(minDays, maxDays);
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = padStart(date.getMonth() + 1, 2);
  const d = padStart(date.getDate(), 2);
  return `${y}-${m}-${d}`;
};
var datePastGenerator = (params, ctx) => {
  const minDays = params.min_days ?? 1;
  const maxDays = params.max_days ?? 365;
  const days = ctx.prng.nextInt(minDays, maxDays);
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = padStart(date.getMonth() + 1, 2);
  const d = padStart(date.getDate(), 2);
  return `${y}-${m}-${d}`;
};
var durationGenerator = (params, ctx) => {
  const maxHours = params.max_hours ?? 72;
  const hours = ctx.prng.nextInt(0, maxHours);
  const minutes = ctx.prng.nextInt(0, 59);
  return `PT${hours}H${minutes}M`;
};
var RELATIVE_TIME_TEMPLATES = [
  () => "just now",
  () => "yesterday",
  () => "last week",
  () => "tomorrow"
];
var relativeTimeGenerator = (_params, ctx) => {
  const dynamicTemplates = [
    (n2) => `${n2} seconds ago`,
    (n2) => `${n2} minutes ago`,
    (n2) => `${n2} hours ago`,
    (n2) => `${n2} days ago`,
    (n2) => `${n2} weeks ago`,
    (n2) => `in ${n2} minutes`,
    (n2) => `in ${n2} hours`,
    (n2) => `in ${n2} days`
  ];
  if (ctx.prng.chance(0.4)) {
    return ctx.prng.pick(RELATIVE_TIME_TEMPLATES)();
  }
  const template = ctx.prng.pick(dynamicTemplates);
  const n = ctx.prng.nextInt(1, 59);
  return template(n);
};
var semverGenerator = (params, ctx) => {
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
var apiKeyGenerator = (params, ctx) => {
  const prefix = params.prefix ?? "sk_test_";
  return prefix + randomChars(ctx, BASE62, 24);
};
var commitShaGenerator = (params, ctx) => {
  const short = params.short ?? false;
  const length = short ? 7 : 40;
  return randomChars(ctx, HEX, length);
};
var hashMd5Generator = (_params, ctx) => {
  return randomChars(ctx, HEX, 32);
};
var hashSha256Generator = (_params, ctx) => {
  return randomChars(ctx, HEX, 64);
};
var COMMON_PORTS = [80, 443, 3e3, 5432, 8080, 8443, 27017, 6379, 3306];
var portNumberGenerator = (params, ctx) => {
  const range = params.range ?? "registered";
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
var HTTP_STATUS_CODES = [200, 201, 204, 301, 304, 400, 401, 403, 404, 500, 502, 503];
var HTTP_STATUS_WEIGHTS = [0.6, 0.08, 0.03, 0.02, 0.03, 0.06, 0.04, 0.03, 0.05, 0.04, 0.01, 0.01];
var httpStatusCodeGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(HTTP_STATUS_CODES, HTTP_STATUS_WEIGHTS);
};
var fileSizeGenerator = (params, ctx) => {
  const minBytes = params.min_bytes ?? 1024;
  const maxBytes = params.max_bytes ?? 1073741824;
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
var DOCKER_IMAGES = [
  "nginx",
  "postgres",
  "redis",
  "node",
  "python",
  "golang",
  "ubuntu",
  "alpine",
  "mysql",
  "mongo",
  "rabbitmq",
  "elasticsearch",
  "grafana",
  "prometheus",
  "traefik",
  "caddy",
  "vault",
  "consul"
];
var DOCKER_TAGS = [
  "latest",
  "alpine",
  "16",
  "18",
  "20",
  "3.2",
  "3.9",
  "1.25-alpine",
  "14-alpine",
  "7",
  "8",
  "slim",
  "bullseye",
  "bookworm"
];
var dockerImageGenerator = (_params, ctx) => {
  const image = ctx.prng.pick(DOCKER_IMAGES);
  const tag = ctx.prng.pick(DOCKER_TAGS);
  return `${image}:${tag}`;
};
var githubUsernameGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const firstName = (rec.first_name ?? "").toLowerCase();
  const lastName = (rec.last_name ?? "").toLowerCase();
  if (firstName && lastName) {
    const patterns = [
      () => `${firstName[0]}${lastName}`,
      () => `${firstName}-${lastName}`,
      () => `${firstName}${ctx.prng.nextInt(1, 99)}`,
      () => `${firstName[0]}-${lastName}${ctx.prng.nextInt(1, 99)}`,
      () => `${firstName}codes${ctx.prng.nextInt(1, 99)}`
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
var twitterHandleGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const firstName = (rec.first_name ?? "").toLowerCase();
  const lastName = (rec.last_name ?? "").toLowerCase();
  if (firstName && lastName) {
    const patterns = [
      () => `@${firstName}_${lastName}`,
      () => `@${firstName}${lastName}`,
      () => `@${firstName}_codes`,
      () => `@dev${firstName}${ctx.prng.nextInt(1, 99)}`,
      () => `@${firstName[0]}${lastName}_tech`
    ];
    return ctx.prng.pick(patterns)();
  }
  const words = ["dev", "tech", "code", "build", "ship", "data", "cloud"];
  const w1 = ctx.prng.pick(words);
  const w2 = ctx.prng.pick(words);
  const num = ctx.prng.nextInt(1, 999);
  return `@${w1}${w2}${num}`;
};
var MESSAGES = [
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
  "Good catch, I'll update that"
];
var messageGenerator = (_params, ctx) => {
  return ctx.prng.pick(MESSAGES);
};
var notificationTextGenerator = (_params, ctx) => {
  const rec = ctx.currentRecord;
  const name = rec.first_name ?? ctx.prng.pick([
    "Alex",
    "Sam",
    "Jordan",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Quinn"
  ]);
  const num = ctx.prng.nextInt(1e3, 99999);
  const amount = ctx.prng.nextFloat(5, 500, 2);
  const days = ctx.prng.nextInt(1, 30);
  const team = ctx.prng.pick([
    "Engineering",
    "Design",
    "Marketing",
    "Product",
    "Sales"
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
    `Build #${num} passed successfully`
  ];
  return ctx.prng.pick(templates);
};
var HASHTAGS = [
  "#javascript",
  "#typescript",
  "#react",
  "#nextjs",
  "#webdev",
  "#coding",
  "#opensource",
  "#buildinpublic",
  "#indiehacker",
  "#startup",
  "#ai",
  "#machinelearning",
  "#devops",
  "#cloud",
  "#aws",
  "#design",
  "#ux",
  "#100daysofcode",
  "#programming",
  "#developer",
  "#tech",
  "#dataengineering",
  "#python",
  "#rust",
  "#golang",
  "#frontend",
  "#backend",
  "#fullstack",
  "#api",
  "#database",
  "#security",
  "#performance",
  "#agile",
  "#remote",
  "#hiring",
  "#career",
  "#tutorial",
  "#productivity",
  "#tools",
  "#saas"
];
var hashtagGenerator = (_params, ctx) => {
  return ctx.prng.pick(HASHTAGS);
};
var employeeIdGenerator = (params, ctx) => {
  const prefix = params.prefix ?? "EMP";
  const seq = ctx.prng.nextInt(1, 99999);
  return `${prefix}-${padStart(seq, 5)}`;
};
var salaryGenerator = (params, ctx) => {
  const min = params.min ?? 3e4;
  const max = params.max ?? 2e5;
  const currency = params.currency ?? "USD";
  const period = params.period ?? "annual";
  const amount = ctx.prng.nextInt(min, max);
  return { amount, currency, period };
};
var TEAM_NAMES = [
  "Platform Engineering",
  "Growth",
  "Customer Success",
  "Infrastructure",
  "Frontend",
  "Backend",
  "Mobile",
  "Data Science",
  "DevOps",
  "Security",
  "QA",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Finance",
  "HR",
  "Legal",
  "Operations",
  "Analytics",
  "Research",
  "Content",
  "Partnerships",
  "Developer Experience"
];
var teamNameGenerator = (_params, ctx) => {
  return ctx.prng.pick(TEAM_NAMES);
};
var DEGREES = [
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
  "Doctor of Medicine"
];
var degreeGenerator = (_params, ctx) => {
  return ctx.prng.pick(DEGREES);
};
var UNIVERSITIES = [
  "MIT",
  "Stanford University",
  "Harvard University",
  "University of Cambridge",
  "University of Oxford",
  "ETH Zurich",
  "University of Tokyo",
  "National University of Singapore",
  "University of Toronto",
  "Imperial College London",
  "UC Berkeley",
  "Carnegie Mellon University",
  "Georgia Tech",
  "University of Michigan",
  "University of Washington",
  "TU Munich",
  "Sorbonne University",
  "University of Melbourne",
  "Seoul National University",
  "IIT Delhi",
  "University of S\xE3o Paulo",
  "Tsinghua University",
  "KAIST",
  "University of Amsterdam",
  "KTH Royal Institute",
  "University of Edinburgh",
  "Technical University of Berlin",
  "University of Zagreb",
  "Politecnico di Milano",
  "University of Barcelona"
];
var universityNameGenerator = (_params, ctx) => {
  return ctx.prng.pick(UNIVERSITIES);
};
var confidenceScoreGenerator = (params, ctx) => {
  const min = params.min ?? 0.5;
  const max = params.max ?? 0.99;
  const raw = Math.sqrt(ctx.prng.next());
  const value = min + raw * (max - min);
  return Math.round(value * 1e4) / 1e4;
};
var tokenCountGenerator = (params, ctx) => {
  const maxInput = params.max_input ?? 4096;
  const maxOutput = params.max_output ?? 2048;
  const inputRaw = ctx.prng.next() * ctx.prng.next();
  const input = Math.max(1, Math.floor(inputRaw * maxInput));
  const outputRatio = 0.2 + ctx.prng.next() * 0.6;
  const output = Math.max(1, Math.min(Math.floor(input * outputRatio), maxOutput));
  return { input, output, total: input + output };
};
var licenseKeyGenerator = (_params, ctx) => {
  const groups = [];
  for (let i = 0; i < 5; i++) {
    groups.push(randomChars(ctx, ALPHANUMERIC_UPPER, 5));
  }
  return groups.join("-");
};
var totpSecretGenerator = (_params, ctx) => {
  return randomChars(ctx, BASE32, 16);
};
var jwtTokenGenerator = (_params, ctx) => {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1e3);
  const sub = ctx.prng.nextInt(1e3, 999999);
  const iat = now - ctx.prng.nextInt(0, 86400);
  const exp = iat + ctx.prng.nextInt(3600, 604800);
  const payload = JSON.stringify({ sub: String(sub), iat, exp });
  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const signature = randomChars(ctx, BASE64URL, 43);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// ../../src/lib/engine/field-generators/tier2-chaos.ts
var UNICODE_POOL = [
  "\u0645\u0631\u062D\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645",
  // Arabic
  "\u65E5\u672C\u8A9E\u30C6\u30B9\u30C8",
  // Japanese
  "\uD55C\uAD6D\uC5B4 \uD14C\uC2A4\uD2B8",
  // Korean
  "\u4E2D\u6587\u6D4B\u8BD5\u6570\u636E",
  // Chinese
  "Tes\u035D\u035Ft\u0358\u0357 d\u0330a\u0336t\u0328a\u0327",
  // Zalgo-lite
  "\u{1F389}\u{1F680}\u{1F4BB}\u{1F525}\u2728",
  // Emojis only
  "Hello \u4E16\u754C \u0645\u0631\u062D\u0628\u0627 \u043C\u0438\u0440",
  // Mixed scripts
  "caf\xE9 r\xE9sum\xE9 na\xEFve",
  // Accented Latin
  "\u202Ereverse text\u202C",
  // RTL override
  "null\0byte",
  // Null byte
  "line1\nline2	tab",
  // Control characters
  "'quotes' \"double\" `backtick`",
  // Quote variants
  "emoji \u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} family",
  // ZWJ sequences
  "\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB",
  // Extended Latin
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC \u03B4\u03BF\u03BA\u03B9\u03BC\u03AE",
  // Greek
  "\u0939\u093F\u0928\u094D\u0926\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923",
  // Hindi/Devanagari
  "\xF1o\xF1o a\xF1o espa\xF1ol",
  // Spanish special chars
  "Cze\u015B\u0107 \u0141\xF3d\u017A",
  // Polish
  "\u{1D5B3}\u{1D5BE}\u{1D5BB}\u{1D5BB}\u{1D5C8} \u{1D5B2}\u{1D5C8}\u{1D5C7}\u{1D5BB}\u{1D5C1}",
  // Mathematical symbols
  "<not>html</not>"
  // HTML-like but not XSS
];
var unicodeStringGenerator = (params, ctx) => {
  return ctx.prng.pick(UNICODE_POOL);
};
var longStringGenerator = (params, ctx) => {
  const minLength = params.min_length ?? params.length ?? 1e4;
  const maxLength = params.max_length ?? minLength;
  const baseChar = params.char ?? "a";
  const targetLength = minLength === maxLength ? minLength : ctx.prng.nextInt(minLength, maxLength);
  const mixChars = [" ", "\n", "b", "X", "0", "_", "z"];
  const parts = [];
  let remaining = targetLength;
  while (remaining > 0) {
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
var BOUNDARY_VALUES = [
  0,
  -1,
  1,
  2147483647,
  // INT32_MAX
  -2147483648,
  // INT32_MIN
  2147483646,
  // INT32_MAX - 1
  9007199254740991,
  // JS MAX_SAFE_INTEGER
  -9007199254740991,
  // JS MIN_SAFE_INTEGER
  255,
  // UINT8_MAX
  256,
  65535,
  // UINT16_MAX
  65536,
  32767,
  // INT16_MAX
  -32768,
  // INT16_MIN
  100,
  999,
  1e3,
  9999,
  1e4,
  99999,
  1e5
];
var boundaryIntegerGenerator = (params, ctx) => {
  return ctx.prng.pick(BOUNDARY_VALUES);
};
var emptyStringGenerator = (params, ctx) => {
  const frequency = params.frequency ?? 1;
  if (ctx.prng.chance(frequency)) {
    return "";
  }
  return ctx.prng.chance(0.5) ? " " : null;
};
var ERROR_VALUES_BY_CATEGORY = {
  email: [
    "not-an-email",
    "@missing-local.com",
    "user@",
    "user@.com",
    "user @space.com",
    "user@domain..com"
  ],
  uuid: [
    "not-a-uuid",
    "12345",
    "g1234567-89ab-cdef-0123-456789abcdef"
  ],
  date: [
    "2024-13-01",
    "2024-02-30",
    "not-a-date",
    "9999-99-99"
  ],
  url: [
    "not-a-url",
    "://missing-scheme.com",
    "http://",
    "ftp:/invalid"
  ],
  phone: [
    "abc-def-ghij",
    "+0000000000",
    "123",
    ""
  ],
  json: [
    '{"unclosed": ',
    '{"key": undefined}',
    "[1,2,3,}"
  ],
  number: [
    "99999999999999999999999",
    "-99999999999999999999999"
  ],
  special: [
    "NULL",
    "undefined",
    "NaN",
    "Infinity",
    "-Infinity"
  ]
};
var ALL_ERROR_VALUES = Object.values(ERROR_VALUES_BY_CATEGORY).flat();
var errorValueGenerator = (params, ctx) => {
  const targetType = params.target_type;
  if (targetType && targetType in ERROR_VALUES_BY_CATEGORY) {
    return ctx.prng.pick(ERROR_VALUES_BY_CATEGORY[targetType]);
  }
  return ctx.prng.pick(ALL_ERROR_VALUES);
};
var EDGE_CASE_DATES = [
  "2038-01-19T03:14:07Z",
  // Y2K38 — Unix 32-bit overflow
  "2038-01-19T03:14:08Z",
  // One second after Y2K38
  "2024-02-29T12:00:00Z",
  // Leap day 2024
  "2025-02-28T23:59:59Z",
  // Last second of Feb in non-leap year
  "2000-01-01T00:00:00Z",
  // Y2K
  "1999-12-31T23:59:59Z",
  // Last second of 1999
  "1970-01-01T00:00:00Z",
  // Unix epoch
  "1970-01-01T00:00:01Z",
  // One second after epoch
  "2100-01-01T00:00:00Z",
  // Year 2100 — not a leap year (divisible by 100, not 400)
  "2099-12-31T23:59:59Z",
  // End of century
  "9999-12-31T23:59:59Z",
  // Max 4-digit year
  "2024-03-10T02:30:00-05:00",
  // US DST spring forward — time doesn't exist in ET
  "2024-11-03T01:30:00-04:00",
  // US DST fall back — time exists twice
  "2024-12-31T23:59:60Z"
  // Leap second
];
var futureProofDateGenerator = (params, ctx) => {
  return ctx.prng.pick(EDGE_CASE_DATES);
};

// ../../src/lib/engine/field-generators/index.ts
var GENERATOR_REGISTRY = {
  // ── Identity ───────────────────────────────────────────
  first_name: firstNameGenerator,
  last_name: lastNameGenerator,
  full_name: fullNameGenerator,
  email: emailGenerator,
  username: usernameGenerator,
  phone: phoneGenerator,
  avatar_url: avatarUrlGenerator,
  gender: genderGenerator,
  date_of_birth: dateOfBirthGenerator,
  name_prefix: namePrefixGenerator,
  name_suffix: nameSuffixGenerator,
  nickname: nicknameGenerator,
  marital_status: maritalStatusGenerator,
  nationality: nationalityGenerator,
  blood_type: bloodTypeGenerator,
  pronoun_set: pronounSetGenerator,
  bio: bioGenerator,
  ssn: ssnGenerator,
  passport_number: passportNumberGenerator,
  phone_e164: phoneE164Generator,
  // ── Location ───────────────────────────────────────────
  city: cityGenerator,
  country: countryGenerator,
  postal_code: postalCodeGenerator,
  address: addressGenerator,
  state_province: stateProvinceGenerator,
  latitude: latitudeGenerator,
  longitude: longitudeGenerator,
  timezone: timezoneGenerator,
  country_code: countryCodeGenerator,
  neighborhood: neighborhoodGenerator,
  street_address: streetAddressGenerator,
  address_line_2: addressLine2Generator,
  locale_code: localeCodeGenerator,
  // ── Financial ──────────────────────────────────────────
  company_name: companyNameGenerator,
  job_title: jobTitleGenerator,
  department: departmentGenerator,
  product_name: productNameGenerator,
  price: priceGenerator,
  amount: amountGenerator,
  decimal: decimalGenerator,
  currency: currencyGenerator,
  rating: ratingGenerator,
  sku: skuGenerator,
  credit_card_number: creditCardNumberGenerator,
  tracking_number: trackingNumberGenerator,
  bank_name: bankNameGenerator,
  payment_method: paymentMethodGenerator,
  discount_code: discountCodeGenerator,
  credit_card_expiry: creditCardExpiryGenerator,
  credit_card_cvv: creditCardCvvGenerator,
  invoice_number: invoiceNumberGenerator,
  swift_code: swiftCodeGenerator,
  tax_id: taxIdGenerator,
  stock_ticker: stockTickerGenerator,
  wallet_address: walletAddressGenerator,
  // ── Ecommerce ──────────────────────────────────────────
  shipping_carrier: shippingCarrierGenerator,
  order_status: orderStatusGenerator,
  product_category: productCategoryGenerator,
  product_description: productDescriptionGenerator,
  barcode_ean13: barcodeEan13Generator,
  isbn: isbnGenerator,
  weight: weightGenerator,
  // ── Temporal ───────────────────────────────────────────
  datetime: datetimeGenerator,
  date: dateGenerator,
  time: timeGenerator,
  timestamp: timestampGenerator,
  age: ageGenerator,
  date_range: dateRangeGenerator,
  date_future: dateFutureGenerator,
  date_past: datePastGenerator,
  duration: durationGenerator,
  relative_time: relativeTimeGenerator,
  // ── Technical ──────────────────────────────────────────
  uuid: uuidGenerator,
  id: idGenerator,
  ip_address: ipAddressGenerator,
  mac_address: macAddressGenerator,
  url: urlGenerator,
  domain: domainGenerator,
  user_agent: userAgentGenerator,
  color_hex: colorHexGenerator,
  embedding_vector: embeddingVectorGenerator,
  http_method: httpMethodGenerator,
  mime_type: mimeTypeGenerator,
  file_extension: fileExtensionGenerator,
  programming_language: programmingLanguageGenerator,
  database_engine: databaseEngineGenerator,
  semver: semverGenerator,
  api_key: apiKeyGenerator,
  commit_sha: commitShaGenerator,
  hash_md5: hashMd5Generator,
  hash_sha256: hashSha256Generator,
  port_number: portNumberGenerator,
  http_status_code: httpStatusCodeGenerator,
  file_size: fileSizeGenerator,
  docker_image: dockerImageGenerator,
  // ── Content ────────────────────────────────────────────
  sentence: sentenceGenerator,
  paragraph: paragraphGenerator,
  title: titleGenerator,
  slug: slugGenerator,
  tag: tagGenerator,
  review: reviewGenerator,
  image_url: imageUrlGenerator,
  file_path: filePathGenerator,
  json: jsonGenerator,
  array: arrayGenerator,
  markdown: markdownGenerator,
  emoji: emojiGenerator,
  hashtag: hashtagGenerator,
  message: messageGenerator,
  notification_text: notificationTextGenerator,
  // ── Social ─────────────────────────────────────────────
  social_platform: socialPlatformGenerator,
  reaction: reactionGenerator,
  github_username: githubUsernameGenerator,
  twitter_handle: twitterHandleGenerator,
  // ── HR & Organization ──────────────────────────────────
  employment_status: employmentStatusGenerator,
  seniority_level: seniorityLevelGenerator,
  skill: skillGenerator,
  leave_type: leaveTypeGenerator,
  employee_id: employeeIdGenerator,
  salary: salaryGenerator,
  team_name: teamNameGenerator,
  degree: degreeGenerator,
  university_name: universityNameGenerator,
  // ── AI / ML ────────────────────────────────────────────
  label: labelGenerator,
  confidence_score: confidenceScoreGenerator,
  token_count: tokenCountGenerator,
  // ── Healthcare ─────────────────────────────────────────
  medical_specialty: medicalSpecialtyGenerator,
  allergy: allergyGenerator,
  // ── Real Estate ────────────────────────────────────────
  property_type: propertyTypeGenerator,
  // ── Media ──────────────────────────────────────────────
  music_genre: musicGenreGenerator,
  color_rgb: colorRgbGenerator,
  color_name: colorNameGenerator,
  // ── Security & Auth ────────────────────────────────────
  password_hash: passwordHashGenerator,
  xss_string: xssStringGenerator,
  sql_injection_string: sqlInjectionStringGenerator,
  role: (params, ctx) => {
    const values = params.values ?? [
      "admin",
      "editor",
      "viewer",
      "moderator",
      "billing_admin",
      "super_admin",
      "member",
      "guest",
      "owner",
      "developer"
    ];
    return ctx.prng.pick(values);
  },
  permission: (params, ctx) => {
    const resources = ["users", "posts", "orders", "billing", "settings", "analytics", "admin", "files", "teams", "api_keys"];
    const actions = ["read", "write", "delete", "manage", "create", "update"];
    return `${ctx.prng.pick(resources)}:${ctx.prng.pick(actions)}`;
  },
  oauth_scope: (_params, ctx) => {
    const scopes = [
      "openid",
      "profile",
      "email",
      "read:user",
      "write:user",
      "read:repos",
      "write:repos",
      "admin:org",
      "read:org",
      "read:packages",
      "delete:packages",
      "repo",
      "gist",
      "notifications",
      "user:follow",
      "read:discussion"
    ];
    const count = ctx.prng.nextInt(1, 4);
    const picked = ctx.prng.shuffle([...scopes]).slice(0, count);
    return picked.join(" ");
  },
  license_key: licenseKeyGenerator,
  totp_secret: totpSecretGenerator,
  jwt_token: jwtTokenGenerator,
  // ── Chaos Testing ──────────────────────────────────────
  unicode_string: unicodeStringGenerator,
  long_string: longStringGenerator,
  boundary_integer: boundaryIntegerGenerator,
  empty_string: emptyStringGenerator,
  error_value: errorValueGenerator,
  future_proof_date: futureProofDateGenerator,
  // ── Logic ──────────────────────────────────────────────
  boolean: booleanGenerator,
  enum: enumGenerator,
  integer: integerGenerator,
  ref: refGenerator,
  sequence: sequenceGenerator,
  constant: constantGenerator,
  // ── Stubs ──────────────────────────────────────────────
  nullable: (_params, _ctx) => null,
  // Handled in generator.ts
  iban: (_params, ctx) => {
    const ibanFormats = {
      de: { prefix: "DE", bbanLength: 20 },
      fr: { prefix: "FR", bbanLength: 25 },
      es: { prefix: "ES", bbanLength: 22 },
      it: { prefix: "IT", bbanLength: 25 },
      nl: { prefix: "NL", bbanLength: 14 },
      pt: { prefix: "PT", bbanLength: 23 },
      pl: { prefix: "PL", bbanLength: 24 },
      se: { prefix: "SE", bbanLength: 22 },
      da: { prefix: "DK", bbanLength: 16 },
      nb: { prefix: "NO", bbanLength: 13 },
      hr: { prefix: "HR", bbanLength: 19 },
      en: { prefix: "GB", bbanLength: 18 },
      ar: { prefix: "SA", bbanLength: 22 },
      tr: { prefix: "TR", bbanLength: 24 }
    };
    const format = ibanFormats[ctx.locale] ?? ibanFormats.de;
    const checkDigits = String(ctx.prng.nextInt(10, 99));
    const bban = Array.from({ length: format.bbanLength }, () => ctx.prng.nextInt(0, 9)).join("");
    return `${format.prefix}${checkDigits}${bban}`;
  },
  vat_number: (_params, ctx) => {
    const vatPrefixes = {
      de: "DE",
      fr: "FR",
      es: "ES",
      it: "IT",
      nl: "NL",
      pt: "PT",
      pl: "PL",
      se: "SE",
      da: "DK",
      nb: "NO",
      hr: "HR",
      en: "GB"
    };
    const prefix = vatPrefixes[ctx.locale] ?? "DE";
    return `${prefix}${ctx.prng.nextInt(1e8, 999999999)}`;
  }
};

// ../../src/lib/engine/locale-resolver.ts
var COUNTRY_TO_LOCALE = {
  // English-speaking
  US: "en",
  USA: "en",
  "United States": "en",
  GB: "en",
  UK: "en",
  "United Kingdom": "en",
  AU: "en",
  Australia: "en",
  CA: "en",
  Canada: "en",
  NZ: "en",
  "New Zealand": "en",
  IE: "en",
  Ireland: "en",
  ZA: "en",
  "South Africa": "en",
  // French-speaking
  FR: "fr",
  France: "fr",
  BE: "fr",
  Belgium: "fr",
  LU: "fr",
  Luxembourg: "fr",
  SN: "fr",
  Senegal: "fr",
  CI: "fr",
  "Ivory Coast": "fr",
  // German-speaking
  DE: "de",
  Germany: "de",
  AT: "de",
  Austria: "de",
  CH: "de",
  Switzerland: "de",
  // Spanish-speaking
  ES: "es",
  Spain: "es",
  MX: "es",
  Mexico: "es",
  AR: "es",
  Argentina: "es",
  CO: "es",
  Colombia: "es",
  CL: "es",
  Chile: "es",
  PE: "es",
  Peru: "es",
  VE: "es",
  Venezuela: "es",
  EC: "es",
  Ecuador: "es",
  // Russian-speaking
  RU: "ru",
  Russia: "ru",
  BY: "ru",
  Belarus: "ru",
  KZ: "ru",
  Kazakhstan: "ru",
  UA: "ru",
  Ukraine: "ru",
  // Chinese-speaking
  CN: "zh",
  China: "zh",
  TW: "zh",
  Taiwan: "zh",
  HK: "zh",
  "Hong Kong": "zh",
  SG: "zh",
  Singapore: "zh",
  // Arabic-speaking
  SA: "ar",
  "Saudi Arabia": "ar",
  AE: "ar",
  "United Arab Emirates": "ar",
  EG: "ar",
  Egypt: "ar",
  MA: "ar",
  Morocco: "ar",
  IQ: "ar",
  Iraq: "ar",
  JO: "ar",
  Jordan: "ar",
  QA: "ar",
  Qatar: "ar",
  KW: "ar",
  Kuwait: "ar",
  BH: "ar",
  Bahrain: "ar",
  OM: "ar",
  Oman: "ar",
  // Italian
  IT: "it",
  Italy: "it",
  // Japanese
  JP: "ja",
  Japan: "ja",
  // Hindi
  IN: "hi",
  India: "hi",
  // Portuguese-speaking
  BR: "pt",
  Brazil: "pt",
  PT: "pt",
  Portugal: "pt",
  AO: "pt",
  Angola: "pt",
  MZ: "pt",
  Mozambique: "pt",
  // Indonesian/Malay
  ID: "id",
  Indonesia: "id",
  MY: "id",
  Malaysia: "id",
  // Korean
  KR: "ko",
  "South Korea": "ko",
  // Turkish
  TR: "tr",
  Turkey: "tr",
  T\u00FCrkiye: "tr",
  // Persian-speaking
  IR: "fa",
  Iran: "fa",
  AF: "fa",
  Afghanistan: "fa",
  TJ: "fa",
  Tajikistan: "fa",
  // Polish
  PL: "pl",
  Poland: "pl",
  // Dutch
  NL: "nl",
  Netherlands: "nl",
  // Swedish
  SE: "sv",
  Sweden: "sv",
  // Danish
  DK: "da",
  Denmark: "da",
  // Norwegian
  NO: "nb",
  Norway: "nb",
  // Thai
  TH: "th",
  Thailand: "th",
  // Croatian
  HR: "hr",
  Croatia: "hr",
  BA: "hr",
  "Bosnia and Herzegovina": "hr",
  ME: "hr",
  Montenegro: "hr"
};
function findLocaleDeterminingFields(fields) {
  const result = [];
  for (const field of fields) {
    if (field.type === "country") {
      result.push(field.name);
      continue;
    }
    if (field.type === "enum" && field.params?.values) {
      const values = field.params.values;
      const countryCodeCount = values.filter(
        (v) => typeof v === "string" && COUNTRY_TO_LOCALE[v] !== void 0
      ).length;
      if (countryCodeCount > values.length * 0.5) {
        result.push(field.name);
      }
    }
  }
  return result;
}
function resolveRowLocale(record, localeDeterminingFields, fallback) {
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

// ../../src/lib/engine/generator.ts
async function generate(request) {
  const startTime = performance.now();
  const defaultLocale = request.locale ?? "en";
  await loadLocaleData(defaultLocale);
  for (const loc of SUPPORTED_LOCALES) {
    await loadLocaleData(loc);
  }
  const sortResult = topologicalSort(request.tables);
  if (!sortResult.success) {
    return { success: false, cycle: sortResult.cycle };
  }
  const prng = createPRNG(request.seed);
  const tableData = {};
  for (const table of sortResult.sorted) {
    const records = [];
    const localeDeterminingFields = findLocaleDeterminingFields(table.fields);
    const hasAutoLocale = localeDeterminingFields.length > 0;
    const localeFields = hasAutoLocale ? table.fields.filter((f) => localeDeterminingFields.includes(f.name)) : [];
    const otherFields = hasAutoLocale ? table.fields.filter((f) => !localeDeterminingFields.includes(f.name)) : table.fields;
    for (let rowIndex = 0; rowIndex < table.count; rowIndex++) {
      const record = {};
      if (hasAutoLocale) {
        const context2 = {
          prng,
          locale: defaultLocale,
          tableData,
          currentRecord: record,
          rowIndex
        };
        for (const field of localeFields) {
          const generator = GENERATOR_REGISTRY[field.type];
          if (!generator) {
            record[field.name] = null;
            continue;
          }
          if (field.nullable) {
            const nullRate = field.params?.null_rate ?? 0.15;
            if (prng.chance(nullRate)) {
              record[field.name] = null;
              continue;
            }
          }
          try {
            record[field.name] = generator(field.params ?? {}, context2);
          } catch {
            record[field.name] = null;
          }
        }
      }
      const rowLocale = hasAutoLocale ? resolveRowLocale(record, localeDeterminingFields, defaultLocale) : defaultLocale;
      const context = {
        prng,
        locale: rowLocale,
        tableData,
        currentRecord: record,
        rowIndex
      };
      for (const field of otherFields) {
        const generator = GENERATOR_REGISTRY[field.type];
        if (!generator) {
          record[field.name] = null;
          continue;
        }
        if (field.nullable) {
          const nullRate = field.params?.null_rate ?? 0.15;
          if (prng.chance(nullRate)) {
            record[field.name] = null;
            continue;
          }
        }
        try {
          record[field.name] = generator(field.params ?? {}, context);
        } catch (err2) {
          console.error(`Generator error for ${table.name}.${field.name}:`, err2);
          record[field.name] = null;
        }
      }
      records.push(record);
    }
    tableData[table.name] = records;
  }
  const endTime = performance.now();
  const recordsPerTable = {};
  let totalRecords = 0;
  for (const table of request.tables) {
    recordsPerTable[table.name] = table.count;
    totalRecords += table.count;
  }
  return {
    success: true,
    result: {
      data: tableData,
      meta: {
        tables: request.tables.length,
        total_records: totalRecords,
        records_per_table: recordsPerTable,
        locale: defaultLocale,
        format: request.format ?? "json",
        seed: prng.seed,
        generation_time_ms: Math.round(endTime - startTime)
      }
    }
  };
}

// ../../src/lib/engine/schema-detector.ts
function splitColumnsBlock(block) {
  const results = [];
  let depth = 0;
  let current = "";
  for (const ch of block) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      const trimmed2 = current.trim();
      if (trimmed2) results.push(trimmed2);
      current = "";
    } else {
      current += ch;
    }
  }
  const trimmed = current.trim();
  if (trimmed) results.push(trimmed);
  return results;
}
function detectFromSql(sql) {
  const tables = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|")?(\w+)(?:`|")?\s*\(([\s\S]*?)(?:\);|\)\s*;)/gi;
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase();
    const columnsBlock = match[2];
    const fields = [];
    const lines = splitColumnsBlock(columnsBlock);
    for (const line of lines) {
      if (/^\s*(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT|INDEX)/i.test(line)) {
        continue;
      }
      const colMatch = line.match(/^(?:`|")?(\w+)(?:`|")?\s+(\w+(?:\([^)]*\))?)/i);
      if (!colMatch) continue;
      const colName = colMatch[1].toLowerCase();
      const sqlType2 = colMatch[2].toUpperCase();
      const mapped = mapSqlType(colName, sqlType2);
      const field = {
        name: colName,
        type: mapped.type,
        ...mapped.params ? { params: mapped.params } : {}
      };
      const refMatch = line.match(/REFERENCES\s+(?:`|")?(\w+)(?:`|")?\s*\((?:`|")?(\w+)(?:`|")?\)/i);
      if (refMatch) {
        field.type = "ref";
        field.params = { table: refMatch[1].toLowerCase(), field: refMatch[2].toLowerCase() };
      }
      const checkMatch = line.match(/CHECK\s*\(\s*\w+\s+IN\s*\((.*?)\)\s*\)/i);
      if (checkMatch) {
        field.type = "enum";
        field.params = {
          values: checkMatch[1].split(",").map((v) => v.trim().replace(/'/g, ""))
        };
      }
      fields.push(field);
    }
    tables.push({
      name: tableName,
      count: 50,
      fields
    });
  }
  return { tables };
}
function mapSqlType(colName, sqlType2) {
  const name = colName.toLowerCase();
  if (name === "id") return { type: sqlType2.includes("UUID") ? "uuid" : "id" };
  if (name.endsWith("_id")) return { type: "uuid" };
  if (name === "email" || name.includes("email")) return { type: "email" };
  if (name === "phone" || name.includes("phone")) return { type: "phone" };
  if (name === "first_name" || name === "firstname") return { type: "first_name" };
  if (name === "last_name" || name === "lastname") return { type: "last_name" };
  if (name === "name" || name === "full_name" || name === "fullname") return { type: "full_name" };
  if (name === "username") return { type: "username" };
  if (name === "password" || name === "password_hash") return { type: "password_hash" };
  if (name === "avatar" || name === "avatar_url" || name === "image_url") return { type: "avatar_url" };
  if (name === "bio" || name === "biography" || name === "about") return { type: "bio" };
  if (name === "address" || name === "street") return { type: "address" };
  if (name === "city") return { type: "city" };
  if (name === "state" || name === "province") return { type: "state_province" };
  if (name === "country") return { type: "country" };
  if (name === "postal_code" || name === "zip" || name === "zip_code") return { type: "postal_code" };
  if (name === "url" || name === "website" || name === "link") return { type: "url" };
  if (name === "title") return { type: "title" };
  if (name === "slug") return { type: "slug" };
  if (name === "description" || name === "content" || name === "body") return { type: "paragraph" };
  if (name === "role") return { type: "role" };
  if (name === "status") return { type: "enum", params: { values: ["active", "inactive", "pending", "archived"] } };
  if (name === "rating") return { type: "rating" };
  if (name === "price" || name === "cost") return { type: "price" };
  if (name === "amount" || name === "total") return { type: "amount" };
  if (name === "currency") return { type: "currency" };
  if (name === "ip" || name === "ip_address") return { type: "ip_address" };
  if (name === "age") return { type: "age" };
  if (name === "gender") return { type: "gender" };
  if (name === "department") return { type: "department" };
  if (name === "company" || name === "company_name") return { type: "company_name" };
  if (name === "job_title" || name === "position") return { type: "job_title" };
  if (name.includes("latitude") || name === "lat") return { type: "latitude" };
  if (name.includes("longitude") || name === "lng" || name === "lon") return { type: "longitude" };
  if (name.includes("created") || name.includes("updated") || name.includes("deleted")) return { type: "datetime" };
  if (sqlType2.includes("UUID")) return { type: "uuid" };
  if (sqlType2.includes("SERIAL") || sqlType2.includes("BIGSERIAL")) return { type: "id" };
  if (sqlType2 === "BOOLEAN" || sqlType2 === "BOOL" || sqlType2 === "TINYINT(1)") return { type: "boolean" };
  if (sqlType2.includes("TIMESTAMP") || sqlType2.includes("DATETIME")) return { type: "datetime" };
  if (sqlType2 === "DATE") return { type: "date" };
  if (sqlType2 === "TIME") return { type: "time" };
  if (sqlType2.includes("DECIMAL") || sqlType2.includes("NUMERIC") || sqlType2.includes("FLOAT") || sqlType2.includes("DOUBLE")) return { type: "decimal" };
  if (sqlType2.includes("INT")) return { type: "integer" };
  if (sqlType2.includes("TEXT") || sqlType2.includes("VARCHAR") || sqlType2.includes("CHAR")) return { type: "sentence" };
  if (sqlType2.includes("JSON") || sqlType2.includes("JSONB")) return { type: "json" };
  return { type: "sentence" };
}
function detectFromJson(sample) {
  const fields = [];
  for (const [key, value] of Object.entries(sample)) {
    const inferred = inferTypeFromValue(key, value);
    fields.push({
      name: key,
      type: inferred.type,
      ...inferred.params ? { params: inferred.params } : {}
    });
  }
  return {
    tables: [{
      name: "records",
      count: 50,
      fields
    }]
  };
}
function inferTypeFromValue(key, value) {
  const name = key.toLowerCase();
  if (name === "id" || name.endsWith("_id")) return { type: "uuid" };
  if (name === "email" || name.includes("email")) return { type: "email" };
  if (name === "phone" || name.includes("phone")) return { type: "phone" };
  if (name === "first_name" || name === "firstname") return { type: "first_name" };
  if (name === "last_name" || name === "lastname") return { type: "last_name" };
  if (name === "name" || name === "full_name") return { type: "full_name" };
  if (name === "username") return { type: "username" };
  if (name === "password" || name.includes("password")) return { type: "password_hash" };
  if (name === "bio" || name === "about") return { type: "bio" };
  if (name === "city") return { type: "city" };
  if (name === "country") return { type: "country" };
  if (name === "address") return { type: "address" };
  if (name === "url" || name === "website") return { type: "url" };
  if (name === "title") return { type: "title" };
  if (name === "slug") return { type: "slug" };
  if (name === "price" || name === "cost") return { type: "price" };
  if (name === "amount" || name === "total") return { type: "amount" };
  if (name === "rating") return { type: "rating" };
  if (name === "age") return { type: "age" };
  if (name === "gender") return { type: "gender" };
  if (name === "role") return { type: "role" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { type: "integer" };
    return { type: "decimal" };
  }
  if (typeof value === "string") {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return { type: "uuid" };
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return { type: "datetime" };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: "date" };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { type: "email" };
    if (/^https?:\/\//.test(value)) return { type: "url" };
    if (value.length > 200) return { type: "paragraph" };
    return { type: "sentence" };
  }
  if (Array.isArray(value)) return { type: "array" };
  if (typeof value === "object" && value !== null) return { type: "json" };
  return { type: "sentence" };
}

// ../../src/lib/engine/templates/ecommerce.ts
var ecommerceTemplate = {
  id: "ecommerce",
  name: "E-Commerce",
  description: "Storefront with customers, products, orders, line items, and reviews. Weighted country distribution triggers auto-locale for names, emails, and addresses.",
  tables: ["customers", "products", "orders", "order_items", "reviews"],
  default_counts: {
    customers: 100,
    products: 50,
    orders: 300,
    order_items: 900,
    reviews: 200
  },
  schema: {
    tables: [
      {
        name: "customers",
        count: 100,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "ES"],
              weights: [35, 15, 15, 12, 12, 11]
            }
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "phone", type: "phone" },
          { name: "address", type: "address" },
          { name: "city", type: "city" },
          { name: "postal_code", type: "postal_code" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
          { name: "is_active", type: "boolean", params: { probability: 0.92 } }
        ]
      },
      {
        name: "products",
        count: 50,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "product_name" },
          { name: "description", type: "product_description" },
          {
            name: "category",
            type: "enum",
            params: {
              values: ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Toys"],
              weights: [25, 25, 15, 15, 10, 10]
            }
          },
          { name: "price", type: "price", params: { min: 4.99, max: 499.99 } },
          { name: "sku", type: "sku" },
          { name: "image_url", type: "image_url" },
          { name: "stock_quantity", type: "integer", params: { min: 0, max: 500 } },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2026-01-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "orders",
        count: 300,
        fields: [
          { name: "id", type: "uuid" },
          { name: "order_number", type: "sequence", params: { prefix: "ORD-", start: 1001 } },
          { name: "customer_id", type: "ref", params: { table: "customers", field: "id" } },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
              weights: [8, 12, 15, 50, 10, 5]
            }
          },
          { name: "total", type: "price", params: { min: 9.99, max: 1299.99 } },
          { name: "currency", type: "currency" },
          {
            name: "payment_method",
            type: "enum",
            params: { values: ["credit_card", "paypal", "apple_pay", "bank_transfer"], weights: [45, 25, 20, 10] }
          },
          { name: "ordered_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "order_items",
        count: 900,
        fields: [
          { name: "id", type: "uuid" },
          { name: "order_id", type: "ref", params: { table: "orders", field: "id" } },
          { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
          { name: "quantity", type: "integer", params: { min: 1, max: 5 } },
          { name: "unit_price", type: "price", params: { min: 4.99, max: 499.99 } }
        ]
      },
      {
        name: "reviews",
        count: 200,
        fields: [
          { name: "id", type: "uuid" },
          { name: "customer_id", type: "ref", params: { table: "customers", field: "id" } },
          { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
          { name: "rating", type: "rating" },
          { name: "title", type: "title" },
          { name: "body", type: "review" },
          { name: "created_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } }
        ]
      }
    ]
  }
};

// ../../src/lib/engine/templates/blog.ts
var blogTemplate = {
  id: "blog",
  name: "Blog",
  description: "Multi-author blog with posts, comments, tags, and a proper post_tags junction table. Country field on authors triggers locale-aware names.",
  tables: ["authors", "posts", "comments", "tags", "post_tags"],
  default_counts: {
    authors: 30,
    posts: 150,
    comments: 600,
    tags: 20,
    post_tags: 400
  },
  schema: {
    tables: [
      {
        name: "authors",
        count: 30,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR"],
              weights: [30, 20, 15, 12, 12, 11]
            }
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "username", type: "username" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "bio", type: "bio" },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-01-01" } }
        ]
      },
      {
        name: "posts",
        count: 150,
        fields: [
          { name: "id", type: "uuid" },
          { name: "author_id", type: "ref", params: { table: "authors", field: "id" } },
          { name: "title", type: "title" },
          { name: "slug", type: "slug" },
          { name: "excerpt", type: "sentence" },
          { name: "content", type: "markdown" },
          { name: "featured_image", type: "image_url" },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["draft", "published", "archived"],
              weights: [10, 80, 10]
            }
          },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2025-12-31" } },
          { name: "published_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "comments",
        count: 600,
        fields: [
          { name: "id", type: "uuid" },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "commenter_name", type: "full_name" },
          { name: "commenter_email", type: "email" },
          { name: "body", type: "paragraph" },
          {
            name: "is_approved",
            type: "boolean",
            params: { probability: 0.85 }
          },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "tags",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "tag" },
          { name: "slug", type: "slug" }
        ]
      },
      {
        name: "post_tags",
        count: 400,
        fields: [
          { name: "id", type: "uuid" },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "tag_id", type: "ref", params: { table: "tags", field: "id" } }
        ]
      }
    ]
  }
};

// ../../src/lib/engine/templates/saas.ts
var saasTemplate = {
  id: "saas",
  name: "SaaS",
  description: "Multi-tenant SaaS with organizations, team members, subscriptions, and invoices. Invoices reference subscriptions. Country field triggers locale-aware user data.",
  tables: ["organizations", "members", "subscriptions", "invoices"],
  default_counts: {
    organizations: 20,
    members: 100,
    subscriptions: 20,
    invoices: 120
  },
  schema: {
    tables: [
      {
        name: "organizations",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "company_name" },
          { name: "slug", type: "slug" },
          { name: "domain", type: "domain" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR", "AU"],
              weights: [30, 15, 13, 10, 10, 10, 12]
            }
          },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-01-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "members",
        count: 100,
        fields: [
          { name: "id", type: "uuid" },
          { name: "org_id", type: "ref", params: { table: "organizations", field: "id" } },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR", "AU"],
              weights: [30, 15, 13, 10, 10, 10, 12]
            }
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          {
            name: "role",
            type: "enum",
            params: {
              values: ["owner", "admin", "member", "viewer"],
              weights: [5, 15, 60, 20]
            }
          },
          { name: "job_title", type: "job_title" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "invited_at", type: "datetime", params: { min: "2023-06-01", max: "2026-03-01" } }
        ]
      },
      {
        name: "subscriptions",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "org_id", type: "ref", params: { table: "organizations", field: "id" } },
          {
            name: "plan",
            type: "enum",
            params: {
              values: ["starter", "pro", "enterprise"],
              weights: [40, 40, 20]
            }
          },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["active", "past_due", "cancelled", "trialing"],
              weights: [65, 10, 15, 10]
            }
          },
          {
            name: "interval",
            type: "enum",
            params: { values: ["monthly", "yearly"], weights: [60, 40] }
          },
          {
            name: "amount",
            type: "enum",
            params: {
              values: ["29.00", "79.00", "199.00", "290.00", "790.00", "1990.00"],
              weights: [25, 25, 10, 15, 15, 10]
            }
          },
          { name: "currency", type: "currency" },
          { name: "current_period_start", type: "datetime", params: { min: "2026-02-01", max: "2026-03-20" } },
          { name: "current_period_end", type: "date_future", params: { min: 1, max: 30 } },
          { name: "trial_end", type: "date_future", params: { min: 1, max: 14 } },
          { name: "started_at", type: "datetime", params: { min: "2024-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "invoices",
        count: 120,
        fields: [
          { name: "id", type: "uuid" },
          { name: "invoice_number", type: "sequence", params: { prefix: "INV-", start: 1001 } },
          { name: "subscription_id", type: "ref", params: { table: "subscriptions", field: "id" } },
          {
            name: "amount",
            type: "enum",
            params: {
              values: ["29.00", "79.00", "199.00", "290.00", "790.00", "1990.00"],
              weights: [25, 25, 10, 15, 15, 10]
            }
          },
          { name: "currency", type: "currency" },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["paid", "pending", "overdue", "void"],
              weights: [72, 13, 10, 5]
            }
          },
          { name: "issued_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } },
          { name: "due_date", type: "date_future", params: { min: 1, max: 30 } }
        ]
      }
    ]
  }
};

// ../../src/lib/engine/templates/social.ts
var socialTemplate = {
  id: "social",
  name: "Social Network",
  description: "Social platform with users, posts, likes, follows, and direct messages. Country field drives locale-aware names across the network.",
  tables: ["users", "posts", "likes", "follows", "messages"],
  default_counts: {
    users: 150,
    posts: 600,
    likes: 3e3,
    follows: 2e3,
    messages: 1e3
  },
  schema: {
    tables: [
      {
        name: "users",
        count: 150,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "BR", "JP", "DE", "FR", "KR", "ES"],
              weights: [25, 12, 14, 12, 10, 9, 10, 8]
            }
          },
          { name: "username", type: "username" },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "display_name", type: "full_name" },
          { name: "bio", type: "bio" },
          { name: "is_verified", type: "boolean", params: { probability: 0.03 } },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "posts",
        count: 600,
        fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "content", type: "sentence" },
          { name: "hashtag", type: "hashtag" },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "likes",
        count: 3e3,
        fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "follows",
        count: 2e3,
        fields: [
          { name: "id", type: "uuid" },
          { name: "follower_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "following_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "created_at", type: "datetime", params: { min: "2023-06-01", max: "2026-03-20" } }
        ]
      },
      {
        name: "messages",
        count: 1e3,
        fields: [
          { name: "id", type: "uuid" },
          { name: "sender_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "receiver_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "body", type: "sentence" },
          { name: "is_read", type: "boolean", params: { probability: 0.72 } },
          { name: "sent_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } }
        ]
      }
    ]
  }
};

// ../../src/lib/engine/templates/index.ts
var TEMPLATE_REGISTRY = {
  ecommerce: ecommerceTemplate,
  blog: blogTemplate,
  saas: saasTemplate,
  social: socialTemplate
};
function listTemplates() {
  return Object.values(TEMPLATE_REGISTRY).map(
    ({ id, name, description, tables, default_counts }) => ({
      id,
      name,
      description,
      tables,
      default_counts
    })
  );
}
function generateFromTemplate(options) {
  const template = TEMPLATE_REGISTRY[options.template];
  if (!template) {
    throw new Error(`Unknown template: "${options.template}"`);
  }
  const rawScale = options.scale ?? 1;
  if (rawScale < 0) {
    throw new Error(`Invalid scale: ${rawScale}. Scale must be a positive number (e.g. 0.5 for half, 2 for double).`);
  }
  const scale = Math.min(Math.max(rawScale, 0.01), 100);
  const tables = template.schema.tables.map((table) => ({
    ...table,
    count: Math.max(1, Math.round(table.count * scale))
  }));
  const request = {
    ...template.schema,
    tables
  };
  if (options.locale !== void 0) {
    request.locale = options.locale;
  }
  if (options.format !== void 0) {
    request.format = options.format;
  }
  if (options.sql_dialect !== void 0) {
    request.sql_dialect = options.sql_dialect;
  }
  if (options.seed !== void 0) {
    request.seed = options.seed;
  }
  return request;
}

// ../../src/lib/engine/field-type-catalog.ts
var FIELD_TYPE_CATALOG = {
  identity: {
    first_name: { description: "Locale-aware first name", params: { locale: "string (en, de, fr, es, hr)" }, example: "Maximilian" },
    last_name: { description: "Locale-aware last name", params: { locale: "string" }, example: "Bergmann" },
    full_name: { description: "First + last name combined", params: {}, example: "Maximilian Bergmann" },
    email: { description: "Realistic email derived from name", params: { domain: "string (optional, e.g. 'company.de')" }, example: "maximilian.bergmann@outlook.de" },
    username: { description: "Username derived from name", params: {}, example: "mbergmann42" },
    phone: { description: "Country-formatted phone number", params: { locale: "string" }, example: "+49 151 2345 6789" },
    avatar_url: { description: "URL to DiceBear avatar", params: {}, example: "https://api.dicebear.com/7.x/avataaars/svg?seed=42" },
    gender: { description: "Gender with configurable values and weights", params: { values: "string[] (default: male, female, non-binary, prefer_not_to_say)", weights: "number[]" }, example: "female" },
    date_of_birth: { description: "Realistic date of birth with age range constraints", params: { min_age: "number (default 18)", max_age: "number (default 80)" }, example: "1994-07-12" }
  },
  location: {
    city: { description: "Real city name from locale", params: {}, example: "Berlin" },
    country: { description: "Country name or code", params: { code: "boolean (return ISO code if true)" }, example: "Germany" },
    postal_code: { description: "Valid postal code format for locale", params: {}, example: "10115" },
    state_province: { description: "State or province", params: {}, example: "California" },
    address: { description: "Full street address with city and postal", params: {}, example: "Friedrichstra\xDFe 42, 10117 Berlin" },
    latitude: { description: "Latitude coordinate", params: { min: "number", max: "number" }, example: 52.520008 },
    longitude: { description: "Longitude coordinate", params: { min: "number", max: "number" }, example: 13.404954 },
    timezone: { description: "IANA timezone string, region-aware", params: {}, example: "Europe/Berlin" }
  },
  business: {
    company_name: { description: "Realistic company name", params: {}, example: "Digital Solutions" },
    job_title: { description: "Realistic job title", params: {}, example: "Senior Software Engineer" },
    department: { description: "Standard department name", params: {}, example: "Engineering" },
    product_name: { description: "Realistic product name", params: { category: "string (electronics, clothing, food, home, software)" }, example: "Wireless Bluetooth Headphones" },
    price: { description: "Price with min/max range", params: { min: "number", max: "number", precision: "number" }, example: 79.95 },
    amount: { description: "Alias for price", params: { min: "number", max: "number", precision: "number" }, example: 249.99 },
    decimal: { description: "Decimal number in range", params: { min: "number", max: "number", precision: "number" }, example: 42.5 },
    currency: { description: "ISO currency code", params: {}, example: "EUR" },
    rating: { description: "Rating (skewed toward 4-5)", params: { min: "number", max: "number", precision: "number" }, example: 4.5 },
    sku: { description: "Product SKU code", params: { prefix: "string (optional)" }, example: "BLK-SHOE-42-001" },
    credit_card_number: { description: "Luhn-valid fake credit card number", params: { network: "string (visa, mastercard, amex)" }, example: "4532015112830366" },
    tracking_number: { description: "Carrier-specific shipping tracking number", params: { carrier: "string (ups, fedex, usps, dhl)" }, example: "1Z999AA10123456784" }
  },
  temporal: {
    datetime: { description: "ISO 8601 datetime", params: { min: "string (ISO date)", max: "string (ISO date)" }, example: "2024-07-14T09:23:41.000Z" },
    date: { description: "ISO date (no time)", params: { min: "string", max: "string" }, example: "2024-07-14" },
    time: { description: "Time string HH:MM:SS", params: {}, example: "14:30:22" },
    timestamp: { description: "Unix timestamp (seconds)", params: { min: "string", max: "string" }, example: 1720947821 },
    age: { description: "Integer age", params: { min: "number (default 18)", max: "number (default 80)" }, example: 34 },
    date_range: { description: "Two correlated dates (start < end) for bookings, reservations, projects", params: { min_gap_days: "number (default 1)", max_gap_days: "number (default 30)", min_date: "string", max_date: "string" }, example: { start: "2026-01-10", end: "2026-01-17" } }
  },
  technical: {
    uuid: { description: "v4 UUID", params: {}, example: "a1b2c3d4-e5f6-4890-abcd-ef1234567890" },
    id: { description: "Auto-incrementing integer", params: { start: "number (default 1)", step: "number (default 1)" }, example: 1 },
    ip_address: { description: "IPv4 or IPv6 address", params: { version: "string (v4 or v6)" }, example: "192.168.1.42" },
    mac_address: { description: "MAC address", params: {}, example: "3A:F5:C2:9B:1D:E8" },
    url: { description: "Realistic URL", params: {}, example: "https://example.com/blog" },
    domain: { description: "Domain name", params: {}, example: "techapp.io" },
    user_agent: { description: "Real browser user agent", params: {}, example: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2)..." },
    color_hex: { description: "Hex color code", params: {}, example: "#6C5CE7" },
    embedding_vector: { description: "Float vector for pgvector/Pinecone/Weaviate testing", params: { dimensions: "number (default 1536)" }, example: [0.0234, -0.1847, 0.5612, "..."] }
  },
  content: {
    sentence: { description: "Realistic sentence (not lorem ipsum)", params: { min_words: "number", max_words: "number" }, example: "The team improved API reliability." },
    paragraph: { description: "Multiple realistic sentences", params: { min: "number (sentences)", max: "number (sentences)" }, example: "The team improved..." },
    title: { description: "Article/blog-style title", params: {}, example: "Complete Guide to API Design" },
    slug: { description: "URL-friendly slug from title", params: {}, example: "complete-guide-to-api-design" },
    tag: { description: "Realistic tag/category", params: {}, example: "typescript" },
    review: { description: "Short product review", params: {}, example: "Great product, exactly what I needed." },
    image_url: { description: "Placeholder image URL", params: { width: "number", height: "number" }, example: "https://picsum.photos/seed/42/640/480" },
    file_path: { description: "Realistic file path", params: {}, example: "/documents/report-q4-2024.pdf" },
    markdown: { description: "Realistic Markdown content with headers, lists, code blocks", params: { length: "string (short, medium, long)" }, example: "## Getting Started\n\nThis guide walks you through..." }
  },
  logic: {
    boolean: { description: "True/false with configurable probability", params: { probability: "number (0-1, probability of true)" }, example: true },
    enum: { description: "Pick from values with optional weights", params: { values: "array (required)", weights: "array (optional, same length as values)" }, example: "active" },
    integer: { description: "Integer in range", params: { min: "number", max: "number" }, example: 42 },
    ref: { description: "Foreign key to another table (THE KILLER FEATURE)", params: { table: "string (required)", field: "string (required)", distribution: "string (uniform or power_law)" }, example: "a1b2c3d4-e5f6-4890-abcd-ef1234567890" },
    sequence: { description: "Auto-incrementing with prefix/suffix", params: { start: "number", step: "number", prefix: "string", suffix: "string" }, example: "ORD-1001" },
    constant: { description: "Fixed value", params: { value: "any" }, example: "active" }
  },
  security_testing: {
    password_hash: { description: "Bcrypt or Argon2 format hash for direct DB seeding \u2014 no hashing needed", params: { rounds: "number (default 10)", algorithm: "string (bcrypt, argon2)" }, example: "$2b$10$EixZaYVK1fsbw1ZfbX3OXe..." },
    xss_string: { description: "XSS payloads for security testing your input sanitization", params: {}, example: '<script>alert("xss")</script>' },
    sql_injection_string: { description: "SQL injection payloads for testing parameterized queries", params: {}, example: "'; DROP TABLE users; --" }
  },
  locales: ["en", "de", "fr", "es", "ru", "zh", "ar", "it", "ja", "hi", "pt", "nl", "sv", "da", "nb", "th", "id", "ko", "tr", "fa", "pl", "hr"],
  formats: ["json", "csv", "sql"],
  sql_dialects: ["postgres", "mysql", "sqlite"]
};

// ../../src/lib/engine/formatters/csv-formatter.ts
function escapeCSV(value) {
  if (value === null || value === void 0) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function formatCSV(data, tables) {
  const result = {};
  const tableFieldOrder = /* @__PURE__ */ new Map();
  if (tables) {
    for (const t of tables) {
      tableFieldOrder.set(t.name, t.fields.map((f) => f.name));
    }
  }
  for (const [tableName, records] of Object.entries(data)) {
    if (records.length === 0) {
      result[tableName] = "";
      continue;
    }
    const headers = tableFieldOrder.get(tableName) ?? Object.keys(records[0]);
    const lines = [];
    lines.push(headers.map(escapeCSV).join(","));
    for (const record of records) {
      lines.push(headers.map((h) => escapeCSV(record[h])).join(","));
    }
    result[tableName] = lines.join("\n");
  }
  return result;
}

// ../../src/lib/engine/formatters/sql-formatter.ts
function quoteIdent(name, dialect) {
  if (dialect === "mysql") {
    return "`" + name.replace(/`/g, "``") + "`";
  }
  return '"' + name.replace(/"/g, '""') + '"';
}
function sqlType(fieldType, dialect) {
  const typeMap = {
    postgres: {
      uuid: "UUID",
      id: "SERIAL",
      boolean: "BOOLEAN",
      integer: "INTEGER",
      decimal: "NUMERIC",
      price: "NUMERIC",
      amount: "NUMERIC",
      datetime: "TIMESTAMPTZ",
      date: "DATE",
      time: "TIME",
      timestamp: "BIGINT",
      age: "INTEGER",
      rating: "NUMERIC",
      sequence: "TEXT",
      // ref fields reference UUIDs from other tables
      ref: "UUID",
      // Complex types that return objects/arrays → JSONB in Postgres
      date_range: "JSONB",
      salary: "JSONB",
      embedding_vector: "JSONB",
      latitude: "NUMERIC",
      longitude: "NUMERIC"
    },
    mysql: {
      uuid: "CHAR(36)",
      id: "INT AUTO_INCREMENT",
      boolean: "TINYINT(1)",
      integer: "INT",
      decimal: "DECIMAL(10,2)",
      price: "DECIMAL(10,2)",
      amount: "DECIMAL(10,2)",
      datetime: "DATETIME",
      date: "DATE",
      time: "TIME",
      timestamp: "BIGINT",
      age: "INT",
      rating: "DECIMAL(3,1)",
      sequence: "VARCHAR(255)",
      // ref fields reference UUIDs from other tables
      ref: "CHAR(36)",
      // Complex types → JSON in MySQL
      date_range: "JSON",
      salary: "JSON",
      embedding_vector: "JSON",
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)"
    },
    sqlite: {
      uuid: "TEXT",
      id: "INTEGER",
      boolean: "INTEGER",
      integer: "INTEGER",
      decimal: "REAL",
      price: "REAL",
      amount: "REAL",
      datetime: "TEXT",
      date: "TEXT",
      time: "TEXT",
      timestamp: "INTEGER",
      age: "INTEGER",
      rating: "REAL",
      sequence: "TEXT",
      // ref fields reference UUIDs from other tables
      ref: "TEXT",
      // SQLite has no JSON type — use TEXT (JSON stored as string)
      date_range: "TEXT",
      salary: "TEXT",
      embedding_vector: "TEXT",
      latitude: "REAL",
      longitude: "REAL"
    }
  };
  return typeMap[dialect][fieldType] ?? (dialect === "sqlite" ? "TEXT" : "VARCHAR(255)");
}
function notNullDefault(fieldType) {
  switch (fieldType) {
    case "id":
    case "integer":
    case "age":
    case "sequence":
    case "timestamp":
      return "0";
    case "decimal":
    case "price":
    case "amount":
    case "rating":
    case "latitude":
    case "longitude":
      return "0.0";
    case "boolean":
      return "FALSE";
    default:
      return "''";
  }
}
function sqlValue(value, dialect) {
  if (value === null || value === void 0) return "NULL";
  if (typeof value === "boolean") {
    if (dialect === "mysql") return value ? "1" : "0";
    if (dialect === "sqlite") return value ? "1" : "0";
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const json = JSON.stringify(value).replace(/'/g, "''");
    return dialect === "mysql" ? `'${json.replace(/\\/g, "\\\\")}'` : `'${json}'`;
  }
  const str = String(value).replace(/'/g, "''");
  return dialect === "mysql" ? `'${str.replace(/\\/g, "\\\\")}'` : `'${str}'`;
}
function formatSQL(data, tables, dialect) {
  const lines = [];
  lines.push(`-- Generated by MockHero`);
  lines.push(`-- Dialect: ${dialect}`);
  lines.push(`-- Tables: ${tables.map((t) => t.name).join(", ")}`);
  lines.push("");
  lines.push(dialect === "mysql" ? "START TRANSACTION;" : "BEGIN;");
  lines.push("");
  const tableOrder = Object.keys(data);
  for (const tableName of tableOrder) {
    const tableDef = tables.find((t) => t.name === tableName);
    if (!tableDef) continue;
    const records = data[tableName];
    lines.push(`-- Table: ${tableName}`);
    const columns = tableDef.fields.map((f) => {
      const type = sqlType(f.type, dialect);
      const pk = f.type === "id" ? " PRIMARY KEY" : "";
      const nullable = f.nullable ? "" : " NOT NULL";
      const notNull = f.type === "id" ? "" : nullable;
      return `  ${quoteIdent(f.name, dialect)} ${type}${pk}${notNull}`;
    });
    lines.push(`CREATE TABLE IF NOT EXISTS ${quoteIdent(tableName, dialect)} (`);
    lines.push(columns.join(",\n"));
    lines.push(`);`);
    lines.push("");
    if (records.length === 0) continue;
    const fields = tableDef.fields;
    const fieldNames = fields.map((f) => f.name);
    const quotedTable = quoteIdent(tableName, dialect);
    const quotedColumns = fieldNames.map((f) => quoteIdent(f, dialect)).join(", ");
    const rowValues = (record) => fields.map((f) => {
      const val = record[f.name];
      if ((val === null || val === void 0) && !f.nullable && f.type !== "id") {
        return notNullDefault(f.type);
      }
      return sqlValue(val, dialect);
    });
    if (dialect === "sqlite") {
      for (const record of records) {
        const values = rowValues(record);
        lines.push(
          `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES (${values.join(", ")});`
        );
      }
    } else {
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100);
        lines.push(`INSERT INTO ${quotedTable} (${quotedColumns}) VALUES`);
        const valueRows = batch.map((record) => {
          const values = rowValues(record);
          return `  (${values.join(", ")})`;
        });
        lines.push(valueRows.join(",\n") + ";");
      }
    }
    lines.push("");
  }
  lines.push("COMMIT;");
  return lines.join("\n");
}

// ../../src/lib/engine/formatters/index.ts
function formatOutput(result, tables, format, sqlDialect) {
  switch (format) {
    case "csv":
      return {
        body: {
          data: formatCSV(result.data, tables),
          meta: result.meta
        },
        contentType: "application/json"
        // CSV is returned as JSON with CSV strings per table
      };
    case "sql":
      return {
        body: {
          sql: formatSQL(result.data, tables, sqlDialect ?? "postgres"),
          meta: result.meta
        },
        contentType: "application/json"
      };
    case "json":
    default:
      return {
        body: {
          data: result.data,
          meta: result.meta
        },
        contentType: "application/json"
      };
  }
}

// src/tools.ts
var TOOL_DEFINITIONS = [
  {
    name: "generate_test_data",
    description: "Generate realistic test data for database tables. Supports 135+ field types, 20 locales, relational data with foreign keys, and multiple output formats (JSON, CSV, SQL).",
    inputSchema: {
      type: "object",
      properties: {
        tables: {
          type: "array",
          description: "Array of table definitions. Each table has: name (string), count (number), fields (array of {name, type, params?, nullable?}). Field types include: first_name, last_name, email, uuid, integer, boolean, datetime, price, enum, ref, and 125+ more.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Table name" },
              count: {
                type: "number",
                description: "Number of rows to generate"
              },
              fields: {
                type: "array",
                description: "Array of field definitions",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Column name" },
                    type: {
                      type: "string",
                      description: "Field type (e.g. first_name, email, uuid, integer, enum, ref)"
                    },
                    params: {
                      type: "object",
                      description: "Optional type-specific parameters (e.g. {min: 0, max: 100} for integer, {values: ['a','b']} for enum, {table: 'users', field: 'id'} for ref)"
                    },
                    nullable: {
                      type: "boolean",
                      description: "If true, ~15% of values will be null (configurable via params.null_rate)"
                    }
                  },
                  required: ["name", "type"]
                }
              }
            },
            required: ["name", "count", "fields"]
          }
        },
        locale: {
          type: "string",
          description: "Locale for generated data (en, de, fr, es, ru, zh, ar, it, ja, hi, pt, and more). Default: en"
        },
        format: {
          type: "string",
          enum: ["json", "csv", "sql"],
          description: "Output format. Default: json"
        },
        sql_dialect: {
          type: "string",
          enum: ["postgres", "mysql", "sqlite"],
          description: "SQL dialect when format is 'sql'. Default: postgres"
        },
        seed: {
          type: "number",
          description: "PRNG seed for reproducible output. Same seed = same data every time."
        }
      },
      required: ["tables"]
    }
  },
  {
    name: "detect_schema",
    description: "Convert a SQL CREATE TABLE statement or JSON sample into MockHero's schema format. Use this to quickly generate test data for an existing database.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "One or more SQL CREATE TABLE statements to convert into MockHero schema format."
        },
        sample_json: {
          type: "object",
          description: "A sample JSON object (or array of objects) to infer a schema from. The keys become field names, and values are used to detect types."
        }
      }
    }
  },
  {
    name: "list_field_types",
    description: "List all 135+ available field types for test data generation, organized by category. Each type includes a description and supported parameters.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional filter by category (identity, location, business, temporal, technical, content, logic, etc.)"
        }
      }
    }
  },
  {
    name: "list_templates",
    description: "List pre-built schema templates for common database patterns: e-commerce, blog, SaaS, and social network.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "generate_from_template",
    description: "Generate test data using a pre-built template. Available templates: ecommerce, blog, saas, social. Use 'scale' to multiply record counts.",
    inputSchema: {
      type: "object",
      properties: {
        template: {
          type: "string",
          description: "Template ID: ecommerce, blog, saas, or social"
        },
        locale: {
          type: "string",
          description: "Locale for generated data. Default: en"
        },
        scale: {
          type: "number",
          description: "Multiplier for all table record counts. E.g. scale=10 generates 10x the default rows."
        },
        format: {
          type: "string",
          enum: ["json", "csv", "sql"],
          description: "Output format. Default: json"
        },
        seed: {
          type: "number",
          description: "PRNG seed for reproducible output."
        }
      },
      required: ["template"]
    }
  }
];
function ok(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
}
function err(message) {
  return {
    content: [{ type: "text", text: message }],
    isError: true
  };
}
async function handleGenerateTestData(args) {
  const parsed = parseSchema(args);
  if (!parsed.success) {
    return err(
      `Schema validation failed:
${parsed.errors.map((e) => `  - ${e.field}: ${e.message}`).join("\n")}`
    );
  }
  const result = await generate(parsed.data);
  if (!result.success) {
    if ("errors" in result) {
      return err(
        `Generation failed:
${result.errors.map((e) => `  - ${e.field}: ${e.message}`).join("\n")}`
      );
    }
    return err(`Generation failed: circular dependency between tables: ${result.cycle.join(" -> ")}`);
  }
  const format = args.format;
  if (format && format !== "json") {
    const sqlDialect = args.sql_dialect;
    const formatted = formatOutput(
      result.result,
      parsed.data.tables,
      format,
      sqlDialect
    );
    return ok(formatted.body);
  }
  return ok({ data: result.result.data, meta: result.result.meta });
}
async function handleDetectSchema(args) {
  const { sql, sample_json } = args;
  if (!sql && !sample_json) {
    return err(
      "Either 'sql' (SQL CREATE TABLE statements) or 'sample_json' (JSON sample data) is required."
    );
  }
  if (sql && typeof sql === "string") {
    const schema = detectFromSql(sql);
    if (schema.tables.length === 0) {
      return err(
        "Could not detect any tables from the provided SQL. Make sure it contains valid CREATE TABLE statements."
      );
    }
    return ok(schema);
  }
  if (sample_json) {
    const schema = detectFromJson(sample_json);
    return ok(schema);
  }
  return err("Invalid input. Provide 'sql' as a string or 'sample_json' as an object.");
}
function handleListFieldTypes(args) {
  const category = args.category;
  if (category) {
    const catalog = FIELD_TYPE_CATALOG;
    const match = catalog[category];
    if (!match) {
      const available = Object.keys(FIELD_TYPE_CATALOG).join(", ");
      return err(
        `Unknown category "${category}". Available categories: ${available}`
      );
    }
    return ok({ [category]: match });
  }
  return ok(FIELD_TYPE_CATALOG);
}
function handleListTemplates() {
  return ok(listTemplates());
}
async function handleGenerateFromTemplate(args) {
  const { template, locale, scale, format, seed } = args;
  if (!template) {
    return err("'template' is required. Available templates: ecommerce, blog, saas, social");
  }
  let request;
  try {
    request = generateFromTemplate({
      template,
      locale,
      scale,
      format,
      seed
    });
  } catch (e) {
    return err(`Template error: ${e instanceof Error ? e.message : String(e)}`);
  }
  const result = await generate(request);
  if (!result.success) {
    if ("errors" in result) {
      return err(
        `Generation failed:
${result.errors.map((e) => `  - ${e.field}: ${e.message}`).join("\n")}`
      );
    }
    return err(`Generation failed: circular dependency between tables: ${result.cycle.join(" -> ")}`);
  }
  if (format && format !== "json") {
    const sqlDialect = args.sql_dialect;
    const formatted = formatOutput(
      result.result,
      request.tables,
      format,
      sqlDialect
    );
    return ok(formatted.body);
  }
  return ok({ data: result.result.data, meta: result.result.meta });
}
async function handleToolCall(name, args) {
  switch (name) {
    case "generate_test_data":
      return handleGenerateTestData(args);
    case "detect_schema":
      return handleDetectSchema(args);
    case "list_field_types":
      return handleListFieldTypes(args);
    case "list_templates":
      return handleListTemplates();
    case "generate_from_template":
      return handleGenerateFromTemplate(args);
    default:
      return err(`Unknown tool: ${name}`);
  }
}

// src/index.ts
var server = new Server(
  { name: "mockhero", version: "0.1.0" },
  { capabilities: { tools: {} } }
);
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return handleToolCall(request.params.name, request.params.arguments ?? {});
});
var transport = new StdioServerTransport();
await server.connect(transport);
