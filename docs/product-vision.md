# Product Vision — MockHero

## 1. Vision & Mission

### Vision Statement

Every developer and every AI coding agent has instant access to production-quality test data — realistic, relational, and ready to use — so nobody ever wastes time on fake data again.

### Mission Statement

MockHero provides a single API endpoint that transforms a schema definition into realistic, locale-aware, relationally-consistent test data, replacing hours of manual seed scripting with a 200ms API call.

### Founder's Why

Dino comes from performance marketing — a world where you measure everything, optimize relentlessly, and think about distribution before you think about product. When he started vibe-coding with AI agents, he kept hitting the same wall: the AI could generate an entire application in minutes, but then he'd spend 30 minutes manually seeding garbage test data. "John Doe at 123 Main St" in every demo. Orphaned foreign keys. Seed scripts that broke every time the schema changed.

The marketing instinct kicked in. Every developer building anything needs test data. Every AI coding agent — Cursor, Claude Code, Copilot, Lovable, Bolt — needs to populate databases to verify generated code works. The growth of AI-generated code means these "I need test data" moments are growing exponentially. And nobody has built a clean, fast API for it. The timing is perfect.

This isn't just a developer tool. It's infrastructure for the AI coding era — the plumbing layer underneath every dev tool that generates code. When an AI agent needs to test what it built, MockHero is what it calls.

### Core Values

**Ship fast, fix forward.** The MVP ships in a weekend. Perfection is the enemy of a working product. Get it in front of developers, watch what they do, iterate on what matters. A fast API with 20 field types that works perfectly beats a slow one with 50 field types that doesn't.

**Data quality is the product.** Every generated record must be indistinguishable from real data at a glance. "Maximilian Bergmann at Friedrichstraße 42, 10117 Berlin" with a valid German phone number — not "John Doe at 123 Main St." If the output looks fake, the product has failed.

**API-first, always.** The website, dashboard, and documentation exist to support the API. The API is the product. Every decision about UI, features, and pricing should be evaluated through the lens of "does this make the API better or easier to use?"

**Let agents sell for you.** The MCP server isn't a nice-to-have — it's a primary distribution channel. When an AI coding agent recommends MockHero without the developer ever visiting the website, that's the ultimate product-market fit signal.

**Relational data is the moat.** Anyone can generate random strings. Generating 5 related tables with correct foreign key relationships, realistic distribution patterns, and topologically-sorted dependencies — that's hard. Protect and deepen this advantage.

### Strategic Pillars

**Speed beats features.** When choosing between shipping a new field type or making the existing ones 50ms faster, choose speed. Developers and AI agents both value response time over breadth. A fast, reliable API earns trust.

**Distribution through tools, not marketing.** The primary growth engine is integration into developer workflows — MCP servers, SDK packages, CLI tools. Traditional marketing supports this, but the agent-first distribution model is the strategic bet.

**One request, complete data.** The core value proposition is generating an entire database seed in a single API call. Every product decision should protect this — never make the developer send multiple requests for what should be one.

**Locale quality over locale quantity.** It's better to support 5 locales with 500+ names each, real city data, and correct phone formats than to support 20 locales with 50 names each. Quality per locale matters more than breadth.

### Success Looks Like

In 12 months, MockHero is the default answer to "how do I get test data?" in the AI coding agent ecosystem. The API handles 10 million record generations per day across thousands of active developers. MRR has crossed $15,000 and is growing 15% month-over-month. The MCP server is installed in thousands of Cursor and Claude Code setups. When a developer says "populate my database with test data," their AI agent calls MockHero automatically. The product has expanded from data generation to hosted mock API servers — developers can generate not just data but a fully functional fake REST API from a schema. Dino is known in the dev tools community as the person who killed the seed script.

---

## 2. User Research

### Primary Persona

**Marcus, 29, fullstack developer at a 40-person SaaS startup.** He works across the stack — React frontend, Node.js backend, PostgreSQL database. He uses Cursor as his primary IDE and Claude Code for complex tasks. He's shipping features fast, typically 2-3 PRs per week.

Marcus's test data problem hits him at least twice a week. He creates a new database table, writes the migration, builds the UI — then realizes he needs 200 realistic records to test pagination, search, and edge cases. He opens a seed script, writes 50 lines of Faker.js calls that produce "Jane Doe, jane.doe@example.com, 555-0123" and calls it good enough. The demo to his product manager shows obviously fake data. The search test misses a bug because all his test names are Western English. His AI agent generates a beautiful data table component but the screenshot looks ridiculous because every user is named "John Smith."

He's not looking for a tool. He doesn't think "test data generation" is a category. He just wants the pain to stop — and he'll pay $29/month for something that makes his seed script 10x better in 10 seconds.

### Secondary Personas

**AI Coding Agents (Cursor, Claude Code, Copilot, Lovable, Bolt)** — These aren't people, but they're users. Every time an agent generates code that touches a database, it needs to verify the code works. Agents currently either skip testing entirely or generate terrible inline test data. With MockHero's MCP server, agents call the API directly, get realistic data, and validate their work — all without the developer doing anything. The agent is both the user and the distribution channel.

**Priya, 34, QA engineer at a fintech company.** She needs large datasets (10,000+ records) with realistic edge cases — names with special characters, amounts at boundary values, timestamps across different timezones. She currently maintains a set of SQL scripts that take 20 minutes to run and break whenever the schema changes. She'd pay for Scale tier to generate consistent, comprehensive test datasets on demand.

**Tom, 42, DevOps lead at a healthcare company.** He needs to seed staging environments with production-quality data without using actual patient records. Compliance requires synthetic data that's realistic enough for UAT but contains zero real PII. He currently uses a custom Python script that generates data so obviously fake that QA testers can't do their job properly. The compliance angle is his buying trigger — he doesn't care about the API being "cool," he cares about passing audits.

### Jobs To Be Done

