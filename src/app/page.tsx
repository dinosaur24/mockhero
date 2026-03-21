import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { AutoLocaleShowcase } from "@/components/landing/auto-locale-showcase";
import { RelationalDataShowcase } from "@/components/landing/relational-data-showcase";
import { FieldTypesShowcase } from "@/components/landing/field-types-showcase";
import { TemplatesShowcase } from "@/components/landing/templates-showcase";
import { Playground } from "@/components/landing/playground";
import { CodeExamples } from "@/components/landing/code-examples";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AutoLocaleShowcase />
        <RelationalDataShowcase />
        <FieldTypesShowcase />
        <TemplatesShowcase />
        <Playground />
        <CodeExamples />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
