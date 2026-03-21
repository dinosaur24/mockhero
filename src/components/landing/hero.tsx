import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const stats = [
  { value: "156", label: "Field Types" },
  { value: "22", label: "Locales" },
  { value: "<50ms", label: "Generation" },
]

const schemaSnippet = `{ "tables": [{
    "name": "users",
    "count": 3,
    "fields": [
      { "name": "id", "type": "uuid" },
      { "name": "name", "type": "full_name" },
      { "name": "email", "type": "email" }
    ]
}]}`

const outputSnippet = `{
  "data": {
    "users": [{
      "id": "a7c3e1d0-9f24...",
      "name": "Maximilian Bergmann",
      "email": "max.bergmann@web.de"
    }, ...]
  },
  "meta": { "total_records": 3, "generation_time_ms": 4 }
}`

export function Hero() {
  return (
    <section className="px-4 md:px-6 pt-16 pb-20 lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <Badge variant="secondary" className="mb-6 text-sm px-3 py-1">
              Now with MCP support for AI agents
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl leading-[1.1]">
              Realistic test data{" "}
              <span className="text-primary">in one API call</span>
            </h1>

            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-lg">
              Send a schema or plain English description, get back production-quality fake data
              with proper names, valid formats, and referential integrity.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Get Free API Key
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="#playground">Try the Playground</Link>
              </Button>
            </div>

            <div className="mt-14 flex gap-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-3">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Schema</span>
                <Badge variant="outline" className="text-[10px]">POST /v1/generate</Badge>
              </div>
              <pre className="p-4 text-[13px] font-mono leading-relaxed overflow-hidden text-muted-foreground">
                <code>{schemaSnippet}</code>
              </pre>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Response</span>
                <Badge variant="secondary" className="text-[10px]">4ms</Badge>
              </div>
              <pre className="p-4 text-[13px] font-mono leading-relaxed overflow-hidden text-foreground">
                <code>{outputSnippet}</code>
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
