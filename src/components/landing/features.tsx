import { Database, Globe, Link2, Layers, FileJson, Bot } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    title: "Relational Data",
    description: "Generate multiple tables with proper foreign key relationships. Orders reference real user IDs. No orphan records.",
    icon: Link2,
  },
  {
    title: "Auto-Locale Detection",
    description: "Add a country field and MockHero auto-detects locale per row. German names for DE, French for FR, Japanese for JP.",
    icon: Globe,
  },
  {
    title: "156 Field Types",
    description: "From UUIDs to Luhn-valid credit cards, bcrypt hashes to EAN-13 barcodes. The most comprehensive catalog available.",
    icon: Database,
  },
  {
    title: "Multiple Output Formats",
    description: "JSON by default, CSV and SQL INSERT statements for Pro users. PostgreSQL, MySQL, and SQLite dialects supported.",
    icon: FileJson,
  },
  {
    title: "Plain English Prompts",
    description: "Describe what you need in plain English. MockHero converts it to a structured schema and generates the data.",
    icon: Layers,
  },
  {
    title: "AI Agent Ready",
    description: "MCP server from day one. Claude, Cursor, Copilot, and other AI agents can call MockHero natively to seed databases.",
    icon: Bot,
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 md:px-6 py-16 lg:py-24 bg-muted/50">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to seed any database
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            One API, six powerful capabilities. No other test data tool comes close.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="transition-colors hover:bg-muted/50">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
