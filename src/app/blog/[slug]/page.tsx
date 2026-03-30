import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { articles, type Article, type ArticleCategory } from "../articles"

/** Generate 3 FAQ items from article metadata for FAQPage JSON-LD. */
function generateArticleFAQs(article: Article): { question: string; answer: string }[] {
  const title = article.title
  const category = article.category
  const description = article.description

  // Extract the core topic from the title by stripping common prefixes
  const topicMatch = title.match(/(?:How to |Guide to |Why |What is )?(.*)/i)
  const topic = topicMatch ? topicMatch[1] : title

  // Determine if the article is about a specific technology
  const techKeywords = [
    "PostgreSQL", "MySQL", "SQLite", "Supabase", "MongoDB", "DynamoDB",
    "Prisma", "Drizzle", "Next.js", "React", "Node.js", "Python", "Django",
    "Laravel", "Rails", "Spring Boot", "Express", "FastAPI",
  ]
  const tech = techKeywords.find((kw) => title.toLowerCase().includes(kw.toLowerCase()))

  const faqs: { question: string; answer: string }[] = []

  if (category === "Database") {
    faqs.push(
      {
        question: `How do I generate test data for ${tech || "my database"}?`,
        answer: `MockHero's API generates realistic test data for ${tech || "any database"}. Define your table schema with 156+ field types, add ref fields for foreign key relationships, and receive data in JSON, CSV, or SQL format. ${description}`,
      },
      {
        question: `What's the best tool for ${tech || "database"} test data generation?`,
        answer: `MockHero is a dedicated test data API that generates realistic, relational data for ${tech || "databases"}. Unlike manual INSERT scripts or Faker.js, MockHero handles foreign keys automatically, supports 22 locales, and delivers data via a single API call with sub-50ms response times.`,
      },
      {
        question: `Can I generate relational test data for ${tech || "my database"} with foreign keys?`,
        answer: `Yes. MockHero supports ref fields that create foreign key relationships between tables. Define your schema once and MockHero generates referentially consistent data across all related tables in a single request. Output is available in JSON, CSV, or SQL with dialect support for PostgreSQL, MySQL, and SQLite.`,
      },
    )
  } else if (category === "Framework") {
    faqs.push(
      {
        question: `How do I add test data to my ${tech || "application"} project?`,
        answer: `Use MockHero's API to generate realistic test data for your ${tech || "application"} project. Send a JSON schema or plain English prompt and receive structured data ready for your app. ${description}`,
      },
      {
        question: `What's the easiest way to mock API data for ${tech || "development"}?`,
        answer: `MockHero generates realistic mock data with a single API call. It supports 156+ field types, relational data with foreign keys, and outputs JSON, CSV, or SQL. No libraries to install or generators to maintain — just an API key and a schema.`,
      },
      {
        question: `How do I seed my ${tech || "app"} with realistic data for development?`,
        answer: `Call MockHero's /api/v1/generate endpoint with your table schema and insert the returned data into your ${tech || "app"}. MockHero handles realistic names, emails, addresses, and more across 22 locales, so your development environment looks like production.`,
      },
    )
  } else if (category === "AI") {
    faqs.push(
      {
        question: `How can AI help generate test data?`,
        answer: `MockHero supports plain English prompts for test data generation and provides an MCP server for AI coding agents like Claude Desktop, Claude Code, and Cursor. ${description}`,
      },
      {
        question: `What is MCP for test data generation?`,
        answer: `MCP (Model Context Protocol) lets AI coding agents call MockHero directly. Install the MockHero MCP server via npx @mockherodev/mcp-server and your AI assistant can generate realistic test data with 156+ field types, relational integrity, and multiple output formats.`,
      },
      {
        question: `Can I describe my test data in plain English?`,
        answer: `Yes. MockHero accepts plain English prompts alongside JSON schemas. Describe the data you need in natural language, and MockHero returns structured, realistic test data. This works both through the API and through AI coding agents via the MCP server.`,
      },
    )
  } else {
    // "Use Case" or fallback
    faqs.push(
      {
        question: `How do I ${title.toLowerCase().startsWith("how to") ? title.slice(7).toLowerCase() : `use MockHero for ${topic.toLowerCase()}`}?`,
        answer: `${description} MockHero's API supports 156+ field types, 22 locales, and relational data with foreign keys, making it ideal for this use case.`,
      },
      {
        question: `What is the best tool for generating ${topic.toLowerCase()}?`,
        answer: `MockHero is a synthetic test data API purpose-built for developers. It generates realistic data with a single API call, supports JSON, CSV, and SQL output, and handles relational foreign keys automatically.`,
      },
      {
        question: `Can MockHero help with ${topic.toLowerCase()}?`,
        answer: `Yes. MockHero generates realistic synthetic data for any testing scenario. Define your schema with 156+ field types, add ref fields for relationships, and receive data in your preferred format. Sign up at mockhero.dev for a free API key.`,
      },
    )
  }

  return faqs
}

