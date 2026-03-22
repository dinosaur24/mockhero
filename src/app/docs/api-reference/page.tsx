import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponsiveTable } from "@/components/ui/responsive-table"

export const metadata = {
  title: "API Reference",
  description: "Complete reference for every MockHero API endpoint.",
}

export default function ApiReferencePage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">API Reference</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          All endpoints live under{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
            https://api.mockhero.dev/api/v1
          </code>
          . Requests must include a valid API key and use{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">Content-Type: application/json</code>{" "}
          for POST bodies.
        </p>
      </div>

      <Separator />

      {/* Base URL */}
      <section>
        <h2 id="base-url" className="text-xl sm:text-2xl font-bold">Base URL</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`https://api.mockhero.dev/api/v1`}
        </pre>
      </section>

      <Separator />

      {/* ── POST /generate ── */}
      <section>
        <h2 id="generate" className="text-xl sm:text-2xl font-bold">
          POST /generate <Badge variant="outline">Core</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          The primary endpoint. Accepts one of three mutually exclusive input modes:
          schema, prompt, or template. Returns generated data in your chosen format.
        </p>

        {/* Common Parameters */}
        <h3 id="generate-common" className="mt-8 text-base sm:text-lg font-semibold">Common Parameters</h3>
        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">format</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><code className="font-mono">&quot;json&quot;</code></TableCell>
              <TableCell>Output format. One of <code className="font-mono">json</code>, <code className="font-mono">csv</code>, <code className="font-mono">sql</code>. CSV and SQL require <Badge variant="secondary" className="ml-1">Pro</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">locale</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><code className="font-mono">&quot;en&quot;</code></TableCell>
              <TableCell>Locale code for generated names, addresses, etc. 22 locales supported.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">sql_dialect</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><code className="font-mono">&quot;postgres&quot;</code></TableCell>
              <TableCell>SQL dialect when <code className="font-mono">format</code> is <code className="font-mono">sql</code>. One of <code className="font-mono">postgres</code>, <code className="font-mono">mysql</code>, <code className="font-mono">sqlite</code>. Controls quoting, types, and INSERT syntax.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">seed</code></TableCell>
              <TableCell><code className="font-mono">integer</code></TableCell>
              <TableCell>random</TableCell>
              <TableCell>Seed for reproducible output. Same seed + same request = same data. <Badge variant="secondary" className="ml-1">Pro</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        {/* Schema Mode */}
        <h3 id="schema-mode" className="mt-10 text-base sm:text-lg font-semibold">Schema Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass a <code className="rounded bg-muted px-1.5 py-0.5 font-mono">tables</code> array
          with explicit field definitions for full control.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead></TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">tables</code></TableCell>
              <TableCell><code className="font-mono">array</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Array of table definitions.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].name</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Table name (used as key in response object).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].count</code></TableCell>
              <TableCell><code className="font-mono">integer</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Number of records to generate (1 to per-request limit).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].fields</code></TableCell>
              <TableCell><code className="font-mono">array</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Array of field definitions.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].fields[].name</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Field name.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].fields[].type</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Field type identifier. See <a href="/docs/field-types" className="text-primary underline underline-offset-4">Field Types</a>.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">tables[].fields[].params</code></TableCell>
              <TableCell><code className="font-mono">object</code></TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>Type-specific parameters (e.g. <code className="font-mono">min</code>, <code className="font-mono">max</code>, <code className="font-mono">values</code>).</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "tables": [
    {
      "name": "products",
      "count": 3,
      "fields": [
        { "name": "id",    "type": "uuid" },
        { "name": "title", "type": "product_name" },
        { "name": "price", "type": "price", "params": { "min": 9.99, "max": 299.99 } },
        { "name": "sku",   "type": "sku" },
        { "name": "active","type": "boolean" }
      ]
    }
  ],
  "format": "json"
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "products": [
      { "id": "d4e5f6a7-...", "title": "Ergonomic Mesh Chair", "price": 189.50, "sku": "SKU-8A3F2C", "active": true },
      { "id": "b1c2d3e4-...", "title": "Wireless Noise-Canceling Headphones", "price": 74.99, "sku": "SKU-1D7E9B", "active": true },
      { "id": "f8a9b0c1-...", "title": "USB-C Docking Station", "price": 129.00, "sku": "SKU-4G6H2K", "active": false }
    ]
  },
  "meta": {
    "tables": 1,
    "total_records": 3,
    "records_per_table": { "products": 3 },
    "format": "json",
    "locale": "en",
    "seed": 4419827,
    "generation_time_ms": 89
  }
}`}
        </pre>

        {/* Prompt Mode */}
        <h3 id="prompt-mode" className="mt-10 text-base sm:text-lg font-semibold">Prompt Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the data you need in plain English. MockHero infers the schema, generates
          the data, and returns the inferred schema alongside the results.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead></TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">prompt</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Natural-language description of your desired data. Max 5,000 characters.</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "prompt": "A blog platform with 5 authors and 12 posts. Each post has a title, slug, markdown body, published date, and belongs to one author.",
  "format": "json"
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "authors": [
      { "id": "a1b2c3d4-...", "name": "Priya Sharma", "email": "priya.sharma@example.com" }
    ],
    "posts": [
      {
        "id": "e5f6a7b8-...",
        "author_id": "a1b2c3d4-...",
        "title": "Understanding Event-Driven Architecture",
        "slug": "understanding-event-driven-architecture",
        "body": "## Introduction\\n\\nEvent-driven architecture...",
        "published_at": "2025-11-03T09:14:00Z"
      }
    ]
  },
  "meta": {
    "tables": 2,
    "total_records": 17,
    "records_per_table": { "authors": 5, "posts": 12 },
    "format": "json",
    "locale": "en",
    "seed": 7723041,
    "generation_time_ms": 312
  }
}`}
        </pre>

        {/* Template Mode */}
        <h3 id="template-mode" className="mt-10 text-base sm:text-lg font-semibold">Template Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use a pre-built template for common data shapes. See{" "}
          <a href="/docs/templates" className="text-primary underline underline-offset-4">Templates</a>{" "}
          for full details on each template.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead></TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">template</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
              <TableCell>Template name: <code className="font-mono">ecommerce</code>, <code className="font-mono">blog</code>, <code className="font-mono">saas</code>, or <code className="font-mono">social</code>.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">scale</code></TableCell>
              <TableCell><code className="font-mono">number</code></TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>Multiplier for default record counts. Default <code className="font-mono">1</code>. Range 0.1 to 100.</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "saas",
  "scale": 2,
  "format": "json"
}`}
        </pre>
      </section>

      <Separator />

      {/* ── GET /types ── */}
      <section>
        <h2 id="types" className="text-xl sm:text-2xl font-bold">
          GET /types
        </h2>
        <p className="mt-2 text-muted-foreground">
          Returns the full list of supported field types, grouped by category, including accepted
          parameters for each type.
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`GET /api/v1/types`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response (truncated)</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "identity": {
    "first_name": {
      "description": "Locale-aware first name",
      "params": {},
      "example": "Amara"
    },
    "email": {
      "description": "Realistic email address based on name fields",
      "params": { "domain": "string (optional, e.g. 'company.de')" },
      "example": "amara.okafor@gmail.com"
    }
  },
  "location": { "...": "..." },
  "financial": { "...": "..." },
  "locales": ["en", "de", "fr", "..."],
  "formats": ["json", "csv", "sql"]
}`}
        </pre>
      </section>

      <Separator />

      {/* ── GET /templates ── */}
      <section>
        <h2 id="templates-endpoint" className="text-xl sm:text-2xl font-bold">
          GET /templates
        </h2>
        <p className="mt-2 text-muted-foreground">
          Lists all available templates with their default table counts and descriptions.
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`GET /api/v1/templates`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "templates": [
    {
      "id": "ecommerce",
      "name": "E-Commerce",
      "description": "Storefront with customers, products, orders, line items, and reviews.",
      "tables": ["customers", "products", "orders", "order_items", "reviews"],
      "default_counts": { "customers": 100, "products": 50, "orders": 300, "order_items": 900, "reviews": 200 }
    },
    {
      "id": "blog",
      "name": "Blog",
      "description": "Multi-author blog with posts, comments, tags, and a post_tags junction table.",
      "tables": ["authors", "posts", "comments", "tags", "post_tags"],
      "default_counts": { "authors": 30, "posts": 150, "comments": 600, "tags": 20, "post_tags": 400 }
    },
    {
      "id": "saas",
      "name": "SaaS",
      "description": "Multi-tenant SaaS with organizations, members, subscriptions, and invoices.",
      "tables": ["organizations", "members", "subscriptions", "invoices"],
      "default_counts": { "organizations": 20, "members": 100, "subscriptions": 20, "invoices": 120 }
    },
    {
      "id": "social",
      "name": "Social Network",
      "description": "Social platform with users, posts, likes, follows, and direct messages.",
      "tables": ["users", "posts", "likes", "follows", "messages"],
      "default_counts": { "users": 150, "posts": 600, "likes": 3000, "follows": 2000, "messages": 1000 }
    }
  ]
}`}
        </pre>
      </section>

      <Separator />

      {/* ── POST /schema/detect ── */}
      <section>
        <h2 id="schema-detect" className="text-xl sm:text-2xl font-bold">
          POST /schema/detect <Badge variant="secondary">Pro+</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Upload a SQL CREATE TABLE statement or JSON sample and MockHero
          will detect the schema and return a ready-to-use table definition you can pass
          directly to the generate endpoint.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead></TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">sql</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>SQL CREATE TABLE statements to parse.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">sample_json</code></TableCell>
              <TableCell><code className="font-mono">object</code></TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>Sample JSON data to infer schema from.</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/schema/detect
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "sql": "CREATE TABLE users (\\n  id UUID PRIMARY KEY,\\n  name VARCHAR(100),\\n  email VARCHAR(255) UNIQUE,\\n  created_at TIMESTAMPTZ DEFAULT NOW()\\n);"
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "schema": {
    "tables": [
      {
        "name": "users",
        "fields": [
          { "name": "id",         "type": "uuid" },
          { "name": "name",       "type": "full_name" },
          { "name": "email",      "type": "email" },
          { "name": "created_at", "type": "timestamp" }
        ]
      }
    ]
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* ── POST /generate/async ── */}
      <section>
        <h2 id="generate-async" className="text-xl sm:text-2xl font-bold">
          POST /generate/async <Badge variant="secondary">Scale</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Asynchronous bulk generation for large datasets. Creates a job and returns a
          202 immediately. Poll the job status endpoint to retrieve results when complete.
          Supports the same three input modes as the sync endpoint (schema, prompt, template).
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate/async
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "ecommerce",
  "scale": 10,
  "format": "json"
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response (202 Accepted)</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "job_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "pending",
  "poll_url": "/api/v1/jobs/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "records_total": 15500
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Limits</h4>
        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Tier required</TableCell>
              <TableCell><Badge variant="secondary">Scale</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max body size</TableCell>
              <TableCell>5 MB (vs. 1 MB sync)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Processing timeout</TableCell>
              <TableCell>300 seconds</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Rate limits</TableCell>
              <TableCell>Same daily/per-minute limits as sync endpoint</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>
      </section>

      <Separator />

      {/* ── GET /jobs/:id ── */}
      <section>
        <h2 id="jobs" className="text-xl sm:text-2xl font-bold">
          GET /jobs/:id <Badge variant="secondary">Scale</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Poll the status of an async job. Returns the generated data in the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">data</code> field
          once the job completes.
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`GET /api/v1/jobs/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response (completed)</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "job_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "records_total": 15500,
  "created_at": "2026-03-20T14:30:00Z",
  "started_at": "2026-03-20T14:30:00Z",
  "completed_at": "2026-03-20T14:30:12Z",
  "data": { "customers": [...], "orders": [...] }
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Job Statuses</h4>
        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">pending</code></TableCell>
              <TableCell>Job created, waiting to start processing.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">processing</code></TableCell>
              <TableCell>Data generation in progress.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">completed</code></TableCell>
              <TableCell>Generation finished. <code className="font-mono">data</code> field contains the result.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">failed</code></TableCell>
              <TableCell>Generation failed. <code className="font-mono">error</code> field contains the reason.</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>
      </section>

      <Separator />

      {/* ── Webhooks ── */}
      <section>
        <h2 id="webhooks" className="text-xl sm:text-2xl font-bold">
          Webhooks <Badge variant="secondary">Scale</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Receive HTTP POST notifications when generation completes. Useful for async workflows
          and CI/CD pipelines. Each webhook delivery includes an HMAC-SHA256 signature for
          verification.
        </p>

        <h3 id="create-webhook" className="mt-8 text-base sm:text-lg font-semibold">POST /webhooks</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Register a webhook endpoint. The secret is returned only once — store it securely.
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "url": "https://your-app.com/api/mockhero-webhook",
  "events": ["generation.completed"]
}`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "id": "a1b2c3d4-...",
  "url": "https://your-app.com/api/mockhero-webhook",
  "events": ["generation.completed"],
  "secret": "e8f3a9b1c7d2e5f4a6b8c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1"
}`}
        </pre>

        <h3 id="list-webhooks" className="mt-8 text-base sm:text-lg font-semibold">GET /webhooks</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          List all active webhooks. Secrets are not returned in the list response.
        </p>

        <h3 id="delete-webhook" className="mt-8 text-base sm:text-lg font-semibold">DELETE /webhooks/:id</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove a webhook. It will no longer receive deliveries.
        </p>

        <h3 id="webhook-payload" className="mt-8 text-base sm:text-lg font-semibold">Webhook Payload</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each delivery is a POST to your URL with these headers:
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">X-MockHero-Event</code></TableCell>
              <TableCell>Event type (e.g. <code className="font-mono">generation.completed</code>)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-MockHero-Signature</code></TableCell>
              <TableCell>HMAC-SHA256 signature: <code className="font-mono">sha256=&lt;hex&gt;</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-MockHero-Delivery</code></TableCell>
              <TableCell>Unique delivery ID for idempotency</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <h4 className="mt-6 text-sm font-semibold">Verifying Signatures</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`import crypto from "crypto";

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}`}
        </pre>
      </section>

      <Separator />

      {/* ── GET /health ── */}
      <section>
        <h2 id="health" className="text-xl sm:text-2xl font-bold">GET /health</h2>
        <p className="mt-2 text-muted-foreground">
          Public endpoint (no auth required) that returns API status. Useful for uptime monitoring.
        </p>

        <h4 className="mt-6 text-sm font-semibold">Request</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`GET /api/v1/health`}
        </pre>

        <h4 className="mt-6 text-sm font-semibold">Response</h4>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-03-20T14:30:00Z"
}`}
        </pre>
      </section>

      <Separator />

      {/* Response Headers */}
      <section>
        <h2 id="response-headers" className="text-xl sm:text-2xl font-bold">Response Headers</h2>
        <p className="mt-2 text-muted-foreground">
          Every authenticated response includes rate-limit headers so you can track usage programmatically.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Limit</code></TableCell>
              <TableCell>Maximum records allowed per day on your plan.</TableCell>
              <TableCell><code className="font-mono">100000</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Remaining</code></TableCell>
              <TableCell>Records remaining in the current daily window.</TableCell>
              <TableCell><code className="font-mono">94320</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Reset</code></TableCell>
              <TableCell>ISO 8601 timestamp when the daily limit resets (midnight UTC).</TableCell>
              <TableCell><code className="font-mono">2026-03-21T00:00:00.000Z</code></TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>
      </section>

      <Separator />

      {/* Error Codes */}
      <section>
        <h2 id="error-codes" className="text-xl sm:text-2xl font-bold">Error Codes</h2>
        <p className="mt-2 text-muted-foreground">
          See the full <a href="/docs/errors" className="text-primary underline underline-offset-4">Error Codes</a>{" "}
          page for detailed examples. Here is a summary.
        </p>

        <ResponsiveTable><Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">400</code></TableCell>
              <TableCell><code className="font-mono">VALIDATION_ERROR</code></TableCell>
              <TableCell>Malformed JSON or missing required fields.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">401</code></TableCell>
              <TableCell><code className="font-mono">UNAUTHORIZED</code></TableCell>
              <TableCell>Missing or invalid API key.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">403</code></TableCell>
              <TableCell><code className="font-mono">FEATURE_REQUIRES_UPGRADE</code></TableCell>
              <TableCell>Feature not available on your plan.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">413</code></TableCell>
              <TableCell><code className="font-mono">PAYLOAD_TOO_LARGE</code></TableCell>
              <TableCell>Request body exceeds the 1 MB limit.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">422</code></TableCell>
              <TableCell><code className="font-mono">VALIDATION_ERROR</code></TableCell>
              <TableCell>Schema validation failed or prompt could not be converted.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">429</code></TableCell>
              <TableCell><code className="font-mono">RATE_LIMIT_EXCEEDED</code></TableCell>
              <TableCell>Daily or per-minute rate limit exceeded.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">500</code></TableCell>
              <TableCell><code className="font-mono">INTERNAL_ERROR</code></TableCell>
              <TableCell>Unexpected server error. Retry or contact support.</TableCell>
            </TableRow>
          </TableBody>
        </Table></ResponsiveTable>

        <p className="mt-4 text-sm text-muted-foreground">
          All error responses follow a consistent envelope:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of what went wrong."
  }
}`}
        </pre>
      </section>
    </div>
  )
}
