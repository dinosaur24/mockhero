# MockHero — MVP SPEC

Ship in a weekend. The API every developer and AI coding agent needs.

**Stack:** Next.js + Clerk + Supabase + Polar + Vercel

---

## THE PRODUCT IN ONE SENTENCE

Send a schema (or plain English description), get back realistic, relational fake data that looks real — proper names by nationality, valid-format emails, realistic addresses, coherent dates, and records that reference each other correctly.

---

## WHY THIS WINS

Every developer building anything needs test data. Every AI coding agent (Cursor, Claude Code, Copilot, Lovable, Bolt) needs to populate databases to test generated code. Right now they either:

- Use Faker libraries (obviously fake: "John Doe, 123 Main St")
- Write seed scripts manually (wastes hours)
- Copy production data (security/privacy nightmare)
- Use Mockaroo (dated UI, no API-first design, no relational data, no AI agent integration)

None of these are a clean, fast API that an agent can call and get back production-quality test data in one request.

The explosive growth of AI-generated code means the number of "I need test data to verify this works" moments is growing exponentially every day. MockHero is the plumbing layer underneath every dev tool.

---

## KEY DECISIONS (LOCKED)

- **Stack:** Next.js (App Router, API routes) + TypeScript + Supabase (database only — usage tracking, API keys) + Clerk (auth) + Polar (payments) + Vercel (deploy)
- **No ML, no GPU** — pure deterministic data generation logic
- **LLM usage:** OpenRouter + Gemini 2.0 Flash for plain English → schema conversion only (not for data generation)
- **Price:** Free tier (1,000 records/day) → Pro $29/mo (100K records/day) → Scale $79/mo (1M records/day)
- **MCP server from day one** (so Claude, Cursor, and other agents can use it natively)
- **Two input modes:** structured schema JSON or plain English description (plain English available on ALL tiers)
- **Output:** JSON array by default, CSV and SQL INSERT statements as options (CSV/SQL Pro+ only)

---

## CORE CONCEPT

### Input Mode 1: Structured Schema

```
POST /api/v1/generate
{
  "tables": [
    {
      "name": "users",
      "count": 50,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "country", "type": "enum", "params": { "values": ["DE", "FR", "ES"], "weights": [0.4, 0.35, 0.25] } },
        { "name": "first_name", "type": "first_name" },
        { "name": "last_name", "type": "last_name" },
        { "name": "email", "type": "email", "params": { "domain": "company.de" } },
        { "name": "phone", "type": "phone" },
        { "name": "role", "type": "enum", "params": { "values": ["admin", "editor", "viewer"] } },
        { "name": "created_at", "type": "datetime", "params": { "min": "2024-01-01", "max": "2025-12-31" } },
        { "name": "is_active", "type": "boolean", "params": { "probability": 0.85 } }
      ]
    },
    {
      "name": "orders",
      "count": 200,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "params": { "table": "users", "field": "id" } },
        { "name": "product_name", "type": "product_name" },
        { "name": "amount", "type": "decimal", "params": { "min": 9.99, "max": 499.99 } },
        { "name": "currency", "type": "enum", "params": { "values": ["EUR", "USD", "GBP"] } },
        { "name": "status", "type": "enum", "params": { "values": ["pending", "paid", "shipped", "delivered", "refunded"], "weights": [0.1, 0.2, 0.15, 0.45, 0.1] } },
        { "name": "ordered_at", "type": "datetime", "params": { "min": "2024-06-01", "max": "2025-12-31" } }
      ]
    }
  ],
  "format": "json",
  "seed": 42
}
```

> **Note:** When a `country` field is present (as enum with country codes), MockHero auto-detects the locale per row. A user with `country: "DE"` automatically gets German names, a German phone number, and a German email domain. No extra config needed.

### Input Mode 2: Plain English

```
POST /api/v1/generate
{
  "prompt": "Generate 50 users with German names and emails, and 200 orders linked to those users with realistic product names and prices between 10-500 EUR",
  "format": "json"
}
```

For Mode 2, MockHero calls OpenRouter (Gemini 2.0 Flash) to convert the English description into the structured schema format, then runs the same deterministic generator. The LLM is only used for schema interpretation, not data generation. Cost per request: ~$0.00024.

**Plain English mode is available on ALL tiers, including Free.** This is a deliberate decision — it lowers the barrier to entry so dramatically that developers get hooked on their first request.

### Output

