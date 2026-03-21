import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const categories = [
  {
    name: "Identity",
    types: [
      { type: "first_name", sample: "Maximilian" },
      { type: "last_name", sample: "Bergmann" },
      { type: "email", sample: "max@web.de" },
      { type: "ssn", sample: "412-68-1932" },
      { type: "username", sample: "mbergmann94" },
    ],
  },
  {
    name: "Location",
    types: [
      { type: "address", sample: "742 Evergreen Terrace" },
      { type: "city", sample: "Munich" },
      { type: "postal_code", sample: "80331" },
      { type: "latitude", sample: "48.1351" },
      { type: "country_code", sample: "DE" },
    ],
  },
  {
    name: "Financial",
    types: [
      { type: "credit_card_number", sample: "4532015112830366" },
      { type: "iban", sample: "DE89370400440532013000" },
      { type: "currency", sample: "EUR" },
      { type: "price", sample: "129.99" },
    ],
  },
  {
    name: "Temporal",
    types: [
      { type: "date", sample: "2024-03-15" },
      { type: "datetime", sample: "2024-03-15T14:30:00Z" },
      { type: "timestamp", sample: "1710510600" },
      { type: "age", sample: "34" },
    ],
  },
  {
    name: "Technical",
    types: [
      { type: "uuid", sample: "f47ac10b-58cc..." },
      { type: "ip_address", sample: "192.168.1.42" },
      { type: "mac_address", sample: "00:1B:44:11:3A:B7" },
      { type: "user_agent", sample: "Mozilla/5.0 (Mac...)" },
      { type: "semver", sample: "3.12.1" },
    ],
  },
  {
    name: "Content",
    types: [
      { type: "sentence", sample: "The quick brown fox..." },
      { type: "paragraph", sample: "Lorem ipsum dolor sit..." },
      { type: "slug", sample: "my-blog-post-title" },
      { type: "color_hex", sample: "#6D28D9" },
    ],
  },
  {
    name: "Social",
    types: [
      { type: "avatar_url", sample: "api.dicebear.com/7.x/..." },
      { type: "bio", sample: "Full-stack dev. Coffee..." },
      { type: "twitter_handle", sample: "@maxbergmann" },
    ],
  },
  {
    name: "HR",
    types: [
      { type: "job_title", sample: "Senior Engineer" },
      { type: "department", sample: "Engineering" },
      { type: "salary", sample: '{ amount, currency, period }' },
      { type: "company_name", sample: "TechCorp GmbH" },
    ],
  },
  {
    name: "E-Commerce",
    types: [
      { type: "product_name", sample: "Wireless Headphones" },
      { type: "sku", sample: "WH-1000XM5" },
      { type: "barcode_ean13", sample: "4006381333931" },
      { type: "rating", sample: "4.7" },
    ],
  },
  {
    name: "Security",
    types: [
      { type: "password_hash", sample: "$2b$10$K4f3..." },
      { type: "jwt_token", sample: "eyJhbGciOiJI..." },
      { type: "api_key", sample: "mk_live_9f3a..." },
    ],
  },
  {
    name: "AI / ML",
    types: [
      { type: "embedding_vector", sample: "[0.023, -0.441, ...]" },
      { type: "label", sample: "positive" },
      { type: "confidence_score", sample: "0.947" },
    ],
  },
  {
    name: "Edge Cases",
    types: [
      { type: "nullable", sample: "null | value" },
      { type: "unicode_string", sample: "\u00C4\u00D6\u00DC\u00DF\u00E9\u00F1\u00FC\u00E8" },
      { type: "empty_string", sample: '""' },
      { type: "boundary_integer", sample: "2147483647" },
      { type: "xss_string", sample: '<script>alert("x")' },
    ],
  },
]

export function FieldTypesShowcase() {
  return (
    <section className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <Badge variant="outline" className="mb-4">Field Type Catalog</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            156 field types. Every edge case covered.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From UUIDs to Luhn-valid credit card numbers. From password hashes to chaos-testing payloads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{cat.name}</h3>
                  <Badge variant="secondary" className="text-xs">{cat.types.length}</Badge>
                </div>
                <div className="space-y-2">
                  {cat.types.map((ft) => (
                    <div key={ft.type} className="flex items-baseline gap-2">
                      <code className="text-xs font-mono text-primary shrink-0">{ft.type}</code>
                      <span className="text-[11px] text-muted-foreground font-mono truncate">{ft.sample}</span>
                    </div>
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
