import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { SchemaDetectorClient } from "./schema-detector-client"

export const metadata: Metadata = {
  title: "Schema Detector | Paste JSON, Get Test Data Schema",
  description:
    "Paste any JSON payload and instantly get a MockHero schema with auto-detected field types. Convert real API responses into synthetic test data schemas in seconds.",
  openGraph: {
    title: "Schema Detector | MockHero",
    description:
      "Paste JSON, get a ready-to-use test data schema with auto-detected field types.",
    url: "https://mockhero.dev/tools/schema-detector",
  },
}

export default function SchemaDetectorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="px-4 md:px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl">
            <div className="max-w-2xl mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Schema Detector
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                Paste any JSON payload and instantly get a MockHero schema with
                auto-detected field types. Ready to generate realistic test data.
              </p>
            </div>
            <SchemaDetectorClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
