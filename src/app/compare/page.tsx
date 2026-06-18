import Link from "next/link";
import { getAllComparisons } from "@/lib/competitors/comparisons";

export const metadata = {
  title: "Compare MockHero",
  description:
    "Agent-first comparisons between MockHero and other mock data options.",
};

export default function CompareIndexPage() {
  const comparisons = getAllComparisons();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          MockHero
        </Link>

        <section className="mt-10 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare MockHero for agent-generated mock data
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            These comparisons are written for tool-using agents and developers evaluating where MockHero
            fits. The short version: use MockHero when mock data should be an API or MCP call, not another
            script an agent has to write and maintain.
          </p>
        </section>

        <section className="mt-10 divide-y divide-border border-y border-border">
          {comparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/compare/${comparison.slug}`}
              className="block py-6 transition-colors hover:bg-muted/40 sm:px-4"
            >
              <h2 className="text-xl font-semibold">{comparison.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {comparison.summary}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
