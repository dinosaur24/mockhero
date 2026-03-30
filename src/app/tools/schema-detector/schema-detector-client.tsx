"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Copy, Check, Play, ArrowRight, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/* ------------------------------------------------------------------ */
/*  Sample input                                                       */
/* ------------------------------------------------------------------ */

const SAMPLE_JSON = `{
  "id": "a7c3e1d0-9f24-4b18-ae52-d3f7b8c01e95",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@company.com",
  "company": "Acme Inc",
  "job_title": "Product Manager",
  "city": "San Francisco",
  "country": "US",
  "phone": "+1-555-0123",
  "created_at": "2024-03-15T10:30:00Z",
  "is_active": true,
  "score": 4.8
}`

/* ------------------------------------------------------------------ */
/*  Detection logic                                                    */
/* ------------------------------------------------------------------ */

function detectFieldType(
  key: string,
  value: unknown
): { type: string; params?: Record<string, unknown> } {
  const k = key.toLowerCase()

  // Check by key name first
  if (k === "id" && typeof value === "string" && /^[0-9a-f]{8}-/.test(value))
    return { type: "uuid" }
  if (k === "id" && typeof value === "number") return { type: "id" }
  if (k.includes("email")) return { type: "email" }
  if (k.includes("first_name") || k === "firstname")
    return { type: "first_name" }
  if (k.includes("last_name") || k === "lastname") return { type: "last_name" }
  if (k === "name" || k.includes("full_name") || k === "fullname")
    return { type: "full_name" }
  if (k.includes("phone") || k.includes("mobile")) return { type: "phone" }
  if (
    k.includes("avatar") ||
    k.includes("profile_image") ||
    k.includes("profile_pic")
  )
    return { type: "avatar_url" }
  if (k.includes("username") || k === "handle") return { type: "username" }
  if (k.includes("gender")) return { type: "gender" }
  if (k.includes("date_of_birth") || k === "dob" || k === "birthday")
    return { type: "date_of_birth" }
  if (k.includes("company") || k.includes("organization"))
    return { type: "company_name" }
  if (
    k.includes("job_title") ||
    (k === "title" &&
      typeof value === "string" &&
      value.includes("Engineer"))
  )
    return { type: "job_title" }
  if (k.includes("department")) return { type: "department" }
  if (k.includes("city")) return { type: "city" }
  if (k.includes("country")) return { type: "country" }
  if (k.includes("state") || k.includes("province"))
    return { type: "state_province" }
  if (k.includes("zip") || k.includes("postal")) return { type: "postal_code" }
  if (k.includes("address") || k.includes("street")) return { type: "address" }
  if (k.includes("latitude") || k === "lat") return { type: "latitude" }
  if (k.includes("longitude") || k === "lng" || k === "lon")
    return { type: "longitude" }
  if (k.includes("timezone") || k === "tz") return { type: "timezone" }
  if (
    k.includes("price") ||
    k === "cost" ||
    k === "amount" ||
    k === "total"
  )
    return { type: "price" }
  if (k.includes("rating") || k === "score") return { type: "rating" }
  if (k === "sku") return { type: "sku" }
  if (k.includes("currency")) return { type: "currency" }
  if (k.includes("password")) return { type: "password_hash" }
  if (k.includes("ip_address") || k === "ip") return { type: "ip_address" }
  if (k.includes("user_agent")) return { type: "user_agent" }
  if (
    k === "url" ||
    k.includes("website") ||
    k.includes("link") ||
    k.includes("href")
  )
    return { type: "url" }
  if (k === "domain") return { type: "domain" }
  if (k.includes("slug")) return { type: "slug" }
  if (k.includes("tag") || k === "category") return { type: "tag" }
  if (k === "color" || k.includes("hex")) return { type: "color_hex" }
  if (
    k.includes("image") ||
    k.includes("thumbnail") ||
    k.includes("photo")
  )
    return { type: "image_url" }
  if (k.includes("mac_address")) return { type: "mac_address" }

  // Check by value pattern
  if (typeof value === "string") {
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
      )
    )
      return { type: "uuid" }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(value)) return { type: "email" }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))
      return { type: "datetime" }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: "date" }
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return { type: "time" }
    if (/^https?:\/\//.test(value)) return { type: "url" }
    if (value.length > 200) return { type: "paragraph" }
    if (value.length > 50) return { type: "sentence" }
    return { type: "sentence" }
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) return { type: "integer" }
    return { type: "decimal" }
  }

  if (typeof value === "boolean") return { type: "boolean" }

  return { type: "sentence" }
}

function buildSchema(
  obj: Record<string, unknown>
): Record<string, { type: string; params?: Record<string, unknown> }> {
  const schema: Record<
    string,
    { type: string; params?: Record<string, unknown> }
  > = {}
  for (const [key, value] of Object.entries(obj)) {
    schema[key] = detectFieldType(key, value)
  }
  return schema
}

function generateSchemaFromInput(input: string) {
  const parsed = JSON.parse(input)
  const target = Array.isArray(parsed) ? parsed[0] : parsed
  if (!target || typeof target !== "object") {
    throw new Error("Input must be a JSON object or an array of objects.")
  }
  return buildSchema(target as Record<string, unknown>)
}

