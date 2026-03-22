import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Documentation",
  description: "Learn how to generate realistic test data with the MockHero API.",
}

export default function DocsOverview() {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          MockHero is a developer API that generates realistic, relationally-consistent
          test data in a single call. Describe what you need with a schema, a plain-English
          prompt, or a pre-built template and get back production-quality JSON, CSV, or SQL.
        </p>
      </div>

      <Separator />

      {/* Quick Start */}
      <section>
        <h2 id="quick-start" className="text-xl sm:text-2xl font-bold">Quick Start</h2>
        <p className="mt-2 text-muted-foreground">
          Get generating in under a minute. You only need an API key and a single HTTP request.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <div className="min-w-0">
              <p className="font-semibold">Get an API key</p>
              <p className="text-sm text-muted-foreground">
                Sign up at{" "}
                <Link href="/sign-up" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  mockhero.dev/sign-up
                </Link>{" "}
                and copy your key from the dashboard. All keys start with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">mh_</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            <div className="min-w-0">
              <p className="font-semibold">Make your first call</p>
              <p className="text-sm text-muted-foreground">
                Pick one of three input modes below and POST to{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">/api/v1/generate</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
            <div className="min-w-0">
              <p className="font-semibold">Use the data</p>
              <p className="text-sm text-muted-foreground">
                Pipe the JSON response into your database seeder, test suite, or frontend prototype.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Three Input Modes */}
      <section>
        <h2 id="input-modes" className="text-xl sm:text-2xl font-bold">Three Input Modes</h2>
        <p className="mt-2 text-muted-foreground">
          MockHero accepts three ways to describe the data you need. Each one hits the same{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">POST /api/v1/generate</code>{" "}
          endpoint.
        </p>

        <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Schema Mode</CardTitle>
              <CardDescription>Full control over every table and field type.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Define your tables, fields, and field types explicitly. Best for precise,
                reproducible data that exactly matches your database schema.
              </p>
              <Badge variant="outline">Most flexible</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt Mode</CardTitle>
              <CardDescription>Describe your data in plain English.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Write a natural-language description and MockHero infers the schema
                for you. Perfect for prototyping or when you want data fast.
              </p>
              <Badge variant="outline">Fastest start</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Mode</CardTitle>
              <CardDescription>Pre-built schemas for common use cases.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Choose from ecommerce, blog, saas, or social templates. Ships with
                sensible defaults and a scale parameter.
              </p>
              <Badge variant="outline">Zero config</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Schema Mode Example */}
      <section>
        <h3 id="schema-example" className="text-base sm:text-lg font-semibold">Schema Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass a <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">tables</code>{" "}
          array with explicit field definitions.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 5,
      "fields": [
        { "name": "id",    "type": "uuid" },
        { "name": "name",  "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "plan",  "type": "enum", "params": { "values": ["free","pro","scale"] } }
      ]
    }
  ],
  "format": "json"
}'`}
        </pre>
      </section>

      {/* Prompt Mode Example */}
      <section>
        <h3 id="prompt-example" className="text-base sm:text-lg font-semibold">Prompt Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass a <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">prompt</code>{" "}
          string describing the data you need.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0" \\
  -H "Content-Type: application/json" \\
  -d '{
  "prompt": "An e-commerce database with 10 customers, 20 orders, and 40 order items with realistic product names and prices",
  "format": "json"
}'`}
        </pre>
      </section>

      {/* Template Mode Example */}
      <section>
        <h3 id="template-example" className="text-base sm:text-lg font-semibold">Template Mode</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass a <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">template</code>{" "}
          name and optional <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">scale</code>{" "}
          multiplier.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0" \\
  -H "Content-Type: application/json" \\
  -d '{
  "template": "ecommerce",
  "scale": 2,
  "format": "json"
}'`}
        </pre>
      </section>

      <Separator />

      {/* Example Response */}
      <section>
        <h2 id="example-response" className="text-xl sm:text-2xl font-bold">Example Response</h2>
        <p className="mt-2 text-muted-foreground">
          Every successful response wraps the generated data in a consistent envelope.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "users": [
      {
        "id": "e7a1c3b2-4f8d-4e6a-9b2c-1d3e5f7a8b9c",
        "name": "Amara Okafor",
        "email": "amara.okafor@example.com",
        "plan": "pro"
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Liam Chen",
        "email": "liam.chen@example.com",
        "plan": "free"
      }
    ]
  },
  "meta": {
    "tables": 1,
    "total_records": 5,
    "format": "json",
    "seed": 8827361,
    "generation_time_ms": 142
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* Next Steps */}
      <section>
        <h2 id="next-steps" className="text-xl sm:text-2xl font-bold">Next Steps</h2>
        <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
          <Link
            href="/docs/api-reference"
            className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted active:bg-muted/80 min-h-[44px]"
          >
            <p className="font-semibold group-hover:text-primary">API Reference</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Full endpoint documentation with request and response schemas.
            </p>
          </Link>
          <Link
            href="/docs/field-types"
            className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted active:bg-muted/80 min-h-[44px]"
          >
            <p className="font-semibold group-hover:text-primary">Field Types</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse all 156 supported field types with examples and parameters.
            </p>
          </Link>
          <Link
            href="/docs/templates"
            className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted active:bg-muted/80 min-h-[44px]"
          >
            <p className="font-semibold group-hover:text-primary">Templates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pre-built schemas for ecommerce, blog, SaaS, and social apps.
            </p>
          </Link>
          <Link
            href="/docs/authentication"
            className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted active:bg-muted/80 min-h-[44px]"
          >
            <p className="font-semibold group-hover:text-primary">Authentication</p>
            <p className="mt-1 text-sm text-muted-foreground">
              API key formats, header options, and key rotation.
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