**Functional jobs:**
- "I need to populate my new database tables with realistic data so I can test my UI and queries" (primary — happens 2-5x per week for active developers)
- "I need an entire relational dataset — users, orders, products, reviews — that's internally consistent so I can test joins and aggregations"
- "I need test data in SQL INSERT format so I can seed my staging database without writing a script"
- "I need the same test data every time so my automated tests are deterministic"

**Emotional jobs:**
- "I want to feel like a professional when I demo my work — not embarrassed by obviously fake data"
- "I want to stop wasting time on something that feels like busywork — seed scripts are not where I add value"
- "I want my AI coding agent to handle the boring parts so I can focus on the interesting problems"

**Social jobs:**
- "I want my team to see realistic data in our staging environment so they take testing seriously"
- "I want to show my manager a demo with data that looks real so the feature gets approved"
- "I want compliance to approve our test environments so we can ship faster"

### Pain Points

**1. Obviously fake data undermines everything (severity: high, frequency: constant).** Every Faker library produces data that screams "this is fake." Names don't match locales. Phone numbers are invalid formats. Addresses don't exist. Emails are test@example.com. This makes demos look unprofessional, hides locale-specific bugs, and erodes confidence in the development process. Developers currently accept this because they don't know a better option exists.

**2. No relational data support (severity: high, frequency: weekly).** The most common database isn't a single table — it's 5-10 related tables. Orders reference users. Line items reference orders AND products. Reviews reference users AND products. No existing tool handles this well. Developers either write custom join logic in their seed scripts or generate flat tables and hope the foreign keys work out. They don't.

**3. Seed scripts are brittle and time-consuming (severity: medium, frequency: weekly).** Every schema change breaks the seed script. Adding a column means updating the seed. Changing a relationship means rewriting the generation logic. Developers spend 1-2 hours per week maintaining seed scripts that should be throwaway code. This is pure waste.

**4. Production data in development is a compliance risk (severity: high when it happens, frequency: varies).** The easiest way to get realistic data is to copy production. Teams do this all the time. It works until an audit, a breach, or a GDPR complaint. The risk is catastrophic but the behavior persists because the alternatives (Faker garbage) are so bad.

**5. AI agents can't generate good test data (severity: medium, frequency: growing rapidly).** When an AI coding agent needs test data, it either hardcodes a few records inline, uses Faker with the same bad output, or asks the developer to provide data. This breaks the flow of AI-assisted development — the agent does 95% of the work and then stops because it can't seed the database. This pain point is new and growing exponentially as AI coding tools gain adoption.

### Current Alternatives & Competitive Landscape

**Faker libraries (faker.js, Python Faker):** The default choice. Free, embedded in your code, huge ecosystem. Does well: simple field types (names, emails, addresses), easy to get started, widely documented. Falls short: obviously fake output quality, no relational data support, no locale depth (50 names per locale, not 500), no API — you have to write code around it. Switching cost: near zero — MockHero can replace Faker calls with a single API call.

**Mockaroo:** The closest direct competitor. Web-based UI for generating mock data with download/API options. Does well: more field types than Faker, web UI for non-developers, some format options. Falls short: dated UI and UX, no relational data across tables, no MCP/agent integration, API is an afterthought rather than the core product, no locale depth. Switching cost: low — developers who find Mockaroo will find MockHero if the SEO and distribution are right.

**Manual seed scripts:** The most common approach. Developers write custom scripts using Faker or raw SQL. Does well: total control, exactly the data you need. Falls short: takes 1-2 hours per project, breaks on schema changes, usually generates garbage data because nobody invests time in making seed data realistic. Switching cost: negative — developers would love to delete their seed scripts.

**Copying production data:** The nuclear option. Dump prod, sanitize (maybe), load into dev. Does well: maximally realistic because it IS real. Falls short: GDPR/HIPAA/SOC2 violations, security risk, stale data, requires database access and sanitization pipeline. Switching cost: moderate — requires changing team habits and potentially updating compliance processes.

**Doing nothing / hardcoded data:** Many developers just hardcode 5-10 records in their seed file and call it done. Does well: fast for tiny datasets. Falls short: doesn't scale, no variety, pagination and search testing is impossible, demos look terrible. Switching cost: zero.

### Key Assumptions to Validate

**1. "Developers will pay for test data generation."** We assume developers value their time at >$29/month for this specific problem. To validate: track free-to-paid conversion rate. If <2% convert after 30 days of active use, the pain isn't severe enough to pay for.

**2. "AI coding agents will drive significant API usage."** We assume MCP integration will generate meaningful traffic as agents call MockHero automatically. To validate: measure API calls from MCP user agents vs direct API calls in the first month. If MCP <10% of traffic, the agent distribution thesis needs rethinking.

**3. "Relational data is the differentiator that wins."** We assume multi-table generation with foreign keys is what makes developers choose MockHero over simpler alternatives. To validate: track the percentage of requests that use multi-table schemas with ref fields. If <30% of requests use relational features, developers might just want a better Faker, not relational data.

**4. "Locale-aware data quality matters enough to switch."** We assume "Maximilian Bergmann" vs "John Doe" is a meaningful differentiator. To validate: track locale parameter usage. If >80% of requests use "en" locale with no locale specified, the locale quality investment may not be driving adoption.

**5. "Free tier limits (1,000 records/day) create upgrade pressure."** We assume 1,000 records/day is enough to hook developers but not enough for real workflow integration. To validate: track how many free users hit the limit and what happens next — do they upgrade or stop using the product?

**6. "Developers will discover MockHero through their AI agents."** We assume developers using Cursor and Claude Code will discover MockHero when their agent uses the MCP server. To validate: track signup source — did the user discover MockHero through an MCP tool recommendation or through the website?

**7. "The weekend MVP timeline is achievable."** We assume a working API with 20+ field types, relational data, and a landing page can ship in 2 days. To validate: this is validated immediately — if the MVP isn't live by Sunday evening, scope must be cut.

**8. "Solo founders are the right initial market."** We assume solo developers and small teams are the early adopters. To validate: track team size of first 100 users. If enterprise teams dominate early adoption, the pricing and feature priority may need to shift.

