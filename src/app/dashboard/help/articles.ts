export interface HelpArticle {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
}

export const helpCategories = [
  { id: "getting-started", label: "Getting Started", icon: "Rocket" },
  { id: "api-keys", label: "API Keys", icon: "Key" },
  { id: "making-requests", label: "Making Requests", icon: "Send" },
  { id: "schema-mode", label: "Schema Mode", icon: "Database" },
  { id: "prompt-mode", label: "Prompt Mode", icon: "MessageSquare" },
  { id: "templates", label: "Templates", icon: "Layout" },
  { id: "output-formats", label: "Output Formats", icon: "FileJson" },
  { id: "relational-data", label: "Relational Data", icon: "Link2" },
  { id: "locales", label: "Locales", icon: "Globe" },
  { id: "mcp-server", label: "MCP Server", icon: "Bot" },
  { id: "rate-limits", label: "Rate Limits & Quotas", icon: "Gauge" },
  { id: "billing", label: "Billing & Plans", icon: "CreditCard" },
  { id: "errors", label: "Error Codes", icon: "AlertTriangle" },
  { id: "troubleshooting", label: "Troubleshooting", icon: "Wrench" },
]

export const helpArticles: HelpArticle[] = [
  // ─────────────────────────────────────────────
  // GETTING STARTED
  // ─────────────────────────────────────────────
  {
    id: "what-is-mockhero",
    title: "What is MockHero?",
    category: "getting-started",
    tags: ["introduction", "overview", "about", "what", "synthetic", "test data", "mock data", "fake data"],
    content: `
      <p>MockHero is a <strong>synthetic test data API</strong>. Send a JSON schema describing the data you need, and MockHero returns realistic, relationally consistent fake data in seconds.</p>

      <p><strong>Key capabilities:</strong></p>
      <ul>
        <li><strong>156 field types</strong> &mdash; names, emails, addresses, UUIDs, currencies, and much more</li>
        <li><strong>22 locales</strong> &mdash; generate data localized to specific countries and languages</li>
        <li><strong>Relational integrity</strong> &mdash; foreign key references between tables are automatically resolved</li>
        <li><strong>Multiple output formats</strong> &mdash; JSON (default), CSV, and SQL with dialect selection</li>
        <li><strong>Schema mode</strong> &mdash; define exact table structures with typed fields</li>
        <li><strong>Prompt mode</strong> &mdash; describe what you need in plain English</li>
        <li><strong>Templates</strong> &mdash; pre-built schemas for common use cases (ecommerce, blog, SaaS, social)</li>
        <li><strong>MCP server</strong> &mdash; integrate MockHero directly into AI agents like Claude and Cursor</li>
      </ul>

      <p><strong>Common use cases:</strong></p>
      <ul>
        <li>Seeding development and staging databases</li>
        <li>Writing integration and end-to-end tests</li>
        <li>Building UI prototypes with realistic data</li>
        <li>Populating demos and sales environments</li>
        <li>Load testing with high-volume synthetic data</li>
      </ul>
    `,
  },
  {
    id: "creating-your-account",
    title: "Creating your account",
    category: "getting-started",
    tags: ["sign up", "register", "account", "create", "new", "onboarding"],
    content: `
      <p>Getting started with MockHero takes less than a minute.</p>

      <ol>
        <li>Visit <strong>mockhero.dev</strong> and click <strong>Get Started</strong>.</li>
        <li>Sign in with your email using a magic link &mdash; no password required.</li>
        <li>Once signed in, you land on the <strong>Dashboard</strong>.</li>
        <li>Navigate to <strong>API Keys</strong> and create your first key.</li>
        <li>Start making API calls immediately.</li>
      </ol>

      <p>Every new account starts on the <strong>Free plan</strong>, which includes:</p>
      <ul>
        <li>1,000 records per day</li>
        <li>100 records per request</li>
        <li>10 requests per minute</li>
      </ul>

      <p>No credit card is required. You can upgrade to Pro or Scale at any time from the <strong>Billing</strong> page in your dashboard.</p>
    `,
  },
  {
    id: "your-first-api-call",
    title: "Your first API call",
    category: "getting-started",
    tags: ["first", "call", "request", "curl", "example", "quickstart", "hello world", "tutorial"],
    content: `
      <p>Once you have an API key, you can generate data with a single request. Here is a minimal example using <strong>curl</strong>:</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "tables": [
      {
        "name": "users",
        "count": 5,
        "fields": [
          { "name": "id", "type": "uuid" },
          { "name": "first_name", "type": "firstName" },
          { "name": "last_name", "type": "lastName" },
          { "name": "email", "type": "email" }
        ]
      }
    ]
  }'</code></pre>

      <p>This generates 5 user records, each with a UUID, first name, last name, and email address.</p>

      <p><strong>The response</strong> includes a <code>data</code> object with your tables and a <code>meta</code> object with request details:</p>

<pre><code>{
  "data": {
    "users": [
      {
        "id": "a1b2c3d4-...",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@example.com"
      }
    ]
  },
  "meta": {
    "records": 5,
    "tables": 1,
    "duration_ms": 42,
    "seed": 839201
  }
}</code></pre>

      <p>Replace <code>YOUR_API_KEY</code> with the key you created in the dashboard.</p>
    `,
  },
  {
    id: "understanding-response-format",
    title: "Understanding the response format",
    category: "getting-started",
    tags: ["response", "format", "json", "data", "meta", "envelope", "structure"],
    content: `
      <p>Every successful MockHero response follows the same envelope structure:</p>

<pre><code>{
  "data": { ... },
  "meta": { ... }
}</code></pre>

      <p><strong>The <code>data</code> object</strong> contains one key per table you requested. Each key maps to an array of generated records.</p>

      <p><strong>The <code>meta</code> object</strong> provides information about the request:</p>

      <table>
        <thead><tr><th>Field</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>records</code></td><td>Total number of records generated across all tables</td></tr>
          <tr><td><code>tables</code></td><td>Number of tables in the response</td></tr>
          <tr><td><code>duration_ms</code></td><td>Server-side processing time in milliseconds</td></tr>
          <tr><td><code>seed</code></td><td>The seed used for generation (reuse for deterministic output)</td></tr>
          <tr><td><code>format</code></td><td>Output format used (json, csv, or sql)</td></tr>
        </tbody>
      </table>

      <p>For <strong>CSV and SQL</strong> output formats, the <code>data</code> object contains string values instead of arrays. See the Output Formats section for details.</p>

      <p><strong>Error responses</strong> return a different structure with <code>error</code> and <code>message</code> fields. See the Error Codes section.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // API KEYS
  // ─────────────────────────────────────────────
  {
    id: "creating-an-api-key",
    title: "Creating an API key",
    category: "api-keys",
    tags: ["create", "api key", "generate", "new key", "token"],
    content: `
      <p>You need an API key to authenticate requests to MockHero.</p>

      <ol>
        <li>Sign in and go to <strong>Dashboard &rarr; API Keys</strong>.</li>
        <li>Click <strong>Create API Key</strong>.</li>
        <li>Optionally give the key a descriptive name (e.g., "CI/CD Pipeline" or "Local Dev").</li>
        <li>Click <strong>Create</strong>.</li>
        <li>Your key appears once &mdash; <strong>copy it immediately</strong> and store it securely.</li>
      </ol>

      <p><strong>Important:</strong> The full key is only shown at creation time. After that, only the last 4 characters are visible in the dashboard. If you lose a key, revoke it and create a new one.</p>

      <p>You can create multiple keys to separate usage across environments (development, staging, CI, production tests).</p>
    `,
  },
  {
    id: "naming-and-managing-keys",
    title: "Naming and managing keys",
    category: "api-keys",
    tags: ["name", "manage", "organize", "rename", "label", "key management"],
    content: `
      <p>Giving each API key a descriptive name helps you track which key is used where.</p>

      <p><strong>Best practices for naming keys:</strong></p>
      <ul>
        <li>Use the environment: <code>Production Tests</code>, <code>Staging Seed</code>, <code>Local Dev</code></li>
        <li>Use the service: <code>CI Pipeline</code>, <code>E2E Tests</code>, <code>Demo App</code></li>
        <li>Use the team: <code>Frontend Team</code>, <code>QA Team</code></li>
      </ul>

      <p>The <strong>API Keys</strong> page in your dashboard shows all your active keys along with:</p>
      <ul>
        <li>Key name (if set)</li>
        <li>Last 4 characters of the key</li>
        <li>Creation date</li>
        <li>Last used date</li>
      </ul>

      <p>This makes it easy to identify unused keys that should be revoked and to trace usage back to a specific integration.</p>
    `,
  },
  {
    id: "revoking-a-key",
    title: "Revoking a key",
    category: "api-keys",
    tags: ["revoke", "delete", "remove", "disable", "deactivate", "invalidate"],
    content: `
      <p>If a key is compromised or no longer needed, revoke it immediately.</p>

      <ol>
        <li>Go to <strong>Dashboard &rarr; API Keys</strong>.</li>
        <li>Find the key you want to revoke.</li>
        <li>Click the <strong>Revoke</strong> button.</li>
        <li>Confirm the action.</li>
      </ol>

      <p><strong>What happens when you revoke a key:</strong></p>
      <ul>
        <li>The key stops working <strong>immediately</strong> &mdash; any request using it will return a <code>401 Unauthorized</code> error.</li>
        <li>Revocation is <strong>permanent</strong> and cannot be undone.</li>
        <li>Your other keys continue to work normally.</li>
        <li>Historical usage data for the revoked key is retained.</li>
      </ul>

      <p>After revoking a key, create a new one and update your application configuration.</p>
    `,
  },
  {
    id: "api-key-security",
    title: "API key security best practices",
    category: "api-keys",
    tags: ["security", "best practices", "secret", "environment variable", "env", "gitignore", "protect"],
    content: `
      <p>Your API key grants access to your MockHero account and counts against your quotas. Treat it like a password.</p>

      <p><strong>Do:</strong></p>
      <ul>
        <li>Store keys in <strong>environment variables</strong> or a secrets manager (e.g., <code>MOCKHERO_API_KEY</code>)</li>
        <li>Use different keys for different environments</li>
        <li>Revoke keys you no longer use</li>
        <li>Add <code>.env</code> to your <code>.gitignore</code></li>
        <li>Rotate keys periodically</li>
      </ul>

      <p><strong>Don't:</strong></p>
      <ul>
        <li>Commit keys to source control</li>
        <li>Share keys in chat, email, or documentation</li>
        <li>Expose keys in client-side JavaScript (use a backend proxy)</li>
        <li>Use a single key for all environments</li>
      </ul>

      <p><strong>Example using an environment variable:</strong></p>

<pre><code># .env
MOCKHERO_API_KEY=mk_live_abc123...

# In your code (Node.js)
const apiKey = process.env.MOCKHERO_API_KEY</code></pre>

      <p>If you suspect a key has been exposed, revoke it immediately and create a replacement.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // MAKING REQUESTS
  // ─────────────────────────────────────────────
  {
    id: "authentication",
    title: "Authentication",
    category: "making-requests",
    tags: ["auth", "authentication", "x-api-key", "header", "api key", "authorize"],
    content: `
      <p>All requests to the MockHero API must include your API key in the <code>x-api-key</code> header.</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{ ... }'</code></pre>

      <p><strong>In JavaScript (fetch):</strong></p>

<pre><code>const response = await fetch("https://api.mockhero.dev/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.MOCKHERO_API_KEY,
  },
  body: JSON.stringify({ tables: [...] }),
})</code></pre>

      <p><strong>In Python (requests):</strong></p>

<pre><code>import requests

response = requests.post(
    "https://api.mockhero.dev/v1/generate",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY",
    },
    json={"tables": [...]},
)</code></pre>

      <p>If the key is missing or invalid, the API returns <code>401 Unauthorized</code>.</p>
    `,
  },
  {
    id: "request-format",
    title: "Request format and required fields",
    category: "making-requests",
    tags: ["request", "format", "body", "payload", "fields", "required", "schema", "tables"],
    content: `
      <p>The <code>/v1/generate</code> endpoint accepts a POST request with a JSON body. You can use either <strong>schema mode</strong> or <strong>prompt mode</strong>.</p>

      <p><strong>Schema mode (required fields):</strong></p>

<pre><code>{
  "tables": [
    {
      "name": "table_name",   // required
      "count": 10,            // required — number of rows
      "fields": [             // required — array of field definitions
        {
          "name": "field_name", // required — column name
          "type": "fieldType"   // required — one of 156 field types
        }
      ]
    }
  ]
}</code></pre>

      <p><strong>Prompt mode (required fields):</strong></p>

<pre><code>{
  "prompt": "Generate 10 users with name, email, and signup date"
}</code></pre>

      <p><strong>Optional top-level fields</strong> (both modes):</p>
      <ul>
        <li><code>locale</code> &mdash; string, e.g. <code>"de"</code> or <code>"ja"</code> (default: <code>"en"</code>)</li>
        <li><code>seed</code> &mdash; number for deterministic output</li>
        <li><code>format</code> &mdash; <code>"json"</code>, <code>"csv"</code>, or <code>"sql"</code> (default: <code>"json"</code>)</li>
        <li><code>dialect</code> &mdash; for SQL format: <code>"postgres"</code>, <code>"mysql"</code>, <code>"sqlite"</code> (default: <code>"postgres"</code>)</li>
      </ul>
    `,
  },
  {
    id: "response-envelope",
    title: "Understanding the response envelope",
    category: "making-requests",
    tags: ["response", "envelope", "data", "meta", "structure", "result", "output"],
    content: `
      <p>Every successful response (HTTP 200) wraps results in a consistent envelope:</p>

<pre><code>{
  "data": {
    "users": [ ... ],
    "orders": [ ... ]
  },
  "meta": {
    "records": 50,
    "tables": 2,
    "duration_ms": 87,
    "seed": 4821903,
    "format": "json"
  }
}</code></pre>

      <p><strong><code>data</code></strong> &mdash; an object keyed by table name. Each value is an array of records (for JSON format) or a string (for CSV/SQL).</p>

      <p><strong><code>meta</code></strong> &mdash; request metadata:</p>
      <ul>
        <li><code>records</code> &mdash; total records generated across all tables</li>
        <li><code>tables</code> &mdash; number of tables in the response</li>
        <li><code>duration_ms</code> &mdash; server processing time</li>
        <li><code>seed</code> &mdash; seed used (save this to reproduce the same data)</li>
        <li><code>format</code> &mdash; output format used</li>
      </ul>

      <p>Use the <code>seed</code> from <code>meta</code> to replay the exact same generation later &mdash; useful for reproducible tests and debugging.</p>
    `,
  },
  {
    id: "using-seeds",
    title: "Using seeds for deterministic output",
    category: "making-requests",
    tags: ["seed", "deterministic", "reproducible", "consistent", "repeatable", "same data"],
    content: `
      <p>By default, MockHero generates different data on every request. If you need <strong>repeatable, deterministic output</strong>, pass a <code>seed</code> parameter.</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "seed": 42,
    "tables": [
      {
        "name": "users",
        "count": 3,
        "fields": [
          { "name": "name", "type": "fullName" },
          { "name": "email", "type": "email" }
        ]
      }
    ]
  }'</code></pre>

      <p>The same seed with the same schema always produces the <strong>exact same data</strong>. This is useful for:</p>
      <ul>
        <li><strong>Snapshot tests</strong> &mdash; assert against a known dataset</li>
        <li><strong>Debugging</strong> &mdash; reproduce the same data that caused an issue</li>
        <li><strong>CI pipelines</strong> &mdash; consistent test fixtures across runs</li>
      </ul>

      <p>If you do not pass a seed, one is randomly generated and returned in <code>meta.seed</code>. Save it if you want to replay the request later.</p>

      <p><strong>Note:</strong> Seeds are deterministic only when the schema is identical. Changing field order, adding fields, or changing counts will produce different data even with the same seed.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // SCHEMA MODE
  // ─────────────────────────────────────────────
  {
    id: "defining-tables-and-fields",
    title: "Defining tables and fields",
    category: "schema-mode",
    tags: ["table", "fields", "define", "schema", "structure", "columns", "rows", "count"],
    content: `
      <p>In schema mode, you describe your data using a <code>tables</code> array. Each table has a <strong>name</strong>, a <strong>count</strong> (number of rows), and a <strong>fields</strong> array.</p>

<pre><code>{
  "tables": [
    {
      "name": "products",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "title", "type": "productName" },
        { "name": "price", "type": "price", "min": 5, "max": 500 },
        { "name": "category", "type": "enum", "values": ["Electronics", "Clothing", "Books"] },
        { "name": "in_stock", "type": "boolean" },
        { "name": "created_at", "type": "pastDate" }
      ]
    }
  ]
}</code></pre>

      <p>Each field requires at minimum a <code>name</code> and <code>type</code>. Some types accept additional parameters like <code>min</code>, <code>max</code>, or <code>values</code>.</p>

      <p><strong>Table rules:</strong></p>
      <ul>
        <li>Table names must be unique within a request</li>
        <li>Field names must be unique within a table</li>
        <li><code>count</code> must be between 1 and your plan's per-request limit</li>
        <li>You can include up to 50 fields per table</li>
      </ul>
    `,
  },
  {
    id: "field-types-overview",
    title: "Available field types overview",
    category: "schema-mode",
    tags: ["field types", "types", "available", "list", "overview", "supported", "156"],
    content: `
      <p>MockHero supports <strong>156 field types</strong> organized into categories. Here are the most commonly used ones:</p>

      <p><strong>Identity:</strong> <code>uuid</code>, <code>autoIncrement</code>, <code>cuid</code>, <code>nanoid</code></p>
      <p><strong>Person:</strong> <code>firstName</code>, <code>lastName</code>, <code>fullName</code>, <code>prefix</code>, <code>suffix</code>, <code>gender</code>, <code>age</code></p>
      <p><strong>Contact:</strong> <code>email</code>, <code>phone</code>, <code>username</code>, <code>avatar</code>, <code>url</code></p>
      <p><strong>Address:</strong> <code>streetAddress</code>, <code>city</code>, <code>state</code>, <code>zipCode</code>, <code>country</code>, <code>latitude</code>, <code>longitude</code></p>
      <p><strong>Finance:</strong> <code>price</code>, <code>amount</code>, <code>currencyCode</code>, <code>creditCardNumber</code>, <code>iban</code>, <code>bitcoinAddress</code></p>
      <p><strong>Date &amp; Time:</strong> <code>pastDate</code>, <code>futureDate</code>, <code>recentDate</code>, <code>dateOfBirth</code>, <code>timestamp</code></p>
      <p><strong>Text:</strong> <code>sentence</code>, <code>paragraph</code>, <code>slug</code>, <code>word</code>, <code>lorem</code></p>
      <p><strong>Internet:</strong> <code>ipv4</code>, <code>ipv6</code>, <code>mac</code>, <code>userAgent</code>, <code>domainName</code>, <code>color</code></p>
      <p><strong>Commerce:</strong> <code>productName</code>, <code>productDescription</code>, <code>department</code>, <code>companyName</code></p>
      <p><strong>Primitives:</strong> <code>boolean</code>, <code>integer</code>, <code>float</code>, <code>enum</code>, <code>json</code></p>
      <p><strong>Relational:</strong> <code>ref</code> (foreign key reference to another table)</p>

      <p>For the complete list with descriptions, visit the <strong>API Reference</strong> at <code>mockhero.dev/docs</code>.</p>
    `,
  },
  {
    id: "field-parameters",
    title: "Field parameters (min, max, values, etc.)",
    category: "schema-mode",
    tags: ["parameters", "min", "max", "values", "options", "enum", "configure", "customize"],
    content: `
      <p>Many field types accept optional parameters to constrain or customize generated values.</p>

      <p><strong>Numeric parameters (<code>min</code>, <code>max</code>):</strong></p>

<pre><code>{ "name": "price", "type": "price", "min": 10, "max": 999 }
{ "name": "age", "type": "integer", "min": 18, "max": 65 }
{ "name": "rating", "type": "float", "min": 1, "max": 5 }</code></pre>

      <p><strong>Enum values (<code>values</code>):</strong></p>

<pre><code>{ "name": "status", "type": "enum", "values": ["active", "inactive", "pending"] }
{ "name": "role", "type": "enum", "values": ["admin", "editor", "viewer"] }</code></pre>

      <p><strong>Precision (<code>precision</code>):</strong></p>

<pre><code>{ "name": "score", "type": "float", "min": 0, "max": 100, "precision": 2 }</code></pre>

      <p><strong>Auto-increment start (<code>start</code>):</strong></p>

<pre><code>{ "name": "id", "type": "autoIncrement", "start": 1000 }</code></pre>

      <p><strong>String length (<code>length</code>):</strong></p>

<pre><code>{ "name": "code", "type": "alphanumeric", "length": 8 }</code></pre>

      <p>If you omit parameters, sensible defaults are used. For instance, <code>price</code> defaults to a range of 1&ndash;1000 with 2 decimal places.</p>
    `,
  },
  {
    id: "nullable-fields",
    title: "Nullable fields",
    category: "schema-mode",
    tags: ["nullable", "null", "optional", "missing", "sparse", "probability"],
    content: `
      <p>Set <code>"nullable": true</code> on any field to have some percentage of values generated as <code>null</code>.</p>

<pre><code>{
  "name": "users",
  "count": 10,
  "fields": [
    { "name": "id", "type": "uuid" },
    { "name": "name", "type": "fullName" },
    { "name": "nickname", "type": "firstName", "nullable": true },
    { "name": "bio", "type": "sentence", "nullable": true, "nullRate": 0.7 }
  ]
}</code></pre>

      <p><strong>How it works:</strong></p>
      <ul>
        <li><code>"nullable": true</code> &mdash; approximately 20% of values will be <code>null</code> (default rate)</li>
        <li><code>"nullRate": 0.7</code> &mdash; 70% of values will be <code>null</code> (custom rate between 0 and 1)</li>
      </ul>

      <p>This is useful for testing how your application handles missing or optional data. Fields without <code>nullable</code> always have a value.</p>

      <p><strong>Note:</strong> In CSV output, null values are rendered as empty strings. In SQL output, they use the <code>NULL</code> keyword.</p>
    `,
  },
  {
    id: "multiple-tables",
    title: "Multiple tables in one request",
    category: "schema-mode",
    tags: ["multiple", "tables", "several", "many", "batch", "together", "join"],
    content: `
      <p>You can generate data for multiple tables in a single request. This is especially useful when combined with <strong>foreign key references</strong>.</p>

<pre><code>{
  "tables": [
    {
      "name": "departments",
      "count": 5,
      "fields": [
        { "name": "id", "type": "autoIncrement" },
        { "name": "name", "type": "department" }
      ]
    },
    {
      "name": "employees",
      "count": 25,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "fullName" },
        { "name": "email", "type": "email" },
        { "name": "department_id", "type": "ref", "table": "departments", "field": "id" }
      ]
    }
  ]
}</code></pre>

      <p>MockHero processes tables in <strong>dependency order</strong> (topological sort), so referenced tables are generated first. You can list tables in any order in your request.</p>

      <p><strong>Limits:</strong></p>
      <ul>
        <li>Up to <strong>20 tables</strong> per request</li>
        <li>Total record count across all tables must stay within your plan's per-request limit</li>
      </ul>
    `,
  },

  // ─────────────────────────────────────────────
  // PROMPT MODE
  // ─────────────────────────────────────────────
  {
    id: "how-prompt-mode-works",
    title: "How prompt mode works",
    category: "prompt-mode",
    tags: ["prompt", "natural language", "plain english", "ai", "describe", "text"],
    content: `
      <p>Prompt mode lets you describe the data you want in <strong>plain English</strong> instead of writing a schema. MockHero interprets your description and generates the appropriate tables and fields.</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "prompt": "Generate 20 users with name, email, signup date, and a subscription plan (free, pro, or enterprise). Also generate 50 orders linked to those users with order date, total amount between $10 and $500, and status (pending, shipped, delivered)."
  }'</code></pre>

      <p>MockHero converts your description into a schema behind the scenes, generates the data, and returns it in the standard response format.</p>

      <p><strong>When to use prompt mode:</strong></p>
      <ul>
        <li>Quick prototyping &mdash; get data without writing a schema</li>
        <li>Exploration &mdash; try different data shapes rapidly</li>
        <li>Non-technical users &mdash; no need to know field type names</li>
      </ul>

      <p>You can combine prompt mode with <code>locale</code>, <code>seed</code>, and <code>format</code> options.</p>

      <p><strong>Daily prompt limits:</strong> Prompt mode has per-day limits based on your plan &mdash; 10 prompts/day (Free), 100 prompts/day (Pro), 500 prompts/day (Scale). Schema mode and template mode are always <strong>unlimited</strong> on all plans.</p>
    `,
  },
  {
    id: "tips-for-better-prompts",
    title: "Tips for better prompts",
    category: "prompt-mode",
    tags: ["prompt", "tips", "better", "improve", "quality", "advice", "guidance"],
    content: `
      <p>The more specific your prompt, the better the results. Here are tips for getting exactly what you need.</p>

      <p><strong>Be specific about quantities:</strong></p>
