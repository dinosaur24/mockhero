import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import {
  FIELD_TYPE_SEO,
  CATEGORY_SEO,
  getAllFieldTypeSlugs,
} from "@/lib/engine/field-type-seo"

/* ------------------------------------------------------------------ */
/*  Static params for ISR / build-time generation                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return getAllFieldTypeSlugs().map((type) => ({ type }))
}

/* ------------------------------------------------------------------ */
/*  Dynamic metadata                                                   */
/* ------------------------------------------------------------------ */

type PageProps = { params: Promise<{ type: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params
  const field = FIELD_TYPE_SEO[type]
  if (!field) return {}

  const title = `Generate ${field.name} Test Data | MockHero`
  const description = field.seoDescription.slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mockhero.dev/tools/data-types/${type}`,
      type: "article",
    },
  }
}

/* ------------------------------------------------------------------ */
/*  JSON-LD helpers (all data is static / trusted from our own SEO     */
/*  catalog — no user input involved)                                  */
/* ------------------------------------------------------------------ */

function buildFaqJsonLd(type: string, field: (typeof FIELD_TYPE_SEO)[string]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I generate fake ${field.name.toLowerCase()} data?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use MockHero's API to generate realistic ${field.name.toLowerCase()} test data. Send a POST request to /api/v1/generate with your schema including the "${type}" field type, and receive synthetic data instantly. MockHero supports 156+ field types across 15 categories.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the ${type} field type in MockHero?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: field.seoDescription,
        },
      },
      {
        "@type": "Question",
        name: `Can I use ${field.name.toLowerCase()} with other field types?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. MockHero generates multiple field types in a single request. Combine "${type}" with ${field.related.slice(0, 3).map((r) => `"${r}"`).join(", ")} and 150+ other types. Use ref fields to create foreign key relationships between tables for fully relational test data.`,
        },
      },
    ],
  }
}

function buildSoftwareJsonLd(
  type: string,
  field: (typeof FIELD_TYPE_SEO)[string]
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `MockHero ${field.name} Generator`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `https://mockhero.dev/tools/data-types/${type}`,
    description: field.seoDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier includes 1,000 records per day",
    },
  }
}

function buildApiExample(
  type: string,
  field: (typeof FIELD_TYPE_SEO)[string]
) {
  const paramEntries = Object.entries(field.params).slice(0, 2)
  const exampleParams: Record<string, unknown> = {}
  for (const [k] of paramEntries) {
    if (k === "locale") exampleParams[k] = "de"
    else if (k === "min") exampleParams[k] = 1
    else if (k === "max") exampleParams[k] = 100
    else if (k === "values")
      exampleParams[k] = ["active", "inactive", "pending"]
    else if (k === "table") exampleParams[k] = "users"
    else if (k === "field") exampleParams[k] = "id"
    else if (k === "probability") exampleParams[k] = 0.7
    else if (k === "dimensions") exampleParams[k] = 1536
    else if (k === "domain") exampleParams[k] = "company.com"
    else if (k === "network") exampleParams[k] = "visa"
    else if (k === "carrier") exampleParams[k] = "ups"
    else if (k === "version") exampleParams[k] = "v4"
    else if (k === "prefix") exampleParams[k] = "PRD"
    else if (k === "category") exampleParams[k] = "electronics"
    else if (k === "length") exampleParams[k] = "medium"
    else if (k === "algorithm") exampleParams[k] = "bcrypt"
    else if (k === "value") exampleParams[k] = "active"
    else if (k === "code") exampleParams[k] = true
  }

  return JSON.stringify(
    {
      tables: [
        {
          name: "example",
          count: 5,
          fields: [
            {
              name: type,
              type,
              ...(Object.keys(exampleParams).length > 0
                ? { params: exampleParams }
                : {}),
            },
          ],
        },
      ],
    },
    null,
    2
  )
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function FieldTypePage({ params }: PageProps) {
  const { type } = await params
  const field = FIELD_TYPE_SEO[type]
  if (!field) notFound()

  const category = CATEGORY_SEO[field.category]
  const relatedTypes = field.related
    .filter((r) => FIELD_TYPE_SEO[r])
    .slice(0, 6)

  const apiExample = buildApiExample(type, field)

  // JSON-LD data — all sourced from our own trusted catalog, no user input
  const faqJsonLdString = JSON.stringify(buildFaqJsonLd(type, field))
  const softwareJsonLdString = JSON.stringify(
    buildSoftwareJsonLd(type, field)
  )

  return (
    <>
      <Navbar />

      {/* Structured data for SEO (trusted static content from our catalog) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLdString }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: softwareJsonLdString }}
      />

      <main className="min-h-screen">
        <section className="px-4 md:px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link
                href="/tools/data-types"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                All Field Types
              </Link>
            </div>

            {/* Header */}
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-mono">
                  {type}
                </h1>
                {category && (
                  <Badge
                    className={`${category.bgColor} ${category.color} border-0 text-xs`}
                  >
                    {category.label}
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {field.seoDescription}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left column: main content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Example outputs */}
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Example Outputs
                    </h2>
                    <div className="space-y-2">
                      {field.examples.map((ex, i) => (
                        <code
                          key={i}
                          className="block bg-muted rounded-lg px-4 py-2.5 text-sm font-mono break-all"
                        >
                          {ex}
                        </code>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parameters */}
                {Object.keys(field.params).length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-semibold mb-4">
                        Parameters
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left font-medium py-2 pr-4">
                                Parameter
                              </th>
                              <th className="text-left font-medium py-2">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(field.params).map(
                              ([name, desc]) => (
                                <tr
                                  key={name}
                                  className="border-b last:border-0"
                                >
                                  <td className="py-2.5 pr-4 font-mono text-primary">
                                    {name}
                                  </td>
                                  <td className="py-2.5 text-muted-foreground">
                                    {desc}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* API example */}
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">API Usage</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send a POST request to generate{" "}
                      {field.name.toLowerCase()} data:
                    </p>
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
                        <code>
                          {`curl -X POST https://mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${apiExample}'`}
                        </code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Use cases */}
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Common Use Cases
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {field.useCases.map((uc) => (
                        <li
                          key={uc}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Quick info */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Quick Info</h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Field Type</dt>
                        <dd className="font-mono font-medium">{type}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Category</dt>
                        <dd>
                          {category && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.bgColor} ${category.color}`}
                            >
                              {category.label}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Parameters</dt>
                        <dd>
                          {Object.keys(field.params).length > 0
                            ? `${Object.keys(field.params).length} parameter${Object.keys(field.params).length > 1 ? "s" : ""}`
                            : "None required"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Output Format
                        </dt>
                        <dd>JSON, CSV, SQL</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                {/* Try it CTA */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Try it now</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate {field.name.toLowerCase()} data instantly in
                      the playground.
                    </p>
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href="/sign-up">
                          Get Free API Key
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/docs/field-types">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Docs
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Related types */}
                {relatedTypes.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-3">Related Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {relatedTypes.map((rt) => {
                          const rtData = FIELD_TYPE_SEO[rt]
                          const rtCat = rtData
                            ? CATEGORY_SEO[rtData.category]
                            : null
                          return (
                            <Link
                              key={rt}
                              href={`/tools/data-types/${rt}`}
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-mono transition-opacity hover:opacity-80 ${
                                rtCat
                                  ? `${rtCat.bgColor} ${rtCat.color}`
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rt}
                            </Link>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <Card className="mt-16">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
                <div>
                  <h2 className="text-xl font-semibold">
                    Generate {field.name} + 155 more types via API
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    One API call. Multiple tables. Relational integrity. Free
                    tier included.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