### User Journey Map

**Awareness:** Marcus is building a new feature in Cursor. His AI agent generates a database schema and API endpoints. The agent tries to populate the database but produces terrible test data. Marcus searches "realistic test data API" or his agent discovers MockHero's MCP server and suggests it. Alternatively, Marcus sees a "Show HN" post about MockHero and bookmarks it for later.

**Consideration:** Marcus visits the MockHero landing page. The live playground catches his eye — he pastes a quick schema, sees the output, and immediately notices the data quality difference. "Maximilian Bergmann" instead of "John Doe." Valid German phone numbers. Orders that reference real user IDs. He's intrigued. He scrolls to pricing — free tier with 1,000 records/day, no credit card required. Low risk.

**First use:** Marcus signs up with GitHub OAuth (10 seconds). Gets an API key. Copies the cURL example, swaps in his own schema, runs it. Gets back 50 users with German names and 200 orders with correct foreign key references. His reaction: "Wait, this actually works?" He pastes the output into his database seed file. His UI immediately looks professional.

**Magic moment:** Marcus defines a 4-table schema — users, products, orders, reviews — all with ref fields linking them together. He hits the API. In 200ms, he gets back 1,000 records across all 4 tables, every foreign key valid, realistic distribution (some users have 15 orders, most have 2-3). He runs his JOIN queries. They all work. He shows the demo to his PM. The PM doesn't comment on the data because it looks real. This is the moment Marcus becomes a regular user.

**Habit formation:** Marcus installs the MCP server in Cursor. Now every time he creates a new table, his AI agent automatically generates test data via MockHero. He never writes a seed script again. He hits the free tier limit on a busy day and upgrades to Pro without hesitation — $29/month is nothing compared to the time he saves.

**Advocacy:** Marcus tells his team about MockHero. He mentions it in a code review: "Just use MockHero for test data instead of that seed script." Two teammates sign up. He tweets about it: "This tool replaced my entire seed script infrastructure. Send a schema, get back production-quality data. @MockHero is the real deal." The cycle begins again with new developers.

---

## 3. Product Strategy

### Product Principles

**The API is the product, the website is the wrapper.** Every feature decision starts with "how does this make the API better?" The landing page, dashboard, and docs exist to get developers to the API. Never prioritize website features over API capabilities.

**One request, complete data.** A developer should be able to seed an entire database with a single POST request. Multi-table schemas with complex relationships should be the default use case, not an edge case. Never force multiple requests for what should be one.

**Output quality over input convenience.** It's acceptable for the schema input to be verbose if the output is exceptional. Developers will write a detailed schema once to get perfect data forever. Don't sacrifice output quality to simplify input.

**Fast by default, reproducible when needed.** Every request should return data as fast as possible. When deterministic output matters (automated tests, CI/CD), the seed parameter provides reproducibility without sacrificing speed for everyone else.

**Relational integrity is non-negotiable.** Every foreign key reference must point to a real record. Every child table must be generated after its parent. Every distribution must be realistic. If referential integrity breaks, it's a P0 bug regardless of what else is happening.

**Agent-native, not agent-adapted.** The MCP server isn't an afterthought bolted onto a human-facing product. It's a first-class interface. The /api/v1/types endpoint exists specifically so agents can discover capabilities without reading docs. Design for the agent use case from day one.

### Market Differentiation

MockHero occupies a unique position: it's the only API-first test data service designed for the AI coding era. The competitive landscape has a clear gap — existing tools were built for a world where developers manually configured test data. MockHero is built for a world where AI agents do it automatically.

The relational data capability is the deepest technical differentiator. Generating a single table of fake data is a solved problem — Faker does it adequately. Generating 5 related tables with correct foreign key relationships, topologically sorted by dependency, with realistic power-law distribution of references — that's genuinely hard. No existing tool does this well because it requires understanding the relationships between tables, not just the fields within them.

The locale depth is a visible quality differentiator. When a developer compares MockHero output to Faker output side by side, the difference is immediate and visceral. 500+ weighted names per locale, real city/postal code combinations, correctly formatted phone numbers, culturally appropriate email patterns. This is the differentiator that makes developers share screenshots and tweet about the product.

The MCP-first distribution model is the strategic differentiator. While competitors wait for developers to discover their website, MockHero gets recommended by the developer's own AI agent. This inverts the traditional funnel — the tool finds the developer, not the other way around. As AI coding tools grow, this distribution advantage compounds.

### Magic Moment Design

The magic moment is: **"A developer sends a multi-table schema with foreign key references and gets back hundreds of records across related tables — all with realistic locale-aware data and every foreign key correctly linked — in under a second."**

For this moment to happen reliably, the following must be true:

1. **Schema parsing must be forgiving.** The developer shouldn't get a 400 error because they wrote "string" instead of "first_name." The API should accept reasonable approximations.
2. **Relational resolution must be correct.** The topological sort must handle complex dependency chains (A → B → C → A is an error, A → B → C is fine). Every ref field must resolve to a real ID from the parent table.
3. **Response time must be under 1 second** for schemas up to 5 tables and 1,000 total records. The magic moment loses its punch if the developer waits 5 seconds.
4. **Output quality must be visually compelling.** When the developer looks at the JSON, they should see names they'd believe are real, emails that look professional, and amounts that feel like actual transactions. No "John Doe" anywhere.

The shortest path from signup to magic moment:
1. Sign up with GitHub (10 seconds)
2. Copy the example schema from the landing page (5 seconds)
3. Run the cURL command (5 seconds)
4. See the output (< 1 second)

**Total time to magic moment: under 30 seconds.** This is achievable in the MVP.

### MVP Definition

The MVP includes everything necessary for a developer to experience the magic moment and begin using MockHero in their daily workflow. Nothing more.

**In Scope — Must ship:**

