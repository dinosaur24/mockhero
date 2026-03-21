import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const schemaCode = `{
  "tables": [{
    "name": "contacts",
    "count": 4,
    "fields": [
      { "name": "country", "type": "enum",
        "params": { "values": ["DE","FR","JP","BR"] } },
      { "name": "first_name", "type": "first_name" },
      { "name": "last_name", "type": "last_name" },
      { "name": "email", "type": "email" },
      { "name": "phone", "type": "phone" }
    ]
  }]
}`

const generatedRows = [
  {
    flag: "\u{1F1E9}\u{1F1EA}",
    country: "DE",
    name: "Maximilian Bergmann",
    email: "maximilian.bergmann@web.de",
    phone: "+49 151 2345 6789",
  },
  {
    flag: "\u{1F1EB}\u{1F1F7}",
    country: "FR",
    name: "Camille Dubois",
    email: "camille.dubois@orange.fr",
    phone: "+33 6 12 34 56 78",
  },
  {
    flag: "\u{1F1EF}\u{1F1F5}",
    country: "JP",
    name: "\u7530\u4E2D \u592A\u90CE",
    email: "tanaka.taro@yahoo.co.jp",
    phone: "+81 90 1234 5678",
  },
  {
    flag: "\u{1F1E7}\u{1F1F7}",
    country: "BR",
    name: "Lucas Silva",
    email: "lucas.silva@uol.com.br",
    phone: "+55 11 91234 5678",
  },
]

export function AutoLocaleShowcase() {
  return (
    <section className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <Badge variant="outline" className="mb-4">Auto-Locale Detection</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One schema. Every nationality.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Add a country field and MockHero generates culturally accurate data per row. 22 locales supported.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Schema Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Schema Input</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm font-mono leading-relaxed overflow-x-auto bg-muted rounded-md p-4">
                <code>{schemaCode}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Generated Output */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Generated Output</CardTitle>
                <Badge variant="secondary" className="text-xs">Auto-detected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedRows.map((row) => (
                  <div key={row.country} className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
                    <span className="text-2xl">{row.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">{row.country}</Badge>
                        <span className="font-medium text-sm">{row.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{row.email}</p>
                      <p className="text-xs text-muted-foreground font-mono">{row.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