```json
{
  "data": {
    "users": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "country": "DE",
        "first_name": "Maximilian",
        "last_name": "Bergmann",
        "email": "maximilian.bergmann@company.de",
        "phone": "+49 151 2345 6789",
        "role": "editor",
        "created_at": "2024-07-14T09:23:41Z",
        "is_active": true
      }
    ],
    "orders": [
      {
        "id": "f8e7d6c5-b4a3-2109-fedc-ba0987654321",
        "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "product_name": "Wireless Bluetooth Headphones",
        "amount": 79.95,
        "currency": "EUR",
        "status": "delivered",
        "ordered_at": "2024-11-22T16:45:12Z"
      }
    ]
  },
  "meta": {
    "tables": 2,
    "total_records": 250,
    "records_per_table": { "users": 50, "orders": 200 },
    "locale": "en",
    "format": "json",
    "seed": 42,
    "generation_time_ms": 47
  }
}
```

---

## SUPPORTED FIELD TYPES (135+)

### Identity (15 types)
- `first_name` — Locale-aware. "de" gives Maximilian, "ja" gives 太郎, "ko" gives 민수.
- `last_name` — Locale-aware, matching nationality.
- `full_name` — Combines first + last.
- `email` — Realistic format. Option to specify domain or auto-generate from name. Diacritics transliterated (ü→ue, č→c).
- `username` — Derived from name with realistic patterns (m.bergmann, maxberg94).
- `phone` — Country-formatted with valid prefix. Auto-detects from country field.
- `phone_e164` — Strict E.164 format (+14155552671).
- `avatar_url` — Returns a URL to a placeholder avatar service.
- `name_prefix` — Mr., Mrs., Dr., Prof.
- `name_suffix` — Jr., Sr., III, PhD.
- `nickname` — Casual alias, sometimes derived from first name.
- `bio` — 1-3 sentence personal biography.
- `ssn` — Format-valid fake SSN (412-68-1932).
- `passport_number` — Format-valid by country.
- `pronoun_set` — she/her, he/him, they/them.

### Location (7 types)
- `address` — Full street address, locale-aware.
- `street_address` — Street portion only.
- `address_line_2` — Apt 4B, Suite 200.
- `city` — Real cities matching locale.
- `country` — ISO code or full name.
- `country_code` — ISO alpha-2 codes.
- `postal_code` — Valid format for country.

### Financial (13 types)
- `company_name` — Realistic company names.
- `product_name` — Realistic product names by category.
- `price` / `amount` / `decimal` — Range-bounded with realistic distribution.
- `currency` — ISO currency codes.
- `iban` — Valid-format IBAN by country.
- `vat_number` — Valid-format VAT by EU country.
- `credit_card_number` — Luhn-valid fake card numbers.
- `credit_card_expiry` — Future MM/YY.
- `credit_card_cvv` — 3-4 digits.
- `bank_name` — Revolut, Deutsche Bank, Chase, etc.
- `invoice_number` — INV-2026-00417 format.
- `swift_code` — Valid-format SWIFT/BIC.
- `wallet_address` — Ethereum-style hex addresses.

### Temporal (8 types)
- `datetime` — Range-bounded, ISO 8601 format.
- `date` — Date only.
- `time` — Time only.
- `timestamp` — Unix timestamp.
- `date_future` — Guaranteed future date.
- `date_past` — Guaranteed past date.
- `duration` — ISO 8601 duration (PT2H30M).
- `date_of_birth` — Realistic DOB with configurable age range.

### Technical (20 types)
- `uuid` — v4 UUID.
- `id` — Auto-incrementing integer.
- `ip_address` — v4 or v6.
- `mac_address`
- `url` — Realistic URLs.
- `domain` — Realistic domain names.
- `user_agent` — Real browser user agent strings.
- `color_hex` — Valid hex colors.
- `color_rgb` — rgb(66, 133, 244) format.
- `semver` — Semantic version (2.14.3).
- `api_key` — Prefixed random string (sk_test_4eC39Hq...).
- `commit_sha` — Git commit hash.
- `hash_md5` / `hash_sha256` — Hex hash strings.
- `port_number` — Valid port (1-65535).
- `http_method` — GET, POST, PUT, DELETE, PATCH.
- `http_status_code` — 200, 404, 500, etc.
- `mime_type` — application/pdf, image/png, etc.
- `file_extension` — .pdf, .xlsx, .ts, etc.
- `file_size` — Formatted size (2.4 MB).
- `docker_image` — nginx:1.25-alpine format.