- **POST /api/v1/generate endpoint** — Accepts structured JSON schema, returns generated data. Supports multi-table schemas with ref fields for foreign key relationships.
- **Core field types (25+)** — uuid, id, first_name, last_name, full_name, email, username, phone, boolean, enum (with weights), datetime, date, decimal, ref, sequence, sentence, paragraph, title, slug, city, country, postal_code, address, company_name, product_name, rating, url, ip_address, color_hex.
- **Relational data engine** — Topological sort on table dependencies. ID lookup map for ref resolution. Power law and uniform distribution options.
- **Locale support (5 locales)** — en, de, fr, es, hr. Each with 500+ first names, 500+ last names, real cities, correct phone formats.
- **JSON output format** — Default format with metadata (record count, table count, generation time).
- **CSV output format** — One CSV per table, bundled in the response.
- **SQL output format** — INSERT statements with CREATE TABLE. Postgres, MySQL, SQLite dialects.
- **Seed parameter** — Seeded PRNG for deterministic, reproducible output.
- **API key authentication** — Supabase Auth for signup, API key generation, middleware validation.
- **Usage tracking** — Per-key daily record counts, rate limiting by tier.
- **Free tier enforcement** — 1,000 records/day, 100 per request, 10 req/min.
- **GET /api/v1/types endpoint** — Returns all supported field types with descriptions and parameters. This is the agent discovery endpoint.
- **GET /api/v1/health endpoint** — Standard health check.
- **Landing page** — Hero with live playground, feature cards, code examples, pricing, signup CTA.
- **Minimal dashboard** — API key display, usage stats, tier info.
- **MCP server** — Wraps /generate and /types endpoints. Published to npm.

### Explicitly Out of Scope

**Plain English prompt mode (POST with natural language).** Requires an LLM call which adds cost, latency, and a dependency on external AI APIs. The structured schema mode delivers the magic moment without it. Defer to Week 2. *Reconsider when: MVP is stable and users request it.*

**POST /api/v1/schema/detect endpoint.** Converting SQL CREATE TABLE to API schema is valuable but not essential for the magic moment. Developers can write the schema manually for now. Defer to Week 2. *Reconsider when: users complain about schema authoring friction.*

**Pro and Scale tier features beyond rate limits.** The free tier includes all field types and all output formats. Paid tiers only add higher limits for MVP. Feature gating (seed parameter, SQL output) per the pricing spec is deferred. *Reconsider when: conversion data shows whether feature gating or usage limits drive upgrades.*

**Stripe/Polar payment integration.** The MVP ships with free tier only. Payment integration comes in the polish phase, not the foundation. Manually upgrading early Pro users via Supabase is acceptable for the first week. *Reconsider when: >5 users request Pro tier.*

**More than 5 locales.** en, de, fr, es, hr for MVP. Additional locales (ja, ko, zh, pt, pl, nl, it) defer to Week 2. *Reconsider when: locale requests appear in feedback.*

**Webhook delivery.** Pushing generated data to a user's endpoint is a Scale tier feature. Defer to Week 3+. *Reconsider when: enterprise users request it.*

**SDKs (npm package, Python package).** cURL and raw HTTP are sufficient for MVP. SDKs come in Week 4. *Reconsider when: usage data shows which languages dominate.*

**Schema templates (pre-built schemas).** "E-commerce," "blog," "SaaS" template schemas are compelling but not essential. Defer to Week 3. *Reconsider when: users ask for them.*

**Documentation page.** A full docs site is deferred. The landing page includes enough information (code examples, field type list) to get started. The /api/v1/types endpoint serves as machine-readable docs. *Reconsider when: support questions indicate docs gaps.*

### Feature Priority (MoSCoW)

**Must Have (P0):**
- POST /api/v1/generate with structured schema input
- Core field types (25+) across identity, location, business, temporal, technical, content, logic categories
- Relational data with ref type, topological sort, ID lookup
- 5 locales with deep name/city/phone data (en, de, fr, es, hr)
- JSON output format
- Seed parameter for reproducibility
- API key auth via Supabase
- Usage tracking and free tier rate limiting
- GET /api/v1/types endpoint
- Landing page with live playground
- MCP server published to npm

**Should Have (P1):**
- CSV output format
- SQL output format (Postgres, MySQL, SQLite)
- Minimal dashboard (API key, usage stats)
- GET /api/v1/health endpoint
- Weighted enum distributions
- Nullable field wrapper
- Power law distribution for ref fields

**Could Have (P2):**
- POST /api/v1/schema/detect (SQL → schema conversion)
- Plain English prompt mode (LLM-powered)
- Pro/Scale payment integration via Polar
- Additional locales (ja, ko, zh, pt, pl, nl, it)
- Schema templates for common patterns
- Documentation page
- Annual pricing option

**Won't Have (this time):**
- Webhook delivery
- Bulk async generation
- SDKs (npm, Python packages)
- One-click database seeding (connection string)
- Hosted mock API server
- Team accounts
- Custom field type definitions

### Core User Flows

**Flow 1: Generate relational test data (primary)**
- Trigger: Developer needs test data for a multi-table database schema.
- Step 1: Developer signs up or uses existing API key.
- Step 2: Developer constructs a JSON schema with table definitions and ref fields for foreign keys.
- Step 3: Developer sends POST /api/v1/generate with the schema.
- Step 4: API validates schema, topologically sorts tables, generates data in dependency order, resolves all refs.
- Step 5: API returns JSON with generated data organized by table, plus metadata.
- Outcome: Developer has production-quality test data with correct relational integrity.
- Success criteria: Response in <1s for up to 1,000 records. All foreign keys valid. Locale-appropriate data.

**Flow 2: AI agent generates test data via MCP (secondary)**
- Trigger: Developer asks AI agent to populate a database, or agent determines it needs test data to verify generated code.
- Step 1: Agent checks available MCP tools, finds MockHero's generate_test_data tool.
- Step 2: Agent reads the database schema from the developer's migration files.
- Step 3: Agent constructs a MockHero schema and calls the MCP tool.
- Step 4: MockHero API generates data and returns it to the agent.
- Step 5: Agent inserts the data into the developer's database or writes a seed file.
- Outcome: Developer gets test data without leaving their IDE or knowing MockHero exists.
- Success criteria: End-to-end flow works without developer intervention. Agent correctly maps database schema to MockHero schema.

