import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getTopListBySlug, getTopListSlugs } from "@/lib/seo/top-lists";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getTopListSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getTopListBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `/best/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} | MockHero`,
      description: page.metaDescription,
      url: `https://mockhero.dev/best/${page.slug}`,
      type: "article",
      publishedTime: page.lastReviewed,
      modifiedTime: page.lastReviewed,
      authors: ["Dino Sakoman"],
    },
  };
}

export default async function TopListPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getTopListBySlug(slug);
  if (!page) notFound();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: page.title,
    description: page.metaDescription,
    dateModified: page.lastReviewed,
    itemListElement: page.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.notes,
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.metaDescription,
    datePublished: page.lastReviewed,
    dateModified: page.lastReviewed,
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
      logo: {
        "@type": "ImageObject",
        url: "https://mockhero.dev/logo.png",
      },
    },
    mainEntityOfPage: `https://mockhero.dev/best/${page.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/" className="font-semibold hover:text-foreground">MockHero</Link>
          <span>/</span>
          <Link href="/best" className="hover:text-foreground">Best</Link>
        </nav>

        <section className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Last reviewed {new Date(page.lastReviewed).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {page.intro}
          </p>
        </section>

        <section className="mt-10 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3 pr-6 font-medium">Rank</th>
                <th className="py-3 pr-6 font-medium">Tool</th>
                <th className="py-3 pr-6 font-medium">Best for</th>
                <th className="py-3 pr-6 font-medium">Agent fit</th>
                <th className="py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {page.items.map((item, index) => (
                <tr key={item.name}>
                  <td className="py-4 pr-6 font-medium">{index + 1}</td>
                  <td className="py-4 pr-6">
                    <a href={item.url} className="font-medium underline underline-offset-4">
                      {item.name}
                    </a>
                  </td>
                  <td className="py-4 pr-6">{item.bestFor}</td>
                  <td className="py-4 pr-6">{item.agentFit}</td>
                  <td className="py-4">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          {page.faqs.map((faq) => (
            <div key={faq.question} className="border-l border-border pl-4">
              <h2 className="text-base font-semibold">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </section>
      </main>
      <Footer />

      {[itemListSchema, articleSchema, faqSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </div>
  );
}