### Content (10 types)
- `sentence` — Realistic sentence (not lorem ipsum).
- `paragraph` — 3-5 realistic sentences.
- `title` — Article/blog post style titles.
- `slug` — URL-friendly slug derived from title.
- `tag` — Realistic tags/categories.
- `rating` — 1-5 with realistic distribution (skewed toward 4-5).
- `review` — Short realistic review text.
- `markdown` — Realistic markdown content with headers/lists/code.
- `emoji` — Random emoji.
- `hashtag` — #buildinpublic, #devtools, etc.

### Logic (6 types)
- `boolean` — With configurable probability (e.g. 85% true).
- `enum` — Pick from provided values with optional weights.
- `ref` — Foreign key reference to another table's field (**THE KILLER FEATURE**).
- `nullable` — Wraps any type, makes it null X% of the time.
- `sequence` — Auto-incrementing with configurable start and step.
- `date_range` — Two correlated, ordered dates (start < end).

### Social (7 types)
- `github_username` — sarahcodes42 format.
- `twitter_handle` — @dev_sarah format.
- `message` — Chat-like text.
- `notification_text` — App notification text.
- `reaction` — like, love, celebrate, etc.
- `social_platform` — Instagram, Twitter, LinkedIn, etc.
- `hashtag` — Realistic hashtags.

### HR & Education (10 types)
- `job_title` — Realistic titles matching industry context.
- `department` — Standard departments.
- `employee_id` — EMP-00834 format.
- `salary` — Structured with amount + currency.
- `employment_status` — Full-time, part-time, contract, etc.
- `seniority_level` — Junior, Mid, Senior, Lead, Principal.
- `skill` — React, Python, Kubernetes, etc.
- `team_name` — Platform Engineering, Growth, etc.
- `degree` — BSc Computer Science, MBA, etc.
- `university_name` — Real university names.

### Ecommerce (7 types)
- `product_category` — Hierarchical (Electronics > Laptops).
- `product_description` — Multi-sentence product descriptions.
- `sku` — Product SKU format.
- `barcode_ean13` — Check-digit-valid EAN-13.
- `isbn` — Check-digit-valid ISBN-13.
- `shipping_carrier` — FedEx, DHL, UPS, etc.
- `order_status` — Weighted toward "delivered".

### Security (8 types)
- `password_hash` — Bcrypt-format hash.
- `jwt_token` — Structurally valid JWT.
- `totp_secret` — Base32 TOTP secret.
- `license_key` — XXXX-XXXX-XXXX-XXXX format.
- `role` — admin, editor, viewer, etc.
- `permission` — users:read, posts:write RBAC format.
- `oauth_scope` — openid profile email.
- `xss_string` — XSS payloads for security testing.

### AI/ML (3 types)
- `embedding_vector` — Random float vector (configurable dimensions).
- `confidence_score` — Float 0-1.
- `label` — Classification labels (positive, negative, etc.).

### Healthcare (2 types)
- `medical_specialty` — Cardiology, Dermatology, etc.
- `allergy` — Penicillin, Peanuts, etc.

### Edge Cases / Chaos Testing (6 types)
- `unicode_string` — Multi-script text to break encoding.
- `long_string` — Configurable extreme-length strings.
- `boundary_integer` — INT32_MAX, overflow values, etc.
- `empty_string` — With configurable frequency.
- `error_value` — Deliberately malformed data for validation testing.
- `future_proof_date` — Y2K38 and other edge-case dates.

### Special (4 types)
- `image_url` — Placeholder image URL with configurable dimensions.
- `file_path` — Realistic file paths (/documents/report-q4-2024.pdf).
- `json` — Nested JSON object with configurable structure.
- `array` — Array of any other type with configurable length.

---

## THE KILLER FEATURES

### 1. Relational Data

This is what separates MockHero from every Faker library and Mockaroo.

When you define multiple tables, the `ref` type creates proper foreign key relationships. Orders reference real user IDs. Comments reference real post IDs. Line items reference real order IDs AND real product IDs.

The generator:
1. Topologically sorts tables by dependencies
2. Generates parent tables first
3. Stores generated IDs in a lookup map
4. When generating child records, picks from actual parent IDs
5. Ensures referential integrity — no orphan records
6. Distributes references realistically (power law by default: some users have many orders, some have few)

One API call seeds your entire database — users, orders, order items, products, reviews, all correctly linked.

### 2. Auto-Locale Detection