**Flow 3: Generate SQL seed for staging environment (tertiary)**
- Trigger: DevOps engineer needs to seed a staging database with realistic data.
- Step 1: Engineer constructs schema matching their production tables.
- Step 2: Engineer sends POST /api/v1/generate with format: "sql" and sql_dialect: "postgres".
- Step 3: API returns SQL with CREATE TABLE and INSERT INTO statements.
- Step 4: Engineer runs the SQL against their staging database.
- Outcome: Staging environment has realistic, compliant synthetic data.
- Success criteria: SQL executes without errors. Data passes visual inspection by QA team.

### Success Metrics

**Primary metric: Weekly Active API Keys** — The number of unique API keys making at least one request per week. This measures real usage, not signups. Target: 50 WAK at 90 days.

**Secondary metrics:**

| Metric | 30-day target | 90-day target | "Great" threshold |
|--------|:------------:|:-------------:|:-----------------:|
| Total registered users | 150 | 500 | 1,000 |
| Weekly active API keys | 20 | 50 | 100 |
| Records generated per day | 50,000 | 200,000 | 500,000 |
| % requests using multi-table schemas | 20% | 30% | 50% |
| % requests with locale specified | 15% | 25% | 40% |
| Free → Pro conversion (30-day) | 2% | 3% | 5% |
| MRR | $100 | $400 | $800 |
| MCP server npm installs | 50 | 200 | 500 |

**Leading indicators:**
- Same-API-key usage across multiple days (retention signal)
- Schema complexity increasing over time (users discovering advanced features)
- MCP user agent percentage of total traffic (agent adoption signal)
- Support requests asking for features = product engagement

### Risks

**1. "Better Faker" isn't enough to build a business on (likelihood: medium, impact: high).** If developers are satisfied with slightly better fake data and don't care about relational features or locale depth, the product is a feature, not a business. Mitigation: validate relational data usage in the first week. If <20% of requests use multi-table schemas, pivot messaging to focus on whichever feature actually drives retention.

**2. AI agent integration is harder than expected (likelihood: medium, impact: high).** MCP is still early. Agent behavior is unpredictable. Agents may not construct valid schemas from database migrations. Mitigation: test the MCP server extensively with Cursor and Claude Code before launch. Build robust error messages that help agents self-correct.

**3. Weekend timeline is too aggressive (likelihood: medium, impact: medium).** The spec is ambitious for 2 days. If the data generation engine takes longer than expected, the landing page or MCP server may not ship. Mitigation: prioritize the API above everything else. The landing page can be minimal. The MCP server can be a simple wrapper. The core engine must work perfectly.

**4. Free tier is too generous (likelihood: low, impact: medium).** 1,000 records/day might be enough for most use cases, reducing upgrade pressure. Mitigation: monitor free tier limit hits. If <10% of active users hit the limit in the first month, reduce to 500 records/day for new signups.

**5. Mockaroo or Faker community responds with competing features (likelihood: medium, impact: medium).** If MockHero gains traction, established tools may add relational data or API-first features. Mitigation: move fast. Build the MCP server ecosystem and developer relationships before competitors can react. The agent distribution channel is hard to replicate.

**6. Data quality at scale is inconsistent (likelihood: medium, impact: high).** Edge cases in name generation, phone formatting, or address composition could produce obviously wrong data at high volumes. Mitigation: comprehensive testing of each locale's data files. Automated quality checks on generated output during development.

**7. Polar payment integration adds friction to paid conversion (likelihood: low, impact: medium).** Using Polar instead of Stripe is a bet on developer-friendliness. If developers find the payment flow unfamiliar, conversion could suffer. Mitigation: Polar has strong developer tool adoption. Monitor checkout abandonment rates.

**8. Cost scaling with serverless (likelihood: low, impact: medium).** Large data generation requests (50,000 records) could hit Vercel function timeout limits or memory constraints. Mitigation: benchmark generation performance during development. Set realistic per-request limits. Use streaming responses for large datasets if needed.

---

## 4. Brand Strategy

### Positioning Statement

For developers and AI coding agents who need realistic test data, MockHero is the API-first data generation service that produces production-quality, relationally-consistent synthetic data in one request. Unlike Faker libraries that generate obviously fake data and Mockaroo that lacks relational support, MockHero delivers locale-aware records with correct foreign key relationships and supports AI agent integration via MCP.

### Brand Personality

MockHero is the sharp, helpful friend who's a couple of steps ahead of you. Not the flashy startup that overpromises — the quietly competent tool that just works. Think of the colleague who built an internal tool that's so good it should be a product. They didn't add a marketing page because they were too busy making the thing work. But when they finally share it, you immediately wonder how you lived without it.

MockHero is confident without being arrogant. It knows it's better than the alternatives and shows you rather than tells you. The live playground on the landing page IS the pitch — no sizzle reel needed. The output quality speaks louder than any marketing copy.

The personality is modern developer culture: direct, slightly irreverent, technically precise. No corporate speak. No "enterprise-grade solutions." No stock photos. Just clean code, beautiful data, and a product that respects your time.

### Voice & Tone Guide

**Voice (constant):** Direct, confident, technically fluent, slightly witty. Speaks developer-to-developer. Never condescending, never vague.

