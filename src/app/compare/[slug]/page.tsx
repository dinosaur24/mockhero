import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getComparisonBySlug,
  getComparisonSlugs,
  type CompetitorComparison,
} from "@/lib/competitors/comparisons";

const LAST_REVIEWED = "2026-06-24";

export function generateStaticParams() {
  return getComparisonSlugs().map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return {};

  return {
    title: comparison.title,
    description: comparison.metaDescription,
    alternates: {
      canonical: `/compare/${comparison.slug}`,
    },
    openGraph: {
      title: `${comparison.title} | MockHero`,
      description: comparison.metaDescription,
      url: `https://mockhero.dev/compare/${comparison.slug}`,
      type: "article",
      publishedTime: LAST_REVIEWED,
      modifiedTime: LAST_REVIEWED,
      authors: ["Dino Sakoman"],
    },
  };
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="border-l border-border pl-4">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ComparisonJsonLd({ comparison }: { comparison: CompetitorComparison }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.metaDescription,
    datePublished: LAST_REVIEWED,
    dateModified: LAST_REVIEWED,
    author: {
      "@type": "Person",
      name: "Dino Sakoman",
      url: "https://mockhero.dev/about",
      jobTitle: "Founder of MockHero",
    },
    publisher: {
      "@type": "Organization",
      name: "MockHero",
      url: "https://mockhero.dev",
    },
    mainEntityOfPage: `https://mockhero.dev/compare/${comparison.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ComparisonJsonLd comparison={comparison} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/" className="font-semibold hover:text-foreground">MockHero</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-foreground">Compare</Link>
        </nav>

        <section className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Agent-first comparison · Last reviewed {new Date(LAST_REVIEWED).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {comparison.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {comparison.summary}
          </p>
        </section>

        <section className="mt-10 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3 pr-6 font-medium">Decision point</th>
                <th className="py-3 pr-6 font-medium">MockHero</th>
                <th className="py-3 font-medium">{comparison.competitor}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-4 pr-6 font-medium">Agent fit</td>
                <td className="py-4 pr-6">Native API, MCP, OpenAPI, estimate, checkout, and claim flow</td>
                <td className="py-4">{comparison.agentFit.competitor.replace(/_/g, " ")}</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-medium">Best use</td>
                <td className="py-4 pr-6">Agent-generated mock data, relational fixtures, seed data, demos</td>
                <td className="py-4">{comparison.bestFor[0]}</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-medium">Agent advantage</td>
                <td className="py-4 pr-6">{comparison.mockheroAdvantageForAgents}</td>
                <td className="py-4">Useful when its specific workflow is the right fit</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <ListSection title="Choose MockHero when" items={comparison.chooseMockHeroWhen} />
          <ListSection title={`Choose ${comparison.competitor} when`} items={comparison.chooseCompetitorWhen} />
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Sources</h2>
          {comparison.sourceUrls.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {comparison.sourceUrls.map((url) => (
                <li key={url}>
                  <a href={url} className="underline underline-offset-4 hover:text-foreground">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Custom seed scripts are an in-house workflow rather than a vendor with official public pricing.
            </p>
          )}
        </section>
      </div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "MockHero",
                item: "https://mockhero.dev",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Compare",
                item: "https://mockhero.dev/compare",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: comparison.title,
                item: `https://mockhero.dev/compare/${comparison.slug}`,
              },
            ],
          }),
        }}
      />
    </main>
  );
}
