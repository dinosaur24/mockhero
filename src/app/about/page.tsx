import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "About MockHero",
  description:
    "MockHero is an agent-first synthetic test data API founded by Dino Sakoman for developers and AI coding agents.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About MockHero",
    description:
      "MockHero is an agent-first synthetic test data API for realistic relational seed data, fixtures, demos, and AI coding agents.",
    url: "https://mockhero.dev/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          About MockHero
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Agent-first synthetic test data
        </h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
          <p>
            MockHero is a synthetic test data API built for developers and AI
            coding agents that need realistic relational data without writing
            seed scripts by hand.
          </p>
          <p>
            The product is founded by Dino Sakoman. MockHero focuses on
            schema-first generation, foreign key integrity, locale-aware data,
            JSON/CSV/SQL output, OpenAPI metadata, and MCP tools that agents
            can discover and call directly.
          </p>
          <p>
            MockHero does not use production customer records to generate data.
            Generated records are synthetic and intended for development,
            testing, demos, QA, and CI workflows.
          </p>
        </div>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Agent endpoints
          </h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="font-medium">Remote MCP endpoint</dt>
              <dd className="mt-1 text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://mockhero.dev/mcp/agent
                </code>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Machine-readable quickstart</dt>
              <dd className="mt-1 text-muted-foreground">
                <Link href="/agent-quickstart.json" className="underline underline-offset-4">
                  https://mockhero.dev/agent-quickstart.json
                </Link>
              </dd>
            </div>
            <div>
              <dt className="font-medium">LLM reference</dt>
              <dd className="mt-1 text-muted-foreground">
                <Link href="/llms.txt" className="underline underline-offset-4">
                  https://mockhero.dev/llms.txt
                </Link>
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <Footer />
    </div>
  );
}