| Context | DO | DON'T |
|---------|----|----- |
| **Onboarding** | "Here's your API key. Try this: `curl -X POST...`" | "Welcome to your MockHero journey! Let's get started on an exciting adventure..." |
| **Error states** | "Schema validation failed: `orders.user_id` references `users.id` but no `users` table is defined. Add a `users` table or remove the ref." | "Oops! Something went wrong. Please try again later." |
| **Empty states** | "No API calls yet. Grab the cURL example from the docs and make your first request." | "It's quiet here! Why not explore our features?" |
| **Success messages** | "Generated 1,247 records across 4 tables in 89ms." | "Awesome job! Your data has been successfully generated! 🎉" |
| **Marketing copy** | "Stop seeding your database with 'John Doe.' Send a schema, get back Maximilian Bergmann." | "MockHero leverages advanced algorithms to generate realistic synthetic data solutions." |
| **Pricing** | "Free: 1,000 records/day. Pro: 100K records/day, $29/mo. That's it." | "Unlock premium features with our affordable subscription plans!" |
| **Documentation** | "The `ref` type links tables together. Here's a 3-table example:" | "In this section, we will explore the functionality of the referential data type..." |

### Messaging Framework

**Tagline:** "Realistic test data in one API call."

**Homepage headline:** "Stop seeding your database with John Doe."

**Value propositions:**
1. **Locale-aware quality:** "German names for German users. Japanese for Japanese. Not just John Smith for everything."
2. **Relational data:** "Orders reference real user IDs. Reviews reference real products. One API call seeds your entire database."
3. **Agent-ready:** "Your AI coding agent generates test data without you lifting a finger. MCP server included."

**Feature descriptions:**
- Locale-aware data: "500+ real names per locale, weighted by frequency. Valid phone formats. Real city/postal code combinations."
- Relational engine: "Define table relationships with ref fields. MockHero topologically sorts your tables and generates data in dependency order. No orphan records, ever."
- Multiple formats: "JSON for your app. CSV for your spreadsheet. SQL INSERT for your database. Postgres, MySQL, or SQLite — pick your dialect."
- Reproducible output: "Same seed = same data, every time. Your CI tests are deterministic."

**Objection handlers:**
- "I already use Faker." → "Faker gives you John Doe at 123 Main St. MockHero gives you Maximilian Bergmann at Friedrichstraße 42, 10117 Berlin. With a valid phone number. And an order history."
- "Mockaroo does this." → "Mockaroo is a website you visit. MockHero is an API your tools call. Your AI agent generates test data without you leaving your IDE."
- "I just copy production data." → "That's a GDPR violation waiting to happen. MockHero data looks real but isn't. Your compliance team will thank you."
- "I can write a seed script." → "You can. It'll take 2 hours, break when the schema changes, and produce garbage data. Or you can send one API call."

### Elevator Pitches

**5-second:** "MockHero is an API that generates realistic, relational test data from a schema definition."

**30-second:** "Every developer needs test data. Every AI coding agent needs to test generated code. Current options — Faker, Mockaroo, seed scripts — produce obviously fake data with no relational support. MockHero is an API: send a schema, get back production-quality data with correct foreign key relationships, locale-aware names, and valid formats. One request seeds your entire database."

**2-minute:** "Right now, every developer building anything faces the same stupid problem: they need test data, and every option sucks. Faker generates John Doe at 123 Main St. Mockaroo has a dated web UI with no relational data. Seed scripts take hours and break constantly. Some teams even copy production data, which is a compliance nightmare.

MockHero fixes this with a single API endpoint. Send a JSON schema defining your tables and relationships. Get back realistic, locale-aware data with correct foreign key references. German names for German users. Orders that link to real user IDs. Amounts with realistic distributions. All in under a second.

The timing is perfect because AI coding agents are exploding — Cursor, Claude Code, Copilot, Lovable, Bolt. Every one of these agents needs to populate databases to test the code they generate. MockHero includes an MCP server so these agents can call the API natively. The developer never visits our website — their AI agent recommends us.

Free tier is 1,000 records/day. Pro is $29/month for 100K. We're live, the API works, and we're looking for developers who are tired of seed script hell."

### Competitive Differentiation Narrative

The test data landscape has been static for years. Faker was written for a world where developers manually typed seed scripts. Mockaroo was built when "web app" meant a form you fill out in your browser. Neither was designed for a world where AI agents generate entire applications and need to verify their work against realistic data.

MockHero was purpose-built for this moment. The relational data engine — topological sorting, ID lookup maps, distribution-aware reference generation — solves a problem no existing tool addresses. The MCP server puts MockHero inside the AI agent's toolkit, not on a developer's browser tab. The API-first architecture means MockHero works everywhere: in CI/CD pipelines, in agent workflows, in developer scripts, in staging environment setup. No browser required.

The moat deepens with usage. As MockHero accumulates more locale data, more field types, and more schema templates, each additional investment makes the output quality gap wider. Competitors would need to rebuild the entire relational engine and locale data pipeline from scratch — and by then, MockHero's MCP distribution has created network effects in the AI agent ecosystem.

### Brand Anti-Patterns

**Never use corporate marketing language.** No "leverage," "synergy," "solution," "enterprise-grade," "best-in-class," or "cutting-edge." These words signal that a committee wrote the copy. MockHero's voice is one developer talking to another.

**Never use generic stock imagery.** No photos of diverse teams gathered around a laptop. No abstract gradients with floating geometric shapes. If there's imagery, it's screenshots of actual API output, code examples, or data comparisons.

**Never gatekeep with "contact sales."** Every pricing plan has a sign-up button. Every feature is documented publicly. The free tier is genuinely useful, not a crippled teaser. Developers hate being funneled into sales conversations and will leave immediately.

**Never use exclamation marks or emoji in product UI.** The product communicates through precision and clarity, not enthusiasm. "Generated 1,247 records in 89ms" is more compelling than "Your data is ready! 🎉" Error messages are helpful and specific, never apologetic or playful.

**Never claim AI/ML capabilities that don't exist.** The data generation is deterministic, not "AI-powered." The only AI involvement is optional (plain English prompt mode uses an LLM to parse intent, not to generate data). Don't position MockHero as an "AI tool" — it's an API that AI tools use.

**Never show comparison tables that trash competitors by name.** Comparisons should focus on categories ("Unlike faker libraries..."), not named products. Let the output quality comparison speak for itself.

---

## 5. Design Direction