/* ------------------------------------------------------------------ */
/*  Pre-compute default output so the page is never empty             */
/* ------------------------------------------------------------------ */

const DEFAULT_SCHEMA = generateSchemaFromInput(SAMPLE_JSON)

/* ------------------------------------------------------------------ */
/*  Supported types for the explainer section                          */
/* ------------------------------------------------------------------ */

const TYPE_CATEGORIES = [
  {
    label: "Identity",
    types: [
      "uuid",
      "id",
      "email",
      "username",
      "password_hash",
      "avatar_url",
    ],
  },
  {
    label: "Personal",
    types: [
      "first_name",
      "last_name",
      "full_name",
      "gender",
      "date_of_birth",
      "phone",
    ],
  },
  {
    label: "Company",
    types: ["company_name", "job_title", "department"],
  },
  {
    label: "Location",
    types: [
      "address",
      "city",
      "state_province",
      "country",
      "postal_code",
      "latitude",
      "longitude",
      "timezone",
    ],
  },
  {
    label: "Web",
    types: [
      "url",
      "domain",
      "slug",
      "ip_address",
      "mac_address",
      "user_agent",
      "image_url",
      "color_hex",
    ],
  },
  {
    label: "Commerce",
    types: ["price", "currency", "sku", "rating"],
  },
  {
    label: "Date & Time",
    types: ["datetime", "date", "time"],
  },
  {
    label: "Primitives",
    types: ["boolean", "integer", "decimal", "sentence", "paragraph", "tag"],
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SchemaDetectorClient() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [schema, setSchema] = useState<Record<
    string,
    { type: string; params?: Record<string, unknown> }
  > | null>(DEFAULT_SCHEMA)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const detect = useCallback(() => {
    setError(null)
    try {
      const result = generateSchemaFromInput(input)
      setSchema(result)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Invalid JSON. Please check your input."
      )
      setSchema(null)
    }
  }, [input])

  const schemaOutput = schema
    ? JSON.stringify({ fields: schema }, null, 2)
    : ""

  const copyToClipboard = useCallback(async () => {
    if (!schemaOutput) return
    await navigator.clipboard.writeText(schemaOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [schemaOutput])

  return (
    <div className="space-y-16">
      {/* ---- Two-panel editor ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              JSON Input
            </CardTitle>
            <CardDescription>
              Paste a JSON object or array — we&apos;ll detect every field type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[360px] rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
              placeholder='Paste a JSON object here, e.g. {"id": 1, "name": "Ada"}'
            />
            {error && (
              <p className="text-destructive text-xs font-medium">{error}</p>
            )}
            <Button onClick={detect} className="w-full sm:w-auto">
              <Wand2 className="mr-2 size-4" />
              Detect Schema
            </Button>
          </CardContent>
        </Card>

        {/* Right: Schema output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">
                MockHero Schema
              </CardTitle>
              <CardDescription>
                Auto-detected field types, ready to use.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!schemaOutput}
              >
                {copied ? (
                  <Check className="mr-1.5 size-3.5" />
                ) : (
                  <Copy className="mr-1.5 size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/#playground">
                  <Play className="mr-1.5 size-3.5" />
                  Try in Playground
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schemaOutput ? (
              <pre className="w-full min-h-[360px] overflow-auto rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre">
                {schemaOutput}
              </pre>
            ) : (
              <div className="flex items-center justify-center min-h-[360px] rounded-md border border-dashed border-border text-muted-foreground text-sm">
                Paste JSON on the left and click &quot;Detect Schema&quot;
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- CTA ---- */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <div>
            <h2 className="text-lg font-semibold">Ready to generate data?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Use this schema with the MockHero API to generate thousands of
              realistic records in seconds.
            </p>
          </div>
          <Button asChild>
            <Link href="/sign-up">
              Get your API key
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ---- SEO Explainer section ---- */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">
            How Schema Detection Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            The Schema Detector inspects every key-value pair in your JSON and
            applies a two-pass detection algorithm. First, it matches property
            names against common conventions (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              email
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              first_name
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              created_at
            </code>
            ). If no key-name rule matches, it falls back to value-pattern
            analysis — checking for UUIDs, ISO dates, URLs, and more. The result
            is a ready-to-use MockHero schema you can send directly to the API.
          </p>
        </div>

        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold mb-1">
            Works with arrays too
          </h3>
          <p className="text-muted-foreground text-sm">
            If you paste a JSON array, the detector uses the first element to
            infer the schema. This means you can copy an entire API response
            list and get a schema without any manual editing.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Supported Field Types
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TYPE_CATEGORIES.map((cat) => (
              <Card key={cat.label} size="sm">
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {cat.types.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-2xl space-y-4">
          <h3 className="text-lg font-semibold">
            Why auto-detect instead of writing schemas by hand?
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li>
              <strong className="text-foreground">Speed.</strong> Paste a real
              response, get a schema in under a second. No need to look up type
              names.
            </li>
            <li>
              <strong className="text-foreground">Accuracy.</strong> The detector
              maps to the most semantically specific type, so generated data
              looks realistic.
            </li>
            <li>
              <strong className="text-foreground">Iteration.</strong> Change
              your API, paste the new response, and the schema updates
              automatically.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
