import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WorksWith } from "@/components/landing/works-with";
import { Features } from "@/components/landing/features";
import { AutoLocaleShowcase } from "@/components/landing/auto-locale-showcase";
import { RelationalDataShowcase } from "@/components/landing/relational-data-showcase";
import { FieldTypesShowcase } from "@/components/landing/field-types-showcase";
import { TemplatesShowcase } from "@/components/landing/templates-showcase";
import { Playground } from "@/components/landing/playground";
import { CodeExamples } from "@/components/landing/code-examples";
import { Comparison } from "@/components/landing/comparison";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Synthetic Test Data API for AI Agents",
  description:
    "Generate realistic relational test data from schemas, prompts, templates, or MCP tools. MockHero gives AI agents free previews, estimates, and Polar-backed checkout.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Synthetic Test Data API for AI Agents | MockHero",
    description:
      "Generate realistic relational test data from schemas, prompts, templates, or MCP tools. MockHero gives AI agents free previews, estimates, and Polar-backed checkout.",
    url: "https://mockhero.dev",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <WorksWith />
        <Features />
        <AutoLocaleShowcase />
        <RelationalDataShowcase />
        <FieldTypesShowcase />
        <TemplatesShowcase />
        <Playground />
        <CodeExamples />
        <Comparison />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