### Design Philosophy

**Code is the hero.** This is an API product. The most important visual elements are code blocks, JSON output, and data previews. Every design decision should make code more readable and data more scannable. If something competes with code for attention, remove it.

**Light and legible by default.** The primary experience is a light-mode interface with excellent readability. Dark mode is supported for developers who prefer it, but light is the default because the landing page and marketing materials should feel approachable, not intimidating.

**Show, don't describe.** Wherever possible, replace explanatory text with live examples. A code block with realistic output is worth 100 words of feature description. The playground on the landing page is the ultimate expression of this principle.

**Generous whitespace, tight components.** The overall layout uses generous spacing between sections. Within components (cards, code blocks, forms), spacing is tighter and more efficient. This creates a visual rhythm that's both airy and information-dense.

### Visual Mood

Modern and polished, inspired by the Supabase and Resend design language. Clean, confident, and approachable — the visual equivalent of well-documented open-source software. Light backgrounds with depth created through subtle shadows and borders rather than heavy color fills. Code blocks are prominent, beautifully styled, and feel alive with syntax highlighting.

The aesthetic says "this was built by someone who cares about craft" without trying too hard. No gradients for the sake of gradients. No animations for the sake of animations. Every visual element serves clarity.

### Color Palette

**Light Mode:**

| Token | Hex | CSS Variable | Tailwind | Usage |
|-------|-----|-------------|----------|-------|
| Primary | `#6C5CE7` | `--color-primary` | `primary` | CTAs, links, active states, brand accent |
| Primary Hover | `#5A4BD5` | `--color-primary-hover` | `primary-hover` | Button hover, link hover |
| Primary Light | `#EDE9FC` | `--color-primary-light` | `primary-light` | Subtle backgrounds, badges, selection |
| Background | `#FFFFFF` | `--color-bg` | `bg` | Page background |
| Surface | `#F8F9FA` | `--color-surface` | `surface` | Cards, code blocks, sections |
| Surface Elevated | `#FFFFFF` | `--color-surface-elevated` | `surface-elevated` | Modals, dropdowns |
| Text | `#1A1A2E` | `--color-text` | `text` | Primary text |
| Text Muted | `#6B7280` | `--color-text-muted` | `text-muted` | Secondary text, captions |
| Text Subtle | `#9CA3AF` | `--color-text-subtle` | `text-subtle` | Placeholders, disabled text |
| Border | `#E5E7EB` | `--color-border` | `border` | Dividers, input borders |
| Border Hover | `#D1D5DB` | `--color-border-hover` | `border-hover` | Input focus, card hover |
| Success | `#10B981` | `--color-success` | `success` | Positive states, confirmations |
| Warning | `#F59E0B` | `--color-warning` | `warning` | Caution states |
| Error | `#EF4444` | `--color-error` | `error` | Error states, destructive actions |
| Info | `#3B82F6` | `--color-info` | `info` | Informational states |

**Dark Mode:**

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Primary | `#8B7CF6` | `--color-primary` | Slightly lighter for dark backgrounds |
| Background | `#0F0F1A` | `--color-bg` | Deep navy-black |
| Surface | `#1A1A2E` | `--color-surface` | Cards, code blocks |
| Surface Elevated | `#252540` | `--color-surface-elevated` | Modals, dropdowns |
| Text | `#E5E7EB` | `--color-text` | Primary text |
| Text Muted | `#9CA3AF` | `--color-text-muted` | Secondary text |
| Border | `#2D2D4A` | `--color-border` | Dividers |

### Typography

**Heading font:** Inter — clean, modern, excellent readability at all sizes. Widely recognized in developer tools. Available on Google Fonts.

**Body font:** Inter — same family for body ensures consistency. The font has excellent legibility at small sizes (14px body text) which matters for data-heavy interfaces.

**Mono font:** JetBrains Mono — designed specifically for code. Excellent ligatures, clear distinction between similar characters (0/O, l/1/I). Available on Google Fonts.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --text-xs: 0.75rem;     /* 12px — fine print, badges */
  --text-sm: 0.875rem;    /* 14px — secondary text, captions */
  --text-base: 1rem;      /* 16px — body text */
  --text-lg: 1.125rem;    /* 18px — large body, lead text */
  --text-xl: 1.25rem;     /* 20px — section headers */
  --text-2xl: 1.5rem;     /* 24px — page section titles */
  --text-3xl: 1.875rem;   /* 30px — page titles */
  --text-4xl: 2.25rem;    /* 36px — hero headlines */
  --text-5xl: 3rem;       /* 48px — landing page hero */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

**Weight usage:**
- 400 (Regular): Body text, descriptions
- 500 (Medium): Labels, navigation, buttons
- 600 (Semibold): Section headings, emphasis
- 700 (Bold): Page titles, hero text, key stats

### Spacing & Layout

**Base unit: 4px.** All spacing derives from multiples of 4.

```css
:root {
  --space-1: 0.25rem;   /* 4px — tight internal padding */
  --space-2: 0.5rem;    /* 8px — small gaps */
  --space-3: 0.75rem;   /* 12px — compact padding */
  --space-4: 1rem;      /* 16px — default padding, gaps */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px — section padding */
  --space-8: 2rem;      /* 32px — large gaps */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px — section spacing */
  --space-16: 4rem;     /* 64px — large section spacing */
  --space-20: 5rem;     /* 80px — hero spacing */
  --space-24: 6rem;     /* 96px — page section breaks */
}
```

**Layout:**
- Max content width: `1200px` (`--max-w-content`)
- Max text width: `720px` (`--max-w-prose`)
- Page padding (horizontal): `24px` on mobile, `48px` on tablet, `64px` on desktop
- Grid: CSS Grid with `gap: var(--space-6)` default
- Minimum 24px between distinct sections

**Responsive breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Component Philosophy

**Border radius:** Consistent `8px` (`0.5rem`) for cards, buttons, inputs. `12px` for larger containers and modals. `4px` for small elements (badges, tags). `9999px` for pills.

