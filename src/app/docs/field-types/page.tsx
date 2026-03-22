import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponsiveTable, MobileCard } from "@/components/ui/responsive-table"

export const metadata = {
  title: "Field Types",
  description: "All 156 MockHero field types organized by category with parameters and examples.",
}

function TypeTable({
  types,
}: {
  types: { name: string; description: string; params: string; example: string }[]
}) {
  return (
    <ResponsiveTable
      mobileCards={
        <div className="mt-4 space-y-2">
          {types.map((t) => (
            <MobileCard
              key={t.name}
              items={[
                {
                  label: "Type",
                  value: (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {t.name}
                    </code>
                  ),
                },
                { label: "Description", value: <span className="text-xs">{t.description}</span> },
                {
                  label: "Params",
                  value:
                    t.params === "—" ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      <code className="font-mono text-xs">{t.params}</code>
                    ),
                },
                {
                  label: "Example",
                  value: <code className="font-mono text-xs break-all">{t.example}</code>,
                },
              ]}
            />
          ))}
        </div>
      }
    >
      <Table className="mt-4 min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Params</TableHead>
            <TableHead>Example</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((t) => (
            <TableRow key={t.name}>
              <TableCell>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{t.name}</code>
              </TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{t.description}</TableCell>
              <TableCell className="whitespace-normal">{t.params === "—" ? <span className="text-muted-foreground">—</span> : <code className="font-mono text-xs">{t.params}</code>}</TableCell>
              <TableCell><code className="font-mono text-xs">{t.example}</code></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTable>
  )
}

export default function FieldTypesPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Field Types</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          MockHero supports 156 field types organized into 8 categories. Use the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm font-mono">type</code>{" "}
          value in your column definition to select a generator. Many types accept optional{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm font-mono">params</code>{" "}
          for fine-tuning.
        </p>
      </div>

      <Separator />

      {/* Identity */}
      <section>
        <h2 id="identity" className="text-xl sm:text-2xl font-bold">Identity</h2>
        <p className="mt-2 text-muted-foreground">
          People-related fields. All name fields are locale-aware and will produce culturally
          appropriate names when a locale is specified.
        </p>
        <TypeTable
          types={[
            { name: "first_name", description: "Locale-aware first name", params: "—", example: "Amara" },
            { name: "last_name", description: "Locale-aware last name", params: "—", example: "Okafor" },
            { name: "full_name", description: "First + last name combined", params: "—", example: "Amara Okafor" },
            { name: "email", description: "Realistic email derived from name fields when present", params: "domain", example: "amara.okafor@gmail.com" },
            { name: "username", description: "Handle-style username", params: "—", example: "amara_okafor42" },
            { name: "phone", description: "Phone number in locale format", params: "format", example: "+1 (555) 234-5678" },
            { name: "avatar_url", description: "URL to a placeholder avatar image", params: "—", example: "https://api.dicebear.com/7.x/avataaars/svg?seed=482" },
            { name: "gender", description: "Gender string", params: "values", example: "female" },
            { name: "date_of_birth", description: "Date of birth within a realistic range", params: "min_age, max_age", example: "1992-07-14" },
          ]}
        />
      </section>

      <Separator />

      {/* Location */}
      <section>
        <h2 id="location" className="text-xl sm:text-2xl font-bold">Location</h2>
        <p className="mt-2 text-muted-foreground">
          Geographic and address fields. Locale-aware where applicable.
        </p>
        <TypeTable
          types={[
            { name: "city", description: "City name appropriate to the locale", params: "—", example: "Portland" },
            { name: "country", description: "Full country name", params: "—", example: "United States" },
            { name: "postal_code", description: "Postal/ZIP code in locale format", params: "—", example: "97201" },
            { name: "state_province", description: "State, province, or region", params: "—", example: "Oregon" },
            { name: "address", description: "Full street address", params: "—", example: "742 Evergreen Terrace, Apt 3B" },
            { name: "latitude", description: "Latitude coordinate", params: "min, max", example: "45.5152" },
            { name: "longitude", description: "Longitude coordinate", params: "min, max", example: "-122.6784" },
            { name: "timezone", description: "IANA timezone identifier", params: "—", example: "America/Los_Angeles" },
          ]}
        />
      </section>

      <Separator />

      {/* Business */}
      <section>
        <h2 id="business" className="text-xl sm:text-2xl font-bold">Business</h2>
        <p className="mt-2 text-muted-foreground">
          Commerce, finance, and organizational data.
        </p>
        <TypeTable
          types={[
            { name: "company_name", description: "Realistic company name", params: "—", example: "Meridian Systems" },
            { name: "job_title", description: "Professional job title", params: "—", example: "Senior Backend Engineer" },
            { name: "department", description: "Company department name", params: "—", example: "Engineering" },
            { name: "product_name", description: "Consumer product name", params: "—", example: "Wireless Noise-Canceling Headphones" },
            { name: "price", description: "Monetary value with two decimal places", params: "min, max, currency", example: "49.99" },
            { name: "amount", description: "Generic numeric amount", params: "min, max, decimals", example: "1250.00" },
            { name: "decimal", description: "Arbitrary decimal number", params: "min, max, precision", example: "3.14159" },
            { name: "currency", description: "ISO 4217 currency code", params: "—", example: "USD" },
            { name: "rating", description: "Numeric rating", params: "min, max, precision", example: "4.5" },
            { name: "sku", description: "Stock keeping unit code", params: "prefix", example: "SKU-8A3F2C" },
            { name: "credit_card_number", description: "Valid-format credit card number (not real)", params: "network", example: "4532015112830366" },
            { name: "tracking_number", description: "Shipping tracking number", params: "carrier", example: "1Z999AA10123456784" },
          ]}
        />
      </section>

      <Separator />

      {/* Temporal */}
      <section>
        <h2 id="temporal" className="text-xl sm:text-2xl font-bold">Temporal</h2>
        <p className="mt-2 text-muted-foreground">
          Date, time, and duration fields.
        </p>
        <TypeTable
          types={[
            { name: "datetime", description: "ISO 8601 datetime with timezone", params: "min, max", example: "2025-11-03T09:14:00Z" },
            { name: "date", description: "Date in YYYY-MM-DD format", params: "min, max", example: "2025-11-03" },
            { name: "time", description: "Time in HH:mm:ss format", params: "—", example: "09:14:32" },
            { name: "timestamp", description: "Unix timestamp in seconds", params: "min, max", example: "1730628840" },
            { name: "age", description: "Integer age in years", params: "min, max", example: "28" },
            { name: "date_range", description: "Object with start and end dates", params: "min_gap_days, max_gap_days", example: '{"start":"2025-01-01","end":"2025-01-14"}' },
          ]}
        />
      </section>

      <Separator />

      {/* Technical */}
      <section>
        <h2 id="technical" className="text-xl sm:text-2xl font-bold">Technical</h2>
        <p className="mt-2 text-muted-foreground">
          IDs, network, and system-level data types.
        </p>
        <TypeTable
          types={[
            { name: "uuid", description: "UUID v4 string", params: "—", example: "e7a1c3b2-4f8d-4e6a-9b2c-1d3e5f7a8b9c" },
            { name: "id", description: "Auto-incrementing integer ID", params: "start, step", example: "1" },
            { name: "ip_address", description: "IPv4 address", params: "version", example: "192.168.1.42" },
            { name: "mac_address", description: "MAC address", params: "—", example: "3D:F2:C9:A6:B3:4F" },
            { name: "url", description: "Realistic URL", params: "—", example: "https://meridian.systems/about" },
            { name: "domain", description: "Domain name", params: "—", example: "meridian.systems" },
            { name: "user_agent", description: "Browser user-agent string", params: "—", example: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..." },
            { name: "color_hex", description: "Hex color code", params: "—", example: "#4F46E5" },
            { name: "embedding_vector", description: "Float array for ML embeddings", params: "dimensions", example: "[0.0123, -0.0456, ...]" },
          ]}
        />
      </section>

      <Separator />

      {/* Content */}
      <section>
        <h2 id="content" className="text-xl sm:text-2xl font-bold">Content</h2>
        <p className="mt-2 text-muted-foreground">
          Text, media, and content-generation fields.
        </p>
        <TypeTable
          types={[
            { name: "sentence", description: "Single realistic sentence", params: "min_words, max_words", example: "The quick brown fox jumps over the lazy dog." },
            { name: "paragraph", description: "Multi-sentence paragraph", params: "min, max", example: "Lorem ipsum dolor sit amet..." },
            { name: "title", description: "Article or post title", params: "—", example: "Understanding Event-Driven Architecture" },
            { name: "slug", description: "URL-safe slug derived from a title field", params: "—", example: "understanding-event-driven-architecture" },
            { name: "tag", description: "Lowercase tag or keyword", params: "—", example: "javascript" },
            { name: "review", description: "Product or service review text", params: "—", example: "Great build quality and fast shipping. Highly recommended." },
            { name: "image_url", description: "Placeholder image URL", params: "width, height", example: "https://picsum.photos/640/480?random=7" },
            { name: "file_path", description: "Unix-style file path", params: "extension", example: "/var/data/exports/report_2025.csv" },
            { name: "markdown", description: "Markdown-formatted body text", params: "length (short, medium, long)", example: "## Introduction\\n\\nEvent-driven..." },
          ]}
        />
      </section>

      <Separator />

      {/* Logic */}
      <section>
        <h2 id="logic" className="text-xl sm:text-2xl font-bold">Logic</h2>
        <p className="mt-2 text-muted-foreground">
          Structural and control types for building complex schemas.
        </p>
        <TypeTable
          types={[
            { name: "boolean", description: "true or false", params: "probability", example: "true" },
            { name: "enum", description: "Random pick from a provided list", params: "values (required)", example: "pro" },
            { name: "integer", description: "Random integer within range", params: "min, max", example: "42" },
            { name: "ref", description: "Foreign key referencing another table's field", params: "table, field (required)", example: "a1b2c3d4-..." },
            { name: "sequence", description: "Auto-incrementing value with optional prefix/suffix", params: "start, step, prefix, suffix", example: "INV-00001" },
            { name: "constant", description: "Fixed literal value for every row", params: "value (required)", example: "active" },
          ]}
        />

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-3 sm:p-4 text-sm">
          <p className="font-semibold">Using ref for relationships</p>
          <p className="mt-1 text-muted-foreground">
            The <code className="rounded bg-muted px-1.5 py-0.5 font-mono">ref</code> type creates
            foreign key relationships between tables. MockHero guarantees that every ref value
            corresponds to an existing record in the referenced table, maintaining full referential integrity.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-xs font-mono">
{`{
  "name": "author_id",
  "type": "ref",
  "params": { "table": "authors", "field": "id" }
}`}
          </pre>
        </div>
      </section>

      <Separator />

      {/* Security Testing */}
      <section>
        <h2 id="security-testing" className="text-xl sm:text-2xl font-bold">
          Security Testing <Badge variant="secondary">Testing</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Intentionally malicious or edge-case values for security testing and input validation.
          Use these to test that your application properly sanitizes input.
        </p>
        <TypeTable
          types={[
            { name: "password_hash", description: "bcrypt-hashed password string", params: "rounds", example: "$2b$10$N9qo8uLOi..." },
            { name: "xss_string", description: "String containing XSS attack payloads", params: "—", example: '<script>alert("xss")</script>' },
            { name: "sql_injection_string", description: "String containing SQL injection payloads", params: "—", example: "'; DROP TABLE users; --" },
          ]}
        />

        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:p-4 text-sm">
          <p className="font-semibold text-destructive">Warning</p>
          <p className="mt-1 text-muted-foreground">
            Security testing types generate intentionally malicious strings. Only use them
            in test environments where you are explicitly testing input validation and sanitization.
            Never insert this data into production databases.
          </p>
        </div>
      </section>

      <Separator />

      {/* Using Params */}
      <section>
        <h2 id="using-params" className="text-xl sm:text-2xl font-bold">Using Params</h2>
        <p className="mt-2 text-muted-foreground">
          Many field types accept a <code className="rounded bg-muted px-1.5 py-0.5 font-mono">params</code>{" "}
          object for customization. Here are common patterns.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Numeric Ranges</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{ "name": "price", "type": "price", "params": { "min": 9.99, "max": 499.99 } }
{ "name": "quantity", "type": "integer", "params": { "min": 1, "max": 100 } }
{ "name": "score", "type": "rating", "params": { "min": 1, "max": 5, "precision": 1 } }`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Enum Values</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{ "name": "status", "type": "enum", "params": { "values": ["pending", "active", "suspended"] } }
{ "name": "role",   "type": "enum", "params": { "values": ["admin", "editor", "viewer"] } }`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Date Ranges</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{ "name": "created_at", "type": "datetime", "params": { "min": "2024-01-01", "max": "2025-12-31" } }
{ "name": "birthday",   "type": "date_of_birth", "params": { "min_age": 18, "max_age": 65 } }`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Foreign Keys</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{ "name": "user_id",    "type": "ref", "params": { "table": "users", "field": "id" } }
{ "name": "product_id", "type": "ref", "params": { "table": "products", "field": "id" } }`}
        </pre>
      </section>
    </div>
  )
}