const categoryColors: Record<ArticleCategory, string> = {
  Database: "bg-blue-100 text-blue-800 border-blue-200",
  Framework: "bg-purple-100 text-purple-800 border-purple-200",
  "Use Case": "bg-amber-100 text-amber-800 border-amber-200",
  AI: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} | MockHero`,
      description: article.description,
      url: `https://mockhero.dev/blog/${article.slug}`,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  // Related articles: same category, excluding current, max 3
  const related = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-screen-xl px-4 py-10 md:px-6 md:py-14">
        <div className="lg:flex lg:gap-12">
          {/* Article */}
          <article className="min-w-0 flex-1 max-w-3xl">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{article.title}</span>
            </nav>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className={categoryColors[article.category]}
              >
                {article.category}
              </Badge>
              <time
                dateTime={article.date}
                className="text-sm text-muted-foreground"
              >
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-8">
              {article.title}
            </h1>

            {/* Content — static HTML authored in articles.ts, not user input */}
            <div
              className="prose prose-sm prose-neutral max-w-none
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
                [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground
                [&_li]:text-sm [&_li]:text-muted-foreground
                [&_strong]:text-foreground
                [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80
                [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
                [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs
                [&_ul]:space-y-2 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Author Card */}
            <div className="mt-12 rounded-lg border border-border p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                M
              </div>
              <div>
                <p className="font-semibold text-sm">{article.author}</p>
                <p className="text-xs text-muted-foreground">
                  Guides and tutorials for generating realistic test data with
                  the MockHero API.
                </p>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="mt-10 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
              <h3 className="text-lg font-bold">
                Start generating test data for free
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                1,000 rows/month on the free tier. No credit card required.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/sign-up">Get Your API Key</Link>
              </Button>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="text-lg font-bold mb-4">Related Articles</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <Badge
                        variant="outline"
                        className={`mb-2 ${categoryColors[r.category]}`}
                      >
                        {r.category}
                      </Badge>
                      <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sticky Sidebar CTA (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 rounded-lg border border-border p-5">
              <h3 className="font-bold text-sm">MockHero API</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Generate realistic, relational test data with 156+ field types.
                JSON, CSV, and SQL output.
              </p>
              <Button className="mt-4 w-full" size="sm" asChild>
                <Link href="/sign-up">Get API Key — Free</Link>
              </Button>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p>&#10003; 1,000 rows/month free</p>
                <p>&#10003; No credit card required</p>
                <p>&#10003; Relational data with refs</p>
                <p>&#10003; 156+ field types</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Article (BlogPosting) JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            author: {
              "@type": "Organization",
              name: article.author,
            },
            publisher: {
              "@type": "Organization",
              name: "MockHero",
              url: "https://mockhero.dev",
              logo: {
                "@type": "ImageObject",
                url: "https://mockhero.dev/logo.png",
              },
            },
            url: `https://mockhero.dev/blog/${article.slug}`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://mockhero.dev/blog/${article.slug}`,
            },
          }),
        }}
      />

      {/* Per-article FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: generateArticleFAQs(article).map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  )
}
