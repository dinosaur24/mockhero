import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { DataTypesClient } from "./data-types-client"

export const metadata: Metadata = {
  title: "Data Type Explorer — All 156 MockHero Field Types",
  description: "Browse all 156 field types available in MockHero. Search by category, see live examples, and copy field definitions for your test data schemas.",
  openGraph: {
    title: "Data Type Explorer | MockHero",
    description: "Browse all 156 field types with live examples. Identity, location, business, temporal, technical, content, and more.",
    url: "https://mockhero.dev/tools/data-types",
  },
}

export default function DataTypesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="px-4 md:px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl">
            <div className="max-w-2xl mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Data Type Explorer
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                Browse all 156 field types available in MockHero. Click any type to copy its schema definition.
              </p>
            </div>
            <DataTypesClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