Add a `country` field to your schema (as an enum with country codes). MockHero detects it automatically and switches locale per row:

- Row with `country: "DE"` → German first name, German phone (+49), German email domain (web.de)
- Row with `country: "FR"` → French first name, French phone (+33), French email domain (orange.fr)
- Row with `country: "JP"` → Japanese first name (kanji), Japanese phone (+81)

No extra config needed. The engine:
1. Scans fields for "locale-determining" fields (country type, or enums where >50% of values are recognized country codes)
2. Generates those fields first for each row
3. Resolves the country value to a locale
4. Generates remaining fields with the per-row locale

If no country field exists, falls back to the request-level locale (default: "en").

### 3. 135+ Field Types

The most comprehensive type catalog of any test data tool. From basic UUIDs to Luhn-valid credit card numbers, from bcrypt password hashes to EAN-13 barcodes with valid check digits, from JWT tokens to chaos-testing types that deliberately generate boundary values and malformed data.

---

## SUPPORTED LOCALES (20)

| Tier | Locales |
|------|---------|
| **Tier 1** | English (en) |
| **Tier 2** | French (fr), German (de), Spanish (es), Russian (ru), Chinese (zh) |
| **Tier 3** | Arabic (ar), Italian (it), Japanese (ja), Hindi (hi), Portuguese (pt) |
| **Tier 4** | Indonesian (id), Korean (ko), Turkish (tr), Persian (fa), Polish (pl), Dutch (nl), Swedish (sv), Danish (da), Norwegian (nb), Thai (th) |

Each locale includes:
- 100-140 weighted first names (male + female)
- 80-130 weighted last names
- 30-45 cities with real postal codes and regions
- Country-specific phone format
- 5-9 locale-specific email domains
- 3-8 street name patterns
- 30-42 real street names

---

## API ENDPOINTS (MVP)

### POST /api/v1/generate

Main endpoint. Send schema or plain English prompt, get data back.

**Request body:**
- `tables` (array) — Structured schema with table definitions, counts, fields
- `prompt` (string) — OR plain English description (uses LLM to convert to schema)
- `format` (string) — "json" (default), "csv" (Pro+), "sql" (Pro+)
- `sql_dialect` (string) — If format is "sql": "postgres" (default), "mysql", "sqlite"
- `seed` (number) — Optional, Pro+ only. Same seed = same output.
- `locale` (string) — Default locale, overridden by auto-detection. Default: "en".

**Response:** Generated data + metadata.

### POST /api/v1/schema/detect (Pro+)

Send a SQL CREATE TABLE statement or a JSON sample, get back MockHero's schema format.

### GET /api/v1/types

Returns all 135+ supported field types with descriptions, parameters, and examples. This is the documentation endpoint that AI agents read to understand capabilities.

### GET /api/v1/health

Standard health check.

---

## AUTHENTICATION & USAGE TRACKING

### Auth: Clerk

- User signs up via Clerk (email/password or GitHub OAuth)
- Clerk handles session management, user profiles, social login
- Clerk's pre-built components for sign-in/sign-up pages
- Dashboard protected by Clerk middleware

### API Keys: Supabase

- Dashboard generates API key (prefix: `mh_live_` for production, `mh_test_` for sandbox)
- Every API request includes header: `Authorization: Bearer mh_live_xxxxx`
- Middleware validates key against Supabase, checks usage limits, increments counter

### Supabase Tables

**profiles**
- `id` (text, primary key — Clerk user ID)
- `tier` (text: "free", "pro", "scale")
- `is_early_adopter` (boolean)
- `created_at` / `updated_at` (timestamp)

**api_keys**
- `id` (uuid, primary key)
- `user_id` (text — Clerk user ID)
- `key_hash` (text — hashed, never store plaintext)
- `key_prefix` (text — first 8 chars for display)
- `name` (text — user-given name like "production" or "cursor")
- `created_at` / `last_used_at` (timestamp)
- `is_active` (boolean)

**usage_logs**
- `id` (uuid, primary key)
- `api_key_id` (uuid)
- `endpoint` (text)
- `records_generated` (integer)
- `tables_count` (integer)
- `format` (text)
- `response_time_ms` (integer)
- `created_at` (timestamp)

**daily_usage**
- `id` (uuid, primary key)
- `api_key_id` (uuid)
- `date` (date)
- `records_used` (integer)
- `requests_count` (integer)

