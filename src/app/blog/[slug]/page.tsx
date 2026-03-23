import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { articles, type ArticleCategory } from "../articles"

const categoryColors: Record<ArticleCategory, string> = {
  Database: "bg-blue-100 text-blue-800 border-blue-200",
  Framework: "bg-purple-100 text-purple-800 border-purple-200",
  "Use Case": "bg-amber-100 text-amber-800 border-amber-200",
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
    </div>
  )
}