**Shadows:** Minimal. Used only for elevated elements (modals, dropdowns, floating cards). Default shadow is subtle: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`. Elevated shadow: `0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)`.

**Borders:** Primary separation mechanism. Use `1px solid var(--color-border)` for card boundaries, input fields, dividers. Avoid using shadows where borders suffice.

**Buttons:**
- Primary: `bg-primary text-white` with `8px` radius. Hover darkens background.
- Secondary: `bg-transparent border border-border text-text` with `8px` radius.
- Ghost: `bg-transparent text-text-muted` with no border. Hover adds subtle background.
- Sizes: `sm` (32px height, 12px padding), `md` (40px height, 16px padding), `lg` (48px height, 20px padding).

**Inputs:** Height `40px`, border `1px solid var(--color-border)`, radius `8px`. Focus: `ring-2 ring-primary/20 border-primary`. Placeholder text uses `--color-text-subtle`.

**Code blocks:** Background `var(--color-surface)`, border `1px solid var(--color-border)`, radius `8px`, padding `16px`. Font: `var(--font-mono)` at `14px`. Syntax highlighting using a theme that matches the brand palette.

### Iconography & Imagery

**Icon library:** Lucide Icons — clean, consistent, open source. Outline style at 20px default size with 1.5px stroke width. Use sparingly — icons supplement text labels, they don't replace them.

**Illustration style:** None for MVP. Clean code examples and data output are more compelling than illustrations for this audience. If illustrations are added later, they should be simple, flat, and geometric — not hand-drawn or playful.

**Photography:** None. This product has no need for stock photos. All visual content is code, data, and UI.

**Data visualization:** Use the brand color palette for any charts or graphs. Primary color for the main data series. Muted colors for secondary data. Always include text labels — don't rely on color alone for meaning.

### Accessibility Commitments

- **WCAG 2.1 AA compliance** for all interactive elements
- **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text and UI components
- **Focus indicators:** Visible focus ring (`ring-2 ring-primary/20`) on all interactive elements
- **Keyboard navigation:** Full keyboard support for all interactive features. Tab order follows visual order. Escape closes modals and dropdowns.
- **Screen readers:** All images have alt text. Form inputs have associated labels. Status messages use `aria-live` regions. Data tables use proper `<th>` and scope attributes.
- **Touch targets:** Minimum 44x44px for all interactive elements on mobile
- **Motion:** Respect `prefers-reduced-motion`. All animations can be disabled system-wide.
- **Color independence:** Never use color as the only indicator of state. Errors have text labels plus icons. Success states use checkmarks plus text.

### Motion & Interaction

**Default transition:** `150ms ease-out` for color changes, opacity. `200ms ease-out` for transforms (scale, translate). `300ms ease-out` for layout shifts.

```css
:root {
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

**What animates:**
- Button hover/active states (color, shadow)
- Input focus states (border color, ring)
- Dropdown/modal open/close (opacity + subtle scale)
- Page transitions (fade between routes)
- Code output appearance in playground (fade-in)

**What doesn't animate:**
- Text content changes (data updates instantly)
- Navigation highlights (instant state change)
- Error messages (appear immediately — urgency matters)

**Hover states:** Subtle background color shift or border darkening. Never dramatic transforms or color changes. The hover should feel like "I can interact with this," not "look at me."

**Loading states:** Skeleton screens for content areas. Inline spinner (16px) for buttons. Never a full-page loading screen — partial content always appears immediately.

### Design Tokens

Consolidated reference of all tokens for implementation:

| Category | Token | CSS Variable | Tailwind | Value |
|----------|-------|-------------|----------|-------|
| **Color** | Primary | `--color-primary` | `primary` | `#6C5CE7` |
| | Primary Hover | `--color-primary-hover` | `primary-hover` | `#5A4BD5` |
| | Primary Light | `--color-primary-light` | `primary-light` | `#EDE9FC` |
| | Background | `--color-bg` | `bg` | `#FFFFFF` |
| | Surface | `--color-surface` | `surface` | `#F8F9FA` |
| | Text | `--color-text` | `text` | `#1A1A2E` |
| | Text Muted | `--color-text-muted` | `text-muted` | `#6B7280` |
| | Border | `--color-border` | `border` | `#E5E7EB` |
| | Success | `--color-success` | `success` | `#10B981` |
| | Warning | `--color-warning` | `warning` | `#F59E0B` |
| | Error | `--color-error` | `error` | `#EF4444` |
| | Info | `--color-info` | `info` | `#3B82F6` |
| **Typography** | Heading | `--font-heading` | `font-heading` | Inter |
| | Body | `--font-body` | `font-body` | Inter |
| | Mono | `--font-mono` | `font-mono` | JetBrains Mono |
| | Body size | `--text-base` | `text-base` | `1rem` (16px) |
| | Small | `--text-sm` | `text-sm` | `0.875rem` (14px) |
| **Spacing** | Base | `--space-4` | `4` | `1rem` (16px) |
| | Section | `--space-12` | `12` | `3rem` (48px) |
| | Page section | `--space-24` | `24` | `6rem` (96px) |
| **Radius** | Small | `--radius-sm` | `rounded` | `4px` |
| | Default | `--radius-md` | `rounded-lg` | `8px` |
| | Large | `--radius-lg` | `rounded-xl` | `12px` |
| | Full | `--radius-full` | `rounded-full` | `9999px` |
| **Shadow** | Default | `--shadow-sm` | `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` |
| | Elevated | `--shadow-md` | `shadow-md` | `0 4px 6px rgba(0,0,0,0.05)` |
| **Transition** | Fast | `--transition-fast` | — | `150ms ease-out` |
| | Base | `--transition-base` | — | `200ms ease-out` |
| | Slow | `--transition-slow` | — | `300ms ease-out` |
| **Layout** | Max content | `--max-w-content` | `max-w-7xl` | `1200px` |
| | Max prose | `--max-w-prose` | `max-w-3xl` | `720px` |
