import { Check, X, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Support = "yes" | "no" | "partial"

interface Competitor {
  name: string
  type: string
  rows: Record<string, Support>
}

const features = [
  { key: "multiTable", label: "Multi-table in one request" },
  { key: "fkSort", label: "Automatic FK ordering" },
  { key: "hostedApi", label: "Hosted REST API" },
  { key: "mcpServer", label: "MCP server for AI agents" },
  { key: "promptMode", label: "Plain English prompts" },
  { key: "fast", label: "Sub-50ms generation" },
  { key: "schemaFirst", label: "Schema-first (no training data)" },
  { key: "sqlOutput", label: "SQL output (multi-dialect)" },
  { key: "freeTier", label: "Free tier for developers" },
]

const competitors: Competitor[] = [
  {
    name: "MockHero",
    type: "API",
    rows: {
      multiTable: "yes",
      fkSort: "yes",
      hostedApi: "yes",
      mcpServer: "yes",
      promptMode: "yes",
      fast: "yes",
      schemaFirst: "yes",
      sqlOutput: "yes",
      freeTier: "yes",
    },
  },
  {
    name: "Faker.js",
    type: "Library",
    rows: {
      multiTable: "no",
      fkSort: "no",
      hostedApi: "no",
      mcpServer: "no",
      promptMode: "no",
      fast: "yes",
      schemaFirst: "yes",
      sqlOutput: "no",
      freeTier: "yes",
    },
  },
  {
    name: "Mockaroo",
    type: "Web Tool",
    rows: {
      multiTable: "no",
      fkSort: "no",
      hostedApi: "yes",
      mcpServer: "no",
      promptMode: "no",
      fast: "partial",
      schemaFirst: "yes",
      sqlOutput: "yes",
      freeTier: "partial",
    },
  },
  {
    name: "Tonic.ai",
    type: "Enterprise",
    rows: {
      multiTable: "partial",
      fkSort: "partial",
      hostedApi: "yes",
      mcpServer: "no",
      promptMode: "partial",
      fast: "no",
      schemaFirst: "no",
      sqlOutput: "yes",
      freeTier: "partial",
    },
  },
  {
    name: "Gretel.ai",
    type: "ML Platform",
    rows: {
      multiTable: "no",
      fkSort: "no",
      hostedApi: "yes",
      mcpServer: "no",
      promptMode: "partial",
      fast: "no",
      schemaFirst: "no",
      sqlOutput: "no",
      freeTier: "partial",
    },
  },
]

function CellIcon({ value }: { value: Support }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
        <Check className="h-3 w-3 text-primary" />
      </span>
    )
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted">
        <Minus className="h-3 w-3 text-muted-foreground" />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted">
      <X className="h-3 w-3 text-muted-foreground/50" />
    </span>
  )
}

export function Comparison() {
  return (
    <section className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <Badge variant="secondary" className="mb-4">
            Comparison
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why not just use Faker?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Libraries make you wire foreign keys manually. Enterprise tools need your production data. Mock APIs return canned responses. MockHero generates real relational data in one call.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CellIcon value="yes" />
            <span>Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <CellIcon value="partial" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <CellIcon value="no" />
            <span>Not supported</span>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 font-medium text-muted-foreground w-[220px]">
                  Feature
                </th>
                {competitors.map((c) => (
                  <th
                    key={c.name}
                    className={cn(
                      "text-center py-3 px-3 font-medium min-w-[100px]",
                      c.name === "MockHero" && "text-primary"
                    )}
                  >
                    <div>{c.name}</div>
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {c.type}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.key}
                  className={cn(
                    "border-b border-border/50",
                    i % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <td className="py-3 pr-4 text-muted-foreground">
                    {feature.label}
                  </td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-3">
                      <div className="flex justify-center">
                        <CellIcon value={c.rows[feature.key]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: show MockHero vs each competitor */}
        <div className="md:hidden space-y-6">
          {competitors.slice(1).map((c) => (
            <div key={c.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-primary">MockHero</span>
                  <span className="text-muted-foreground mx-2">vs</span>
                  <span className="font-semibold">{c.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {c.type}
                </Badge>
              </div>
              <div className="space-y-2">
                {features.map((feature) => {
                  const ours = competitors[0].rows[feature.key]
                  const theirs = c.rows[feature.key]
                  if (ours === theirs) return null
                  return (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="text-muted-foreground">
                        {feature.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <CellIcon value={ours} />
                        <span className="text-muted-foreground/40">vs</span>
                        <CellIcon value={theirs} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          Based on publicly available documentation as of March 2026. &quot;Partial&quot; means the feature exists with significant limitations.
        </p>
      </div>
    </section>
  )
}