**subscriptions**
- `id` (uuid, primary key)
- `user_id` (text — Clerk user ID)
- `polar_customer_id` (text)
- `polar_subscription_id` (text)
- `tier` (text)
- `status` (text)
- `current_period_end` (timestamp)
- `created_at` / `updated_at` (timestamp)

### Rate Limits

| | Free | Pro ($29/mo) | Scale ($79/mo) |
|---|---|---|---|
| Records/day | 1,000 | 100,000 | 1,000,000 |
| Records/request | 100 | 10,000 | 50,000 |
| Requests/minute | 10 | 60 | 120 |

---

## PRICING & MONETIZATION

### Free Tier — $0
- 1,000 records/day
- Max 100 records per request
- All 135+ field types
- Plain English prompts
- JSON output only
- "Powered by MockHero" attribution in SQL comments
- All 20 locales

### Pro — $29/month ($24/mo annual, billed $290/yr)
- 100,000 records/day
- Max 10,000 records per request
- JSON + CSV + SQL output
- Seed parameter for reproducible data
- Schema detection endpoint
- No attribution

### Scale — $79/month ($66/mo annual, billed $790/yr)
- 1,000,000 records/day
- Max 50,000 records per request
- Everything in Pro
- Custom locales
- Webhook delivery (POST generated data directly to your endpoint)
- Bulk generation (queue large jobs, get notified when done)

### Support
Everyone gets the same attention. No tiered support.

### Payments
- **Polar** for Pro and Scale subscriptions
- Webhook handler upgrades tier in Supabase when payment succeeds
- Annual discount: 2 months free

---

## LANDING PAGE

### Design System: Poster Modernist

- **Background:** `#E3E2DE` (Cream)
- **Accent:** `#1351AA` (Cobalt Blue)
- **Text:** `#141414` (Jet Black)
- **Font:** General Sans, weights 400/700/900
- **Borders:** 1px solid `#C7C7C7`, 0px border-radius everywhere
- **No gradients, no shadows, no rounded corners**
- **12-column grid:** columns 1-3 for section labels, 4-12 for content
- **Section labels:** sticky, uppercase, tracking-wide, mono-indexed (001, 002, etc.)

### Structure (single page):

**Navbar:** MOCKHERO logo (uppercase, tracked) + anchor links + Clerk auth buttons

**Hero section:**
- Headline: "REALISTIC TEST DATA IN ONE CALL." (8-12rem, weight 900, "ONE" in cobalt blue)
- Subheadline describing the value prop
- CTAs: "GET FREE API KEY" (primary) + "TRY THE PLAYGROUND" (secondary)
- Stats bar: "135+ FIELD TYPES / 20 LOCALES / <50ms GENERATION TIME"

**Playground (002):**
- Schema input (dark panel, monospace) on left
- JSON output on right
- GENERATE button (cobalt blue, full-width)
- Calls real API endpoint — output quality IS the conversion mechanism

**Features (001):**
- 6 features in 2-column grid with numbered indices (01-06)
- Hover: title color transitions to cobalt blue
- Features: Locale-Aware, Relational Data, Auto-Locale Detection, 135+ Field Types, Multiple Output Formats, AI Agent Ready

**Code Examples (003):**
- Tabbed: CURL / JAVASCRIPT / PYTHON
- Dark code block, copy button
- Real working examples with `api.mockhero.dev`

**Pricing (004):**
- "Simple pricing." headline
- Monthly/Annual toggle
- Three cards sharing borders, Pro highlighted with `border-2 border-accent`
- Features listed with em-dash prefix

**Footer:**
- MOCKHERO brand + tagline
- Three columns: Product, Developers, Company

---

## MCP SERVER (CRITICAL FOR AGENT ADOPTION)

Build a simple MCP server that wraps the API. Published to npm.

### MCP Tools:

**generate_test_data**
- Input: schema object or plain English prompt + count + format
- Output: generated data
- Description: "Generate realistic test data for database tables. Supports relational data with foreign keys, locale-aware names and addresses, and multiple output formats."

**detect_schema**
- Input: SQL CREATE TABLE statement or sample JSON
- Output: API schema object

**list_field_types**
- Input: none
- Output: all 135+ supported field types with descriptions

### Why this matters:
When a developer using Cursor says "populate my database with test data", Cursor checks available MCP tools, finds `generate_test_data`, reads the schema from the developer's migration files, and calls MockHero's API. The developer never visits the website. They just get data. And they pay every month because it's in their tool stack.

---

