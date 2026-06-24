import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { topLists } from "@/lib/seo/top-lists";

export const metadata: Metadata = {
  title: "Best Developer Tools for Test Data and Agents",
  description:
    "Ranked lists and comparisons for synthetic test data APIs, Faker alternatives, and MCP servers for developers.",
  alternates: {
    canonical: "/best",
  },
};

export default function BestIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Best tools
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Developer tool rankings for agents and test data
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
          Comparison pages for high-intent searches around synthetic test data,
          Faker alternatives, and MCP servers. Each page includes source links,
          last-reviewed dates, and agent-fit notes.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {topLists.map((page) => (
            <Link
              key={page.slug}
              href={`/best/${page.slug}`}
              className="rounded-lg border border-border p-5 transition-colors hover:bg-muted/50"
            >
              <h2 className="text-base font-semibold">{page.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {page.metaDescription}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Last reviewed {new Date(page.lastReviewed).toLocaleDateString("en-US")}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