<pre><code>// Good
"Generate 15 products and 100 reviews linked to those products"

// Vague
"Generate some products with reviews"</code></pre>

      <p><strong>Name the fields you want:</strong></p>
<pre><code>// Good
"Users with id, first_name, last_name, email, created_at, and role (admin or user)"

// Vague
"Users with basic info"</code></pre>

      <p><strong>Specify constraints:</strong></p>
<pre><code>// Good
"Prices between $5 and $200, ratings from 1 to 5 with one decimal"

// Vague
"Products with prices and ratings"</code></pre>

      <p><strong>Mention relationships:</strong></p>
<pre><code>// Good
"Orders linked to users via user_id"

// Vague
"Users and their orders"</code></pre>

      <p><strong>Mention enums explicitly:</strong></p>
<pre><code>// Good
"Status should be one of: draft, published, archived"

// Vague
"Posts with a status"</code></pre>
    `,
  },
  {
    id: "prompt-mode-limitations",
    title: "Prompt mode limitations",
    category: "prompt-mode",
    tags: ["prompt", "limitations", "limits", "constraints", "caveats", "downsides"],
    content: `
      <p>Prompt mode is powerful but has some limitations compared to schema mode.</p>

      <p><strong>Limitations:</strong></p>
      <ul>
        <li><strong>Interpretation variance</strong> &mdash; ambiguous prompts may produce different schemas on different requests. Use a <code>seed</code> and refine your prompt for consistency.</li>
        <li><strong>Field type selection</strong> &mdash; prompt mode picks field types automatically. If you need a specific type (e.g., <code>nanoid</code> instead of <code>uuid</code>), use schema mode.</li>
        <li><strong>Fine-grained parameters</strong> &mdash; you cannot set exact <code>min</code>, <code>max</code>, <code>precision</code>, or <code>nullRate</code> values. Prompt mode uses reasonable defaults.</li>
        <li><strong>Complex relations</strong> &mdash; deeply nested or multi-level foreign key chains may not be inferred correctly. Schema mode gives you full control.</li>
        <li><strong>Performance</strong> &mdash; prompt mode adds a small overhead for interpreting the description (typically 100&ndash;300ms).</li>
        <li><strong>Daily limits</strong> &mdash; prompt mode has per-day limits: 10 prompts/day (Free), 100 (Pro), 500 (Scale). Schema mode and template mode are always unlimited.</li>
      </ul>

      <p><strong>Recommendation:</strong> Start with prompt mode for exploration, then switch to schema mode for production use where you need exact control over the output. Schema mode has no daily prompt cap.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // TEMPLATES
  // ─────────────────────────────────────────────
  {
    id: "available-templates",
    title: "Available templates",
    category: "templates",
    tags: ["templates", "available", "list", "ecommerce", "blog", "saas", "social", "prebuilt"],
    content: `
      <p>Templates are pre-built schemas for common data models. Instead of writing a full schema, specify a template name and get a complete relational dataset.</p>

      <p><strong>Available templates:</strong></p>

      <table>
        <thead><tr><th>Template</th><th>Tables Generated</th></tr></thead>
        <tbody>
          <tr><td><code>ecommerce</code></td><td>customers, products, categories, orders, order_items, reviews</td></tr>
          <tr><td><code>blog</code></td><td>users, posts, categories, comments, tags, post_tags</td></tr>
          <tr><td><code>saas</code></td><td>organizations, users, plans, subscriptions, invoices, features</td></tr>
          <tr><td><code>social</code></td><td>users, posts, comments, likes, follows, messages</td></tr>
        </tbody>
      </table>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "template": "ecommerce",
    "scale": 1
  }'</code></pre>

      <p>Each template generates relationally consistent data with proper foreign key references between all tables.</p>
    `,
  },
  {
    id: "template-scale",
    title: "Using templates with the scale parameter",
    category: "templates",
    tags: ["template", "scale", "size", "multiplier", "volume", "count", "records"],
    content: `
      <p>The <code>scale</code> parameter controls how many records each template generates. It acts as a multiplier on the default record counts.</p>

      <table>
        <thead><tr><th>Scale</th><th>Description</th><th>Example (ecommerce)</th></tr></thead>
        <tbody>
          <tr><td><code>1</code></td><td>Default (small)</td><td>10 customers, 20 products, 30 orders</td></tr>
          <tr><td><code>2</code></td><td>Medium</td><td>20 customers, 40 products, 60 orders</td></tr>
          <tr><td><code>5</code></td><td>Large</td><td>50 customers, 100 products, 150 orders</td></tr>
          <tr><td><code>10</code></td><td>Extra large</td><td>100 customers, 200 products, 300 orders</td></tr>
        </tbody>
      </table>

<pre><code>{
  "template": "blog",
  "scale": 5,
  "locale": "de",
  "seed": 100
}</code></pre>

      <p>The total record count across all tables must stay within your plan's per-request limit. If the scaled count exceeds the limit, the API returns a <code>400</code> error with a message indicating the maximum allowed scale for your plan.</p>

      <p><strong>Tip:</strong> You can combine <code>scale</code> with <code>locale</code>, <code>seed</code>, and <code>format</code> options.</p>
    `,
  },
  {
    id: "customizing-template-output",
    title: "Customizing template output",
    category: "templates",
    tags: ["template", "customize", "override", "modify", "extend", "change"],
    content: `
      <p>You can override specific tables in a template by providing a partial <code>tables</code> array alongside the <code>template</code> field. Overrides are merged with the template schema.</p>

<pre><code>{
  "template": "ecommerce",
  "scale": 2,
  "tables": [
    {
      "name": "products",
      "fields": [
        { "name": "sku", "type": "alphanumeric", "length": 10 },
        { "name": "weight_kg", "type": "float", "min": 0.1, "max": 50 }
      ]
    }
  ]
}</code></pre>

      <p>In this example, the <code>products</code> table keeps all its default template fields, and the two additional fields (<code>sku</code> and <code>weight_kg</code>) are appended.</p>

      <p><strong>Override rules:</strong></p>
      <ul>
        <li>To <strong>add fields</strong> to a template table, include the table by name with the new fields.</li>
        <li>To <strong>change the count</strong> of a specific table, include a <code>count</code> override (this overrides the scale for that table).</li>
        <li>Template tables you do not mention are generated with their defaults.</li>
      </ul>
    `,
  },

  // ─────────────────────────────────────────────
  // OUTPUT FORMATS
  // ─────────────────────────────────────────────
  {
    id: "json-output",
    title: "JSON output (default)",
    category: "output-formats",
    tags: ["json", "output", "format", "default", "javascript", "object", "array"],
    content: `
      <p>JSON is the default output format. Each table in the response is an array of objects.</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "format": "json",
    "tables": [
      {
        "name": "users",
        "count": 3,
        "fields": [
          { "name": "id", "type": "autoIncrement" },
          { "name": "name", "type": "fullName" },
          { "name": "email", "type": "email" }
        ]
      }
    ]
  }'</code></pre>

      <p><strong>Response:</strong></p>

<pre><code>{
  "data": {
    "users": [
      { "id": 1, "name": "Sarah Johnson", "email": "sarah.johnson@example.com" },
      { "id": 2, "name": "Mike Chen", "email": "mike.chen@example.com" },
      { "id": 3, "name": "Lisa Park", "email": "lisa.park@example.com" }
    ]
  },
  "meta": { ... }
}</code></pre>

      <p>JSON format is available on <strong>all plans</strong> including Free. Values use native JSON types: strings, numbers, booleans, and null.</p>
    `,
  },
  {
    id: "csv-output",
    title: "CSV output",
    category: "output-formats",
    tags: ["csv", "output", "format", "comma", "spreadsheet", "excel", "download", "pro"],
    content: `
      <p>CSV output returns each table as a comma-separated string with headers. <strong>Requires Pro plan or higher.</strong></p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "format": "csv",
    "tables": [
      {
        "name": "users",
        "count": 3,
        "fields": [
          { "name": "id", "type": "autoIncrement" },
          { "name": "name", "type": "fullName" },
          { "name": "email", "type": "email" }
        ]
      }
    ]
  }'</code></pre>

      <p><strong>Response:</strong></p>

<pre><code>{
  "data": {
    "users": "id,name,email\\n1,Sarah Johnson,sarah.johnson@example.com\\n2,Mike Chen,mike.chen@example.com\\n3,Lisa Park,lisa.park@example.com"
  },
  "meta": { ... }
}</code></pre>

      <p><strong>Details:</strong></p>
      <ul>
        <li>First row is always the header</li>
        <li>Values containing commas or newlines are quoted</li>
        <li>Null values are represented as empty strings</li>
        <li>Line endings use <code>\\n</code> (LF)</li>
      </ul>
    `,
  },
  {
    id: "sql-output",
    title: "SQL output with dialect selection",
    category: "output-formats",
    tags: ["sql", "output", "format", "insert", "postgres", "mysql", "sqlite", "dialect", "pro"],
    content: `
      <p>SQL output returns <code>CREATE TABLE</code> and <code>INSERT</code> statements ready to run. <strong>Requires Pro plan or higher.</strong></p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "format": "sql",
    "dialect": "postgres",
    "tables": [
      {
        "name": "users",
        "count": 3,
        "fields": [
          { "name": "id", "type": "autoIncrement" },
          { "name": "name", "type": "fullName" },
          { "name": "email", "type": "email" }
        ]
      }
    ]
  }'</code></pre>

      <p><strong>Supported dialects:</strong></p>
      <ul>
        <li><code>postgres</code> (default) &mdash; PostgreSQL-compatible syntax</li>
        <li><code>mysql</code> &mdash; MySQL-compatible syntax</li>
        <li><code>sqlite</code> &mdash; SQLite-compatible syntax</li>
      </ul>

      <p>The generated SQL includes <code>CREATE TABLE IF NOT EXISTS</code> statements with appropriate column types for the chosen dialect, followed by batch <code>INSERT</code> statements.</p>

      <p>Tables are ordered so that referenced tables come first (respecting foreign key dependencies). You can pipe the output directly into your database CLI:</p>

<pre><code># Save and execute
curl ... -o seed.sql
psql -d mydb -f seed.sql</code></pre>
    `,
  },

  // ─────────────────────────────────────────────
  // RELATIONAL DATA
  // ─────────────────────────────────────────────
  {
    id: "foreign-key-references",
    title: "How foreign key references work",
    category: "relational-data",
    tags: ["foreign key", "reference", "relation", "link", "join", "integrity", "ref"],
    content: `
      <p>MockHero supports <strong>foreign key references</strong> between tables, ensuring relational integrity in your generated data.</p>

      <p>When you define a field with <code>"type": "ref"</code>, MockHero picks a random value from the referenced table's field. This guarantees that every foreign key value actually exists in the parent table.</p>

<pre><code>{
  "tables": [
    {
      "name": "authors",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "fullName" }
      ]
    },
    {
      "name": "books",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "title", "type": "sentence" },
        { "name": "author_id", "type": "ref", "table": "authors", "field": "id" }
      ]
    }
  ]
}</code></pre>

      <p>Every <code>author_id</code> in the <code>books</code> table is guaranteed to be a valid <code>id</code> from the <code>authors</code> table. Values are distributed randomly, so some authors may have more books than others.</p>
    `,
  },
  {
    id: "ref-field-type",
    title: "The ref field type",
    category: "relational-data",
    tags: ["ref", "field", "type", "table", "field", "foreign", "reference", "syntax"],
    content: `
      <p>The <code>ref</code> field type creates a foreign key relationship. It requires two parameters:</p>

      <ul>
        <li><code>table</code> &mdash; the name of the referenced table (must exist in the same request)</li>
        <li><code>field</code> &mdash; the name of the field in the referenced table to pull values from</li>
      </ul>

<pre><code>{ "name": "user_id", "type": "ref", "table": "users", "field": "id" }</code></pre>

      <p><strong>Rules:</strong></p>
      <ul>
        <li>The referenced table must be defined in the same request</li>
        <li>The referenced field must exist in that table</li>
        <li>You can reference any field type (not just IDs)</li>
        <li>A <code>ref</code> field can also be <code>nullable</code></li>
        <li>Multiple fields can reference the same table</li>
      </ul>

      <p><strong>Example with nullable ref:</strong></p>

<pre><code>{
  "name": "referred_by",
  "type": "ref",
  "table": "users",
  "field": "id",
  "nullable": true,
  "nullRate": 0.5
}</code></pre>

      <p>This creates a field where 50% of values are valid user IDs and 50% are <code>null</code> &mdash; useful for optional relationships like referral codes.</p>
    `,
  },
  {
    id: "topological-sort",
    title: "Topological sort explained",
    category: "relational-data",
    tags: ["topological", "sort", "order", "dependency", "resolution", "generation order"],
    content: `
      <p>When you request multiple tables with foreign key references, MockHero automatically resolves the <strong>dependency order</strong> using topological sorting.</p>

      <p><strong>How it works:</strong></p>
      <ol>
        <li>MockHero analyzes all <code>ref</code> fields to build a dependency graph.</li>
        <li>Tables are sorted so that <strong>parent tables are generated before child tables</strong>.</li>
        <li>Data is generated in this order, ensuring all referenced values exist.</li>
      </ol>

      <p>You can list tables in <strong>any order</strong> in your request. MockHero figures out the correct generation order automatically.</p>

<pre><code>// These two requests produce identical results:

// Order A: child first
{ "tables": [
  { "name": "orders", "fields": [
    { "name": "user_id", "type": "ref", "table": "users", "field": "id" }
  ], "count": 10 },
  { "name": "users", "fields": [
    { "name": "id", "type": "uuid" }
  ], "count": 5 }
]}

// Order B: parent first
{ "tables": [
  { "name": "users", "fields": [
    { "name": "id", "type": "uuid" }
  ], "count": 5 },
  { "name": "orders", "fields": [
    { "name": "user_id", "type": "ref", "table": "users", "field": "id" }
  ], "count": 10 }
]}</code></pre>

      <p><strong>Circular references</strong> (A references B and B references A) are not supported and will return a <code>SCHEMA_ERROR</code>.</p>
    `,
  },
  {
    id: "multi-table-example",
    title: "Multi-table relational example",
    category: "relational-data",
    tags: ["multi-table", "example", "complete", "relational", "ecommerce", "orders", "products"],
    content: `
      <p>Here is a complete example generating an ecommerce dataset with three related tables:</p>

<pre><code>curl -X POST https://api.mockhero.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "tables": [
      {
        "name": "customers",
        "count": 10,
        "fields": [
          { "name": "id", "type": "uuid" },
          { "name": "name", "type": "fullName" },
          { "name": "email", "type": "email" }
        ]
      },
      {
        "name": "products",
        "count": 20,
        "fields": [
          { "name": "id", "type": "autoIncrement" },
          { "name": "name", "type": "productName" },
          { "name": "price", "type": "price", "min": 5, "max": 200 }
        ]
      },
      {
        "name": "orders",
        "count": 50,
        "fields": [
          { "name": "id", "type": "uuid" },
          { "name": "customer_id", "type": "ref", "table": "customers", "field": "id" },
          { "name": "product_id", "type": "ref", "table": "products", "field": "id" },
          { "name": "quantity", "type": "integer", "min": 1, "max": 5 },
          { "name": "ordered_at", "type": "recentDate" },
          { "name": "status", "type": "enum", "values": ["pending", "shipped", "delivered"] }
        ]
      }
    ]
  }'</code></pre>

      <p>Every <code>customer_id</code> in orders references a valid customer, and every <code>product_id</code> references a valid product. The tables are generated in dependency order automatically.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // LOCALES
  // ─────────────────────────────────────────────
  {
    id: "supported-locales",
    title: "Supported locales list",
    category: "locales",
    tags: ["locales", "languages", "countries", "supported", "list", "i18n", "internationalization"],
    content: `
      <p>MockHero supports <strong>22 locales</strong> for generating regionally appropriate names, addresses, phone numbers, and other locale-sensitive data.</p>

      <table>
        <thead><tr><th>Code</th><th>Language / Region</th></tr></thead>
        <tbody>
          <tr><td><code>en</code></td><td>English (US) &mdash; default</td></tr>
          <tr><td><code>en_GB</code></td><td>English (UK)</td></tr>
          <tr><td><code>en_AU</code></td><td>English (Australia)</td></tr>
          <tr><td><code>de</code></td><td>German</td></tr>
          <tr><td><code>fr</code></td><td>French</td></tr>
          <tr><td><code>es</code></td><td>Spanish</td></tr>
          <tr><td><code>pt_BR</code></td><td>Portuguese (Brazil)</td></tr>
          <tr><td><code>it</code></td><td>Italian</td></tr>
          <tr><td><code>nl</code></td><td>Dutch</td></tr>
          <tr><td><code>pl</code></td><td>Polish</td></tr>
          <tr><td><code>sv</code></td><td>Swedish</td></tr>
          <tr><td><code>da</code></td><td>Danish</td></tr>
          <tr><td><code>nb_NO</code></td><td>Norwegian</td></tr>
          <tr><td><code>fi</code></td><td>Finnish</td></tr>
          <tr><td><code>ru</code></td><td>Russian</td></tr>
          <tr><td><code>uk</code></td><td>Ukrainian</td></tr>
          <tr><td><code>ja</code></td><td>Japanese</td></tr>
          <tr><td><code>ko</code></td><td>Korean</td></tr>
          <tr><td><code>zh_CN</code></td><td>Chinese (Simplified)</td></tr>
          <tr><td><code>zh_TW</code></td><td>Chinese (Traditional)</td></tr>
          <tr><td><code>ar</code></td><td>Arabic</td></tr>
          <tr><td><code>hi</code></td><td>Hindi</td></tr>
        </tbody>
      </table>

<pre><code>{
  "locale": "ja",
  "tables": [
    {
      "name": "users",
      "count": 5,
      "fields": [
        { "name": "name", "type": "fullName" },
        { "name": "address", "type": "streetAddress" },
        { "name": "phone", "type": "phone" }
      ]
    }
  ]
}</code></pre>

      <p>The locale affects fields like names, addresses, phone numbers, and cities. Fields like UUIDs, booleans, and numbers are locale-independent.</p>
    `,
  },
  {
    id: "auto-locale-detection",
    title: "Auto-locale detection with country field",
    category: "locales",
    tags: ["auto", "locale", "detection", "country", "automatic", "smart"],
    content: `
      <p>When you include a <code>country</code> field in your schema and set <code>"locale": "auto"</code>, MockHero automatically matches locale-sensitive fields to each row's country.</p>

<pre><code>{
  "locale": "auto",
  "tables": [
    {
      "name": "international_users",
      "count": 10,
      "fields": [
        { "name": "country", "type": "country" },
        { "name": "name", "type": "fullName" },
        { "name": "city", "type": "city" },
        { "name": "phone", "type": "phone" }
      ]
    }
  ]
}</code></pre>

      <p><strong>How it works:</strong></p>
      <ul>
        <li>Each row gets a random country.</li>
        <li>The name, city, and phone for that row are generated using the locale matching that country.</li>
        <li>This produces data like: a Japanese name with a Tokyo city and Japanese phone format for a Japan row.</li>
      </ul>

      <p>If the generated country does not map to a supported locale, MockHero falls back to <code>en</code> (English US) for that row.</p>

      <p>This is ideal for generating <strong>realistic international datasets</strong> where each row is internally consistent.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // MCP SERVER
  // ─────────────────────────────────────────────
  {
    id: "what-is-mcp",
    title: "What is MCP?",
    category: "mcp-server",
    tags: ["mcp", "model context protocol", "ai", "agent", "tool", "what is"],
    content: `
      <p><strong>MCP (Model Context Protocol)</strong> is an open standard that lets AI assistants (like Claude, Cursor, and other agents) use external tools and services during a conversation.</p>

      <p>MockHero provides an <strong>MCP server</strong> that exposes data generation as a tool for AI agents. This means:</p>

      <ul>
        <li>An AI agent can generate test data <strong>on your behalf</strong> during a conversation</li>
        <li>The agent calls MockHero directly &mdash; no copy-pasting curl commands</li>
        <li>Data is generated and returned inline in the agent's response</li>
      </ul>

      <p><strong>Example workflow:</strong></p>
      <ol>
        <li>You ask Claude: "Create a test database with 50 users and 200 orders"</li>
        <li>Claude calls the MockHero MCP tool with the appropriate schema</li>
        <li>MockHero generates the data and returns it to Claude</li>
        <li>Claude presents the data or uses it to write seed scripts, tests, etc.</li>
      </ol>

      <p>The MCP server uses your API key for authentication and respects your plan's rate limits and quotas.</p>
    `,
  },
  {
    id: "installing-mcp-server",
    title: "Installing the MCP server",
    category: "mcp-server",
    tags: ["mcp", "install", "setup", "npm", "npx", "configuration", "server"],
    content: `
      <p>The MockHero MCP server is distributed as an npm package. Install it globally or use <code>npx</code>.</p>

      <p><strong>Option 1: Global install</strong></p>

<pre><code>npm install -g @mockhero/mcp-server</code></pre>

      <p><strong>Option 2: Use npx (no install)</strong></p>

<pre><code>npx @mockhero/mcp-server --api-key YOUR_API_KEY</code></pre>

      <p><strong>Configuration for Claude Desktop:</strong></p>
      <p>Add the following to your Claude Desktop MCP config (<code>claude_desktop_config.json</code>):</p>

<pre><code>{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}</code></pre>

      <p><strong>Configuration for Cursor:</strong></p>
      <p>Add MockHero in <strong>Cursor Settings &rarr; MCP Servers</strong> with the same command and environment variable.</p>

      <p>After configuration, restart the AI application. The MockHero tool will appear in the agent's available tools.</p>
    `,
  },
  {
    id: "using-mcp-with-agents",
    title: "Using MockHero with Claude, Cursor, and other agents",
    category: "mcp-server",
    tags: ["mcp", "claude", "cursor", "agent", "ai", "usage", "workflow", "tool"],
    content: `
      <p>Once the MCP server is configured, you can ask your AI agent to generate data naturally.</p>

      <p><strong>Example prompts for Claude / Cursor:</strong></p>
      <ul>
        <li>"Generate 100 users with realistic names and emails using MockHero"</li>
        <li>"Use MockHero to create test data for an ecommerce app with products, orders, and customers"</li>
        <li>"Create a SQL seed file with 50 blog posts and 200 comments using MockHero"</li>
      </ul>

      <p>The agent will call the MockHero tool with an appropriate schema and return the results inline. You can then ask the agent to:</p>

      <ul>
        <li>Write a database seed script using the generated data</li>
        <li>Create test fixtures from the data</li>
        <li>Analyze the data structure or suggest schema improvements</li>
        <li>Convert the data to a different format</li>
      </ul>

      <p><strong>Tips:</strong></p>
      <ul>
        <li>Be specific about quantities and field types for best results</li>
        <li>Ask for a specific locale if you need localized data</li>
        <li>Request a seed if you want reproducible output</li>
        <li>The agent uses your API key, so all usage counts against your plan's quotas</li>
      </ul>
    `,
  },

  // ─────────────────────────────────────────────
  // RATE LIMITS & QUOTAS
  // ─────────────────────────────────────────────
  {
    id: "understanding-plan-limits",
    title: "Understanding your plan limits",
    category: "rate-limits",
    tags: ["plan", "limits", "quota", "rate limit", "records", "requests", "per day", "per minute"],
    content: `
      <p>Every MockHero plan has the following limits:</p>

      <table>
        <thead><tr><th>Limit</th><th>Free</th><th>Pro ($29/mo)</th><th>Scale ($79/mo)</th></tr></thead>
        <tbody>
          <tr><td><strong>Records per day</strong></td><td>1,000</td><td>100,000</td><td>1,000,000</td></tr>
          <tr><td><strong>Records per request</strong></td><td>100</td><td>10,000</td><td>50,000</td></tr>
          <tr><td><strong>Requests per minute</strong></td><td>10</td><td>60</td><td>120</td></tr>
          <tr><td><strong>Prompt mode</strong></td><td>10/day</td><td>100/day</td><td>500/day</td></tr>
          <tr><td><strong>Schema &amp; template mode</strong></td><td colspan="3">Unlimited on all plans</td></tr>
        </tbody>
      </table>

      <p><strong>Records per day</strong> resets at midnight UTC. This is the total across all requests and all API keys on your account.</p>

      <p><strong>Records per request</strong> is the maximum total records across all tables in a single API call. For example, on the Free plan, a request with 3 tables of 40 records each (120 total) would exceed the 100-record limit.</p>

      <p><strong>Requests per minute</strong> is a sliding-window rate limit applied per account.</p>

      <p><strong>Prompt mode limits</strong> apply only to requests using the <code>prompt</code> field (plain English mode). Schema mode and template mode are always unlimited, regardless of plan.</p>

      <p>Check your current usage on the <strong>Dashboard &rarr; Usage</strong> page.</p>
    `,
  },
  {
    id: "hitting-a-limit",
    title: "What happens when you hit a limit",
    category: "rate-limits",
    tags: ["limit", "exceeded", "over", "quota", "429", "error", "throttle", "blocked"],
    content: `
      <p>When you exceed a limit, the API returns an error response instead of generating data.</p>

      <p><strong>Rate limit exceeded (too many requests per minute):</strong></p>

<pre><code>HTTP 429 Too Many Requests

{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "You have exceeded 10 requests per minute. Please wait before retrying.",
  "retryAfter": 12
}</code></pre>

      <p>The <code>retryAfter</code> field tells you how many seconds to wait. The response also includes a <code>Retry-After</code> HTTP header.</p>

      <p><strong>Daily quota exceeded:</strong></p>

<pre><code>HTTP 429 Too Many Requests

{
  "error": "DAILY_QUOTA_EXCEEDED",
  "message": "You have used 1,000 of 1,000 daily records. Resets at midnight UTC.",
  "resetsAt": "2026-03-24T00:00:00Z"
}</code></pre>

      <p><strong>Per-request limit exceeded:</strong></p>

<pre><code>HTTP 400 Bad Request

{
  "error": "REQUEST_LIMIT_EXCEEDED",
  "message": "Total records (150) exceeds your per-request limit of 100. Reduce record count or upgrade your plan."
}</code></pre>

      <p>To resolve limit issues, wait for the reset, reduce your request size, or upgrade your plan.</p>
    `,
  },
  {
    id: "rate-limit-headers",
    title: "Rate limit headers in responses",
    category: "rate-limits",
    tags: ["headers", "rate limit", "remaining", "reset", "x-ratelimit", "http headers"],
    content: `
      <p>Every API response includes rate limit headers so you can track your usage programmatically.</p>

      <table>
        <thead><tr><th>Header</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>X-RateLimit-Limit</code></td><td>Your plan's requests-per-minute limit</td></tr>
          <tr><td><code>X-RateLimit-Remaining</code></td><td>Requests remaining in the current window</td></tr>
          <tr><td><code>X-RateLimit-Reset</code></td><td>Unix timestamp when the rate limit window resets</td></tr>
          <tr><td><code>X-DailyQuota-Limit</code></td><td>Your plan's daily record limit</td></tr>
          <tr><td><code>X-DailyQuota-Remaining</code></td><td>Records remaining today</td></tr>
          <tr><td><code>X-DailyQuota-Reset</code></td><td>Unix timestamp when the daily quota resets (midnight UTC)</td></tr>
        </tbody>
      </table>

      <p><strong>Example response headers:</strong></p>

<pre><code>X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 1711234560
X-DailyQuota-Limit: 100000
X-DailyQuota-Remaining: 98500
X-DailyQuota-Reset: 1711238400</code></pre>

      <p>Use these headers to implement client-side throttling and avoid hitting limits. When <code>X-RateLimit-Remaining</code> reaches 0, wait until the reset timestamp before making more requests.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // BILLING & PLANS
  // ─────────────────────────────────────────────
  {
    id: "plan-comparison",
    title: "Plan comparison",
    category: "billing",
    tags: ["plans", "pricing", "comparison", "free", "pro", "scale", "features", "tiers"],
    content: `
      <p>MockHero offers three plans to fit your needs.</p>

      <table>
        <thead><tr><th>Feature</th><th>Free</th><th>Pro ($29/mo)</th><th>Scale ($79/mo)</th></tr></thead>
        <tbody>
          <tr><td>Records per day</td><td>1,000</td><td>100,000</td><td>1,000,000</td></tr>
          <tr><td>Records per request</td><td>100</td><td>10,000</td><td>50,000</td></tr>
          <tr><td>Requests per minute</td><td>10</td><td>60</td><td>120</td></tr>
          <tr><td>Prompt mode</td><td>10/day</td><td>100/day</td><td>500/day</td></tr>
          <tr><td>Output formats</td><td>JSON</td><td>JSON, CSV, SQL</td><td>JSON, CSV, SQL</td></tr>
          <tr><td>Schema mode</td><td>Unlimited</td><td>Unlimited</td><td>Unlimited</td></tr>
          <tr><td>Template mode</td><td>Unlimited</td><td>Unlimited</td><td>Unlimited</td></tr>
          <tr><td>MCP server</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>All 156 field types</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>All 22 locales</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Priority support</td><td>No</td><td>Yes</td><td>Yes</td></tr>
        </tbody>
      </table>

      <p>All plans include full access to all field types, locales, templates, and the MCP server. Paid plans unlock CSV/SQL output and higher limits.</p>
    `,
  },
  {
    id: "upgrading-your-plan",
    title: "Upgrading your plan",
    category: "billing",
    tags: ["upgrade", "plan", "pro", "scale", "change", "switch", "billing"],
    content: `
      <p>You can upgrade your plan at any time from the dashboard.</p>

      <ol>
        <li>Go to <strong>Dashboard &rarr; Billing</strong>.</li>
        <li>Click <strong>Upgrade</strong> on the plan you want.</li>
        <li>Enter your payment details (if not already on file).</li>
        <li>Confirm the upgrade.</li>
      </ol>

      <p><strong>What happens when you upgrade:</strong></p>
      <ul>
        <li>New limits take effect <strong>immediately</strong></li>
        <li>You are charged a prorated amount for the remainder of the current billing cycle</li>
        <li>Your billing date stays the same</li>
        <li>Daily record quota resets to the new plan's limit</li>
      </ul>

      <p><strong>Example:</strong> If you are on Free and upgrade to Pro ($29/mo) on day 15 of a 30-day month, you pay approximately $14.50 for the first partial month, then $29/mo going forward.</p>

      <p>You can upgrade from Free to Pro, Free to Scale, or Pro to Scale.</p>
    `,
  },
  {
    id: "downgrading-or-canceling",
    title: "Downgrading or canceling",
    category: "billing",
    tags: ["downgrade", "cancel", "cancellation", "free", "stop", "subscription", "end"],
    content: `
      <p>You can downgrade or cancel your subscription at any time.</p>

      <ol>
        <li>Go to <strong>Dashboard &rarr; Billing</strong>.</li>
        <li>Click <strong>Change Plan</strong>.</li>
        <li>Select the lower plan (or Free to cancel the paid subscription).</li>
        <li>Confirm the change.</li>
      </ol>

      <p><strong>What happens:</strong></p>
      <ul>
        <li>You keep your current plan's limits until the <strong>end of the billing period</strong></li>
        <li>After the billing period ends, your account switches to the new plan</li>
        <li>No further charges are made</li>
        <li>Your data, API keys, and account remain active</li>
        <li>If you exceed the new plan's limits after the switch, requests will be throttled</li>
      </ul>

      <p><strong>Important:</strong> Downgrading does not trigger a refund for the current billing period. You have full access to your current plan until the period ends.</p>
    `,
  },
  {
    id: "payment-methods-and-invoices",
    title: "Payment methods and invoices",
    category: "billing",
    tags: ["payment", "invoice", "credit card", "receipt", "billing", "stripe"],
    content: `
      <p>MockHero uses Stripe for secure payment processing.</p>

      <p><strong>Accepted payment methods:</strong></p>
      <ul>
        <li>Visa, Mastercard, American Express, Discover</li>
        <li>Other Stripe-supported cards depending on your region</li>
      </ul>

      <p><strong>Managing your payment method:</strong></p>
      <ol>
        <li>Go to <strong>Dashboard &rarr; Billing</strong>.</li>
        <li>Click <strong>Manage Subscription</strong> to open the Stripe customer portal.</li>
        <li>Update your card, view invoices, or download receipts.</li>
      </ol>

      <p><strong>Invoices:</strong></p>
      <ul>
        <li>Invoices are generated automatically at the start of each billing cycle</li>
        <li>You receive an email receipt after each payment</li>
        <li>All invoices are available in the Stripe customer portal</li>
        <li>Invoices include your plan, billing period, and amount charged</li>
      </ul>

      <p>If a payment fails, Stripe will retry several times. If payment remains unsuccessful, your account will be downgraded to the Free plan after a grace period.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // ERROR CODES
  // ─────────────────────────────────────────────
  {
    id: "common-error-codes",
    title: "Common error codes and fixes",
    category: "errors",
    tags: ["error", "codes", "common", "fix", "solution", "troubleshoot", "400", "401", "429"],
    content: `
      <p>Here are the most common error codes and how to resolve them.</p>

      <table>
        <thead><tr><th>Code</th><th>HTTP</th><th>Meaning</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td><code>UNAUTHORIZED</code></td><td>401</td><td>Missing or invalid API key</td><td>Check the <code>x-api-key</code> header</td></tr>
          <tr><td><code>SCHEMA_ERROR</code></td><td>400</td><td>Invalid schema definition</td><td>Check table/field structure and types</td></tr>
          <tr><td><code>RATE_LIMIT_EXCEEDED</code></td><td>429</td><td>Too many requests per minute</td><td>Wait for the <code>Retry-After</code> period</td></tr>
          <tr><td><code>DAILY_QUOTA_EXCEEDED</code></td><td>429</td><td>Daily record limit reached</td><td>Wait until midnight UTC or upgrade</td></tr>
          <tr><td><code>REQUEST_LIMIT_EXCEEDED</code></td><td>400</td><td>Too many records in one request</td><td>Reduce count or upgrade plan</td></tr>
          <tr><td><code>INVALID_FORMAT</code></td><td>400</td><td>Unsupported output format</td><td>Use <code>json</code>, <code>csv</code>, or <code>sql</code></td></tr>
          <tr><td><code>INVALID_LOCALE</code></td><td>400</td><td>Unsupported locale code</td><td>Check the supported locales list</td></tr>
          <tr><td><code>CIRCULAR_REFERENCE</code></td><td>400</td><td>Tables reference each other in a cycle</td><td>Remove the circular dependency</td></tr>
          <tr><td><code>INTERNAL_ERROR</code></td><td>500</td><td>Server-side issue</td><td>Retry the request; contact support if persistent</td></tr>
        </tbody>
      </table>

      <p>All error responses include an <code>error</code> code and a human-readable <code>message</code> explaining the issue.</p>
    `,
  },
  {
    id: "schema-error-troubleshooting",
    title: "SCHEMA_ERROR troubleshooting",
    category: "errors",
    tags: ["schema", "error", "invalid", "field", "type", "missing", "troubleshoot"],
    content: `
      <p><code>SCHEMA_ERROR</code> indicates a problem with your request schema. Here are the most common causes.</p>

      <p><strong>Unknown field type:</strong></p>
<pre><code>// Error: Unknown field type "name"
{ "name": "user_name", "type": "name" }

// Fix: Use a valid type
{ "name": "user_name", "type": "fullName" }</code></pre>

      <p><strong>Missing required properties:</strong></p>
<pre><code>// Error: Field missing "type" property
{ "name": "email" }

// Fix: Add the type
{ "name": "email", "type": "email" }</code></pre>

      <p><strong>Invalid ref target:</strong></p>
<pre><code>// Error: Referenced table "accounts" not found
{ "name": "account_id", "type": "ref", "table": "accounts", "field": "id" }

// Fix: Ensure "accounts" table is in the same request</code></pre>

      <p><strong>Duplicate table or field names:</strong></p>
<pre><code>// Error: Duplicate table name "users"
// Fix: Each table name must be unique in a request</code></pre>

      <p><strong>Empty fields array:</strong></p>
<pre><code>// Error: Table must have at least one field
// Fix: Add at least one field definition to the table</code></pre>

      <p>The error <code>message</code> field usually pinpoints the exact problem and location.</p>
    `,
  },
  {
    id: "authentication-errors",
    title: "Authentication errors",
    category: "errors",
    tags: ["authentication", "auth", "401", "unauthorized", "forbidden", "key", "invalid"],
    content: `
      <p>Authentication errors occur when the API cannot verify your identity.</p>

      <p><strong><code>401 Unauthorized</code> &mdash; Missing API key:</strong></p>
<pre><code>{
  "error": "UNAUTHORIZED",
  "message": "Missing x-api-key header"
}</code></pre>
      <p><strong>Fix:</strong> Add the <code>x-api-key</code> header to your request.</p>

      <p><strong><code>401 Unauthorized</code> &mdash; Invalid API key:</strong></p>
<pre><code>{
  "error": "UNAUTHORIZED",
  "message": "Invalid API key"
}</code></pre>
      <p><strong>Fix:</strong> Double-check the key value. Common mistakes include:</p>
      <ul>
        <li>Extra whitespace or newlines in the key</li>
        <li>Using a revoked key</li>
        <li>Copying only part of the key</li>
        <li>Using a key from a different environment</li>
      </ul>

      <p><strong><code>403 Forbidden</code> &mdash; Feature not available on plan:</strong></p>
<pre><code>{
  "error": "PLAN_RESTRICTION",
  "message": "CSV output requires a Pro or Scale plan"
}</code></pre>
      <p><strong>Fix:</strong> Upgrade your plan or use a feature available on your current plan.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // TROUBLESHOOTING
  // ─────────────────────────────────────────────
  {
    id: "unexpected-data",
    title: "API returns unexpected data",
    category: "troubleshooting",
    tags: ["unexpected", "wrong", "data", "incorrect", "different", "debug", "troubleshoot"],
    content: `
      <p>If the generated data does not match your expectations, here are the most common causes.</p>

      <p><strong>Wrong field type:</strong></p>
      <ul>
        <li><code>name</code> is not a valid type &mdash; use <code>fullName</code>, <code>firstName</code>, or <code>lastName</code></li>
        <li><code>number</code> is not a valid type &mdash; use <code>integer</code> or <code>float</code></li>
        <li>Check the field types documentation for the correct type name</li>
      </ul>

      <p><strong>Missing parameters:</strong></p>
      <ul>
        <li>Forgot <code>values</code> on an <code>enum</code> field &mdash; defaults may not match your expectations</li>
        <li>Forgot <code>min</code>/<code>max</code> on numeric fields &mdash; defaults may be too wide or narrow</li>
      </ul>

      <p><strong>Locale mismatch:</strong></p>
      <ul>
        <li>Expecting Japanese names but forgot to set <code>"locale": "ja"</code></li>
        <li>Default locale is <code>en</code> (English US)</li>
      </ul>

      <p><strong>Seed confusion:</strong></p>
      <ul>
        <li>Different seeds produce different data &mdash; ensure you are using the same seed if you expect identical output</li>
        <li>Schema changes invalidate seeds &mdash; any change to fields or counts produces different data</li>
      </ul>

      <p><strong>Debugging tip:</strong> Check the <code>meta.seed</code> in the response. Use it to reproduce the exact same request while you troubleshoot.</p>
    `,
  },
  {
    id: "slow-response-times",
    title: "Slow response times",
    category: "troubleshooting",
    tags: ["slow", "performance", "latency", "timeout", "speed", "fast", "optimize"],
    content: `
      <p>MockHero is designed for fast generation, but some requests take longer than others. Here is how to optimize performance.</p>

      <p><strong>Factors that affect speed:</strong></p>
      <ul>
        <li><strong>Record count</strong> &mdash; generating 50,000 records takes longer than 100</li>
        <li><strong>Table count</strong> &mdash; more tables means more processing</li>
        <li><strong>Field count</strong> &mdash; tables with many fields take longer per row</li>
        <li><strong>Prompt mode</strong> &mdash; adds 100&ndash;300ms for interpretation overhead</li>
        <li><strong>SQL/CSV format</strong> &mdash; serialization to text adds time compared to JSON</li>
      </ul>

      <p><strong>Optimization tips:</strong></p>
      <ul>
        <li>Request only the fields you need</li>
        <li>Split very large requests into smaller batches</li>
        <li>Use schema mode instead of prompt mode for predictable performance</li>
        <li>Use JSON format when you do not specifically need CSV or SQL</li>
        <li>Check <code>meta.duration_ms</code> to benchmark different approaches</li>
      </ul>

      <p><strong>Typical response times:</strong></p>
      <ul>
        <li>100 records, 1 table: &lt; 50ms</li>
        <li>1,000 records, 3 tables: &lt; 200ms</li>
        <li>10,000 records, 5 tables: &lt; 1s</li>
        <li>50,000 records: 2&ndash;5s</li>
      </ul>

      <p>If responses are consistently slow (over 10 seconds), check your network connection or contact support.</p>
    `,
  },
  {
    id: "cors-issues",
    title: "CORS issues in the browser",
    category: "troubleshooting",
    tags: ["cors", "browser", "frontend", "cross-origin", "blocked", "access-control", "proxy"],
    content: `
      <p>If you are calling the MockHero API directly from a browser and seeing CORS errors, here is how to fix it.</p>

      <p><strong>The error:</strong></p>
<pre><code>Access to fetch at 'https://api.mockhero.dev/v1/generate' from origin
'http://localhost:3000' has been blocked by CORS policy</code></pre>

      <p><strong>Why it happens:</strong></p>
      <p>Browser security restricts cross-origin requests. The MockHero API allows CORS from any origin, but if you are seeing this error, the issue is likely one of:</p>
      <ul>
        <li><strong>Missing Content-Type header</strong> &mdash; ensure you set <code>Content-Type: application/json</code></li>
        <li><strong>Preflight failure</strong> &mdash; check that your request does not include unexpected custom headers</li>
        <li><strong>Network/proxy issue</strong> &mdash; a corporate proxy or VPN may be blocking the preflight OPTIONS request</li>
      </ul>

      <p><strong>Recommended: Use a backend proxy</strong></p>
      <p>For production applications, call MockHero from your backend to avoid exposing your API key in the browser:</p>

<pre><code>// Next.js API route (app/api/generate/route.ts)
export async function POST(req: Request) {
  const body = await req.json()
  const res = await fetch("https://api.mockhero.dev/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.MOCKHERO_API_KEY!,
    },
    body: JSON.stringify(body),
  })
  return Response.json(await res.json())
}</code></pre>

      <p>This keeps your API key on the server and avoids any CORS issues.</p>
    `,
  },
]
