import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const templates = [
  {
    name: "E-Commerce",
    tables: 5,
    tableNames: ["customers", "products", "orders", "order_items", "reviews"],
    records: "1.5K",
    description: "Storefront with locale-aware customers, product catalog, order flow, and reviews.",
  },
  {
    name: "Blog",
    tables: 5,
    tableNames: ["authors", "posts", "comments", "tags", "post_tags"],
    records: "1.2K",
    description: "Multi-author blog with proper many-to-many tags, comments, and locale-aware authors.",
  },
  {
    name: "SaaS",
    tables: 4,
    tableNames: ["organizations", "members", "subscriptions", "invoices"],
    records: "260",
    description: "Multi-tenant SaaS with team roles, subscription billing, and invoice history.",
  },
  {
    name: "Social Network",
    tables: 5,
    tableNames: ["users", "posts", "likes", "follows", "messages"],
    records: "6.8K",
    description: "Social graph with follower relationships, engagement data, and DM threads.",
  },
]

export function TemplatesShowcase() {
  return (
    <section className="px-4 md:px-6 py-16 lg:py-24 bg-muted/50">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <Badge variant="outline" className="mb-4">Templates</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pre-built templates. Zero config.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            One API call. Complete database seed. All relationships included.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Card key={template.name} className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-2xl font-bold">{template.tables}</span>
                    <span className="text-muted-foreground ml-1 text-xs">tables</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <span className="text-2xl font-bold">{template.records}</span>
                    <span className="text-muted-foreground ml-1 text-xs">records</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.tableNames.map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs font-mono">
                      {name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