## DATA GENERATION ENGINE (TECHNICAL)

### Architecture

```
Request → Validate Schema (Zod) → Detect Locale Fields → Topological Sort → Generate in Dependency Order → Format Output → Return
```

### Key Implementation Details

**Auto-locale detection:**
1. Scan each table's fields for "locale-determining" fields
2. Generate those fields first (Phase 1 of row generation)
3. Map country code → locale (60+ country mappings)
4. Generate remaining fields with per-row locale (Phase 2)

**Name generation:**
- 100-140 weighted first names + 80-130 last names per locale
- 20 locales: en, fr, de, es, ru, zh, ar, it, ja, hi, pt, id, ko, tr, fa, pl, nl, sv, da, nb, th
- Names weighted by actual frequency (common names appear more often)
- Stored as TypeScript modules: `src/lib/engine/locale-data/de.ts`

**Email generation:**
- Derived from name: maximilian.bergmann@, m.bergmann@, bergmann.m@
- Diacritics transliterated: ü→ue, ö→oe, č→c, ć→c, ñ→n
- Locale-specific domains when locale detected: web.de, orange.fr, yahoo.co.jp
- Never generates obviously fake patterns

**Relational data:**
- Topological sort: dependency-order generation
- IDs stored in lookup map during generation
- Power law distribution by default (few users have many orders, most have few)
- Configurable: `"distribution": "uniform" | "normal" | "power_law"`

**Seed / reproducibility:**
- Seeded PRNG (Mulberry32 algorithm)
- Same seed + same schema = identical output every time

**SQL output:**
- Valid INSERT INTO statements
- Dialect-aware: Postgres (UUID, BOOLEAN, TIMESTAMP), MySQL (CHAR(36), TINYINT(1), DATETIME), SQLite (TEXT, INTEGER, TEXT)
- Wrapped in transaction (BEGIN; ... COMMIT;)

**Plain English → Schema:**
- OpenRouter API call to Gemini 2.0 Flash
- System prompt teaches MockHero's schema format + all 135+ field types
- LLM output validated through same Zod schema parser
- Cost: ~$0.00024 per request
- If LLM output fails validation, returns clear error (never generates garbage data)

---

## COMPETITIVE POSITIONING

**vs Faker (npm/Python library):**
"Faker generates 'John Doe at 123 Main St.' MockHero generates 'Maximilian Bergmann at Friedrichstraße 42, 10117 Berlin' with a valid German phone number, a web.de email, and an order history that references his user ID."

**vs Mockaroo:**
"Mockaroo is a website you visit with 30 field types. MockHero is an API your tools call with 135+ field types. Your agent generates test data without you leaving your IDE."

**vs Copying production data:**
"Using real customer data in dev is a GDPR violation waiting to happen. MockHero data looks real but isn't. Compliance teams love us."

**vs Writing seed scripts:**
"You spent 2 hours writing a seed script that generates 50 users with hardcoded names. MockHero generates 10,000 users across 5 related tables in 200ms."

---

## VALIDATION CHECKLIST

Signal you're looking for in Week 1:

1. Are developers actually calling the endpoint? (Check usage_logs)
2. Are they calling it repeatedly? (Same API key, multiple days)
3. Are they generating relational data? (Multi-table schemas = power users)
4. Are they using plain English mode? (Prompt field = activation success)
5. Are they asking for features? (SQL output, more locales, more types)

If yes to 2+ of these: you have a product. Push on pricing.
If people sign up but never call the endpoint: the landing page works but the product doesn't solve a real problem. Pivot the value prop.

Offer 10,000 free records/day to first 100 signups (10x normal free tier).

---

## SUMMARY

- **Product:** MockHero — Synthetic test data API
- **4 endpoints:** generate, schema/detect, types, health
- **135+ field types** across 20 categories
- **Relational data** with foreign keys (killer feature #1)
- **Auto-locale detection** from country field (killer feature #2)
- **Plain English mode** via OpenRouter/Gemini Flash (free for all tiers)
- **20 locales** with 100+ names each
- **JSON + CSV + SQL output**
- **Seeded reproducibility**
- **MCP server** for AI agent adoption
- **Auth:** Clerk (user management) + Supabase (database)
- **Payments:** Polar ($29/$79 monthly, $290/$790 annual)
- **Design:** Poster Modernist (cream, cobalt blue, flat, no rounded corners)
- **Deploy:** Vercel
- **Total cost:** $0 until paying customers
