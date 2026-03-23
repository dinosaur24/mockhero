import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { articles, type ArticleCategory } from "./articles"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tutorials, and best practices for generating realistic test data with the MockHero API.",
  openGraph: {
    title: "Blog | MockHero",
    description:
      "Guides, tutorials, and best practices for generating realistic test data with the MockHero API.",
    url: "https://mockhero.dev/blog",
  },
}

const ARTICLES_PER_PAGE = 12

const categoryColors: Record<ArticleCategory, string> = {
  Database:
    "bg-blue-100 text-blue-800 border-blue-200",
  Framework:
    "bg-purple-100 text-purple-800 border-purple-200",
  "Use Case":
    "bg-amber-100 text-amber-800 border-amber-200",
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const totalPages = Math.ceil(sorted.length / ARTICLES_PER_PAGE)
  const paginated = sorted.slice(
    (page - 1) * ARTICLES_PER_PAGE,
    page * ARTICLES_PER_PAGE
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-screen-xl px-4 py-12 md:px-6 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Guides, tutorials, and best practices for generating realistic test
            data with the MockHero API.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={categoryColors[article.category]}
                >
                  {article.category}
                </Badge>
                <time
                  dateTime={article.date}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(article.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <h2 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {article.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}`}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}`}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}`}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </main>

      <Footer />
    </div>
  )
}
