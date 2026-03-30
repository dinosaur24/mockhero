import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CalculatorClient } from "./calculator-client"

export const metadata: Metadata = {
  title: "Test Data Calculator | How Much Test Data Do You Need?",
  description: "Calculate how much synthetic test data your project needs. Estimate records, API calls, and find the right MockHero plan for your testing workflow.",
  openGraph: {
    title: "Test Data Calculator | MockHero",
    description: "Estimate your test data needs and find the right plan. Free calculator for developers.",
    url: "https://mockhero.dev/tools/calculator",
  },
}

export default function CalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="px-4 md:px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl">
            <div className="max-w-2xl mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Test Data Calculator
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                Estimate how much test data you need and find the right plan for your workflow.
              </p>
            </div>
            <CalculatorClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
