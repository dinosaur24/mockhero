import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { FieldTypesExplorerClient } from "./field-types-client"

export const metadata: Metadata = {
  title: "All 156 Field Types — MockHero Data Type Explorer",
  description: "Browse all 156 field types available in MockHero. Preview examples for every type: names, emails, addresses, UUIDs, prices, dates, and more across 22 locales.",
  openGraph: {
    title: "All 156 Field Types | MockHero",
    description: "Browse and preview every field type available in MockHero's test data API.",
    url: "https://mockhero.dev/tools/field-types",
  },
}

export default function FieldTypesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="px-4 md:px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl">
            <div className="max-w-2xl mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Field Type Explorer
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                Browse all 156 field types. Click any type to see its description, parameters, and example output.
              </p>
            </div>
            <FieldTypesExplorerClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
