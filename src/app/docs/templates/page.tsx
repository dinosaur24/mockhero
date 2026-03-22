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
  title: "Templates",
  description: "Pre-built data templates for ecommerce, blog, SaaS, and social apps.",
}

function TemplateTable({
  rows,
}: {
  rows: { table: string; count: number | string; columns: string }[]
}) {
  return (
    <ResponsiveTable
      mobileCards={
        <div className="mt-4 space-y-2">
          {rows.map((row) => (
            <MobileCard
              key={row.table}
              items={[
                { label: "Table", value: <code className="font-mono text-xs">{row.table}</code> },
                { label: "Count", value: <span className="text-xs">{row.count}</span> },
                { label: "Columns", value: <span className="text-xs break-words">{row.columns}</span> },
              ]}
            />
          ))}
        </div>
      }
    >
      <Table className="mt-4 min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead>Table</TableHead>
            <TableHead>Default Count</TableHead>
            <TableHead>Key Columns</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.table}>
              <TableCell><code className="font-mono">{row.table}</code></TableCell>
              <TableCell>{row.count}</TableCell>
              <TableCell>{row.columns}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTable>
  )
}

export default function TemplatesPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Templates</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          Templates are pre-built schemas for common application types. Pass a template name
          to the generate endpoint and get back a fully relational dataset with sensible
          defaults. Use the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm font-mono">scale</code>{" "}
          parameter to multiply the default record counts.
        </p>
      </div>

      <Separator />

      {/* Scale Parameter */}
      <section>
        <h2 id="scale-parameter" className="text-xl sm:text-2xl font-bold">Scale Parameter</h2>
        <p className="mt-2 text-muted-foreground">
          Every template has default record counts per table. The{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">scale</code>{" "}
          parameter multiplies all counts proportionally.
        </p>
        <ResponsiveTable
          mobileCards={
            <div className="mt-4 space-y-2">
              {[
                { scale: "0.1", effect: "10% of default counts (minimum 1 per table)", useCase: "Quick smoke test" },
                { scale: "1", effect: "Default counts", useCase: "Development and unit tests" },
                { scale: "5", effect: "5x default counts", useCase: "Integration testing" },
                { scale: "50", effect: "50x default counts", useCase: "Performance and load testing" },
                { scale: "100", effect: "Maximum multiplier", useCase: "Stress testing (subject to per-request limits)" },
              ].map((row) => (
                <MobileCard
                  key={row.scale}
                  items={[
                    { label: "Scale", value: <code className="font-mono text-xs">{row.scale}</code> },
                    { label: "Effect", value: <span className="text-xs">{row.effect}</span> },
                    { label: "Use Case", value: <span className="text-xs">{row.useCase}</span> },
                  ]}
                />
              ))}
            </div>
          }
        >
          <Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Scale</TableHead>
              <TableHead>Effect</TableHead>
              <TableHead>Use Case</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">0.1</code></TableCell>
              <TableCell>10% of default counts (minimum 1 per table)</TableCell>
              <TableCell>Quick smoke test</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">1</code></TableCell>
              <TableCell>Default counts</TableCell>
              <TableCell>Development and unit tests</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">5</code></TableCell>
              <TableCell>5x default counts</TableCell>
              <TableCell>Integration testing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">50</code></TableCell>
              <TableCell>50x default counts</TableCell>
              <TableCell>Performance and load testing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">100</code></TableCell>
              <TableCell>Maximum multiplier</TableCell>
              <TableCell>Stress testing (subject to per-request limits)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>
      </section>

      <Separator />

      {/* Ecommerce */}
      <section>
        <h2 id="ecommerce" className="text-xl sm:text-2xl font-bold">
          ecommerce <Badge variant="outline">5 tables</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          A full e-commerce dataset with customers, products, orders, line items, and reviews.
          All foreign keys are valid, order totals are consistent with line item prices,
          and dates are chronologically ordered.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Tables and Default Counts</h3>
        <TemplateTable
          rows={[
            { table: "customers", count: 100, columns: "id, first_name, last_name, email, phone, address, city, country, postal_code, avatar_url, created_at, updated_at, is_active" },
            { table: "products", count: 50, columns: "id, name, description, category, price, sku, image_url, stock_quantity, created_at, updated_at" },
            { table: "orders", count: 300, columns: "id, order_number, customer_id (ref), status, total, currency, payment_method, ordered_at, updated_at" },
            { table: "order_items", count: 900, columns: "id, order_id (ref), product_id (ref), quantity, unit_price" },
            { table: "reviews", count: 200, columns: "id, customer_id (ref), product_id (ref), rating, title, body, created_at" },
          ]}
        />

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Request</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "ecommerce",
  "scale": 1,
  "format": "json"
}`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Response (truncated)</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "customers": [
      {
        "id": "c1a2b3d4-...",
        "first_name": "Amara",
        "last_name": "Okafor",
        "email": "amara.okafor@example.com",
        "phone": "+1 (555) 234-5678",
        "address": "742 Evergreen Terrace",
        "city": "Portland",
        "country": "US",
        "postal_code": "97201",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=291",
        "created_at": "2024-08-12T14:30:00Z",
        "updated_at": "2025-01-10T09:15:00Z",
        "is_active": true
      }
    ],
    "products": [
      {
        "id": "p5e6f7a8-...",
        "name": "Ergonomic Mesh Chair",
        "description": "Premium ergonomic office chair with adjustable lumbar support.",
        "category": "Electronics",
        "price": 189.50,
        "sku": "SKU-8A3F2C",
        "image_url": "https://picsum.photos/640/480?random=7",
        "stock_quantity": 234,
        "created_at": "2024-09-11T00:00:00Z",
        "updated_at": "2025-08-20T00:00:00Z"
      }
    ],
    "orders": [
      {
        "id": "o9b0c1d2-...",
        "order_number": "ORD-1001",
        "customer_id": "c1a2b3d4-...",
        "status": "delivered",
        "total": 264.49,
        "currency": "USD",
        "payment_method": "credit_card",
        "ordered_at": "2025-01-15T10:22:00Z",
        "updated_at": "2025-01-20T14:30:00Z"
      }
    ],
    "order_items": [
      {
        "id": "i3e4f5a6-...",
        "order_id": "o9b0c1d2-...",
        "product_id": "p5e6f7a8-...",
        "quantity": 1,
        "unit_price": 189.50
      }
    ]
  },
  "meta": {
    "tables": 5,
    "total_records": 1550,
    "format": "json",
    "seed": 5519832,
    "generation_time_ms": 412
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* Blog */}
      <section>
        <h2 id="blog" className="text-xl sm:text-2xl font-bold">
          blog <Badge variant="outline">5 tables</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          A content management dataset with authors, posts (including markdown bodies and slugs),
          comments, tags, and a many-to-many join table for post-tag relationships.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Tables and Default Counts</h3>
        <TemplateTable
          rows={[
            { table: "authors", count: 30, columns: "id, country, first_name, last_name, email, username, avatar_url, bio, created_at" },
            { table: "posts", count: 150, columns: "id, author_id (ref), title, slug, excerpt, content (markdown), featured_image, status, created_at, published_at, updated_at" },
            { table: "comments", count: 600, columns: "id, post_id (ref), commenter_name, commenter_email, body, is_approved, created_at" },
            { table: "tags", count: 20, columns: "id, name, slug" },
            { table: "post_tags", count: 400, columns: "id, post_id (ref), tag_id (ref)" },
          ]}
        />

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Request</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "blog",
  "scale": 1,
  "format": "json"
}`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Response (truncated)</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "authors": [
      {
        "id": "a1b2c3d4-...",
        "country": "US",
        "first_name": "Priya",
        "last_name": "Sharma",
        "email": "priya.sharma@techblog.io",
        "username": "psharma",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=482",
        "bio": "Staff engineer writing about distributed systems and developer tooling.",
        "created_at": "2023-04-12T00:00:00Z"
      }
    ],
    "posts": [
      {
        "id": "e5f6a7b8-...",
        "author_id": "a1b2c3d4-...",
        "title": "Understanding Event-Driven Architecture",
        "slug": "understanding-event-driven-architecture",
        "excerpt": "Event-driven architecture decouples producers from consumers.",
        "content": "## Introduction\\n\\nEvent-driven architecture decouples producers...",
        "featured_image": "https://picsum.photos/800/400?random=3",
        "status": "published",
        "created_at": "2025-09-20T00:00:00Z",
        "published_at": "2025-11-03T09:14:00Z",
        "updated_at": "2025-11-10T00:00:00Z"
      }
    ],
    "comments": [
      {
        "id": "c9d0e1f2-...",
        "post_id": "e5f6a7b8-...",
        "commenter_name": "Liam Chen",
        "commenter_email": "liam.chen@example.com",
        "body": "Great writeup! The section on event sourcing really clicked for me.",
        "is_approved": true,
        "created_at": "2025-11-04T12:03:00Z"
      }
    ],
    "tags": [
      { "id": "t1a2b3c4-...", "name": "Architecture", "slug": "architecture" }
    ],
    "post_tags": [
      { "id": "j1k2l3m4-...", "post_id": "e5f6a7b8-...", "tag_id": "t1a2b3c4-..." }
    ]
  },
  "meta": {
    "tables": 5,
    "total_records": 1200,
    "format": "json",
    "seed": 3318274,
    "generation_time_ms": 287
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* SaaS */}
      <section>
        <h2 id="saas" className="text-xl sm:text-2xl font-bold">
          saas <Badge variant="outline">4 tables</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          A multi-tenant SaaS dataset with organizations, members scoped to organizations,
          subscriptions, and invoices with realistic billing data and timestamps.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Tables and Default Counts</h3>
        <TemplateTable
          rows={[
            { table: "organizations", count: 20, columns: "id, name, slug, domain, country, created_at, updated_at" },
            { table: "members", count: 100, columns: "id, org_id (ref), first_name, last_name, email, role, job_title, avatar_url, invited_at" },
            { table: "subscriptions", count: 20, columns: "id, org_id (ref), plan, status, interval, amount, currency, current_period_start, current_period_end, trial_end, started_at, updated_at" },
            { table: "invoices", count: 120, columns: "id, invoice_number, subscription_id (ref), amount, currency, status, issued_at, due_date" },
          ]}
        />

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Request</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "saas",
  "scale": 2,
  "format": "json"
}`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Response (truncated)</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "organizations": [
      {
        "id": "org_1a2b3c-...",
        "name": "Meridian Systems",
        "slug": "meridian-systems",
        "domain": "meridian.systems",
        "country": "US",
        "created_at": "2023-06-15T00:00:00Z",
        "updated_at": "2025-09-10T00:00:00Z"
      }
    ],
    "members": [
      {
        "id": "usr_4d5e6f-...",
        "org_id": "org_1a2b3c-...",
        "first_name": "Jordan",
        "last_name": "Rivera",
        "email": "jordan@meridian.systems",
        "role": "admin",
        "job_title": "VP of Engineering",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=194",
        "invited_at": "2023-06-15T10:00:00Z"
      }
    ],
    "subscriptions": [
      {
        "id": "sub_7a8b9c-...",
        "org_id": "org_1a2b3c-...",
        "plan": "enterprise",
        "status": "active",
        "interval": "yearly",
        "amount": "1990.00",
        "currency": "USD",
        "current_period_start": "2026-03-01T00:00:00Z",
        "current_period_end": "2026-04-15T00:00:00Z",
        "started_at": "2024-06-15T00:00:00Z",
        "updated_at": "2026-03-01T00:00:00Z"
      }
    ],
    "invoices": [
      {
        "id": "inv_d0e1f2-...",
        "invoice_number": "INV-1001",
        "subscription_id": "sub_7a8b9c-...",
        "amount": "1990.00",
        "currency": "USD",
        "status": "paid",
        "issued_at": "2025-12-01T00:00:00Z",
        "due_date": "2026-04-20T00:00:00Z"
      }
    ]
  },
  "meta": {
    "tables": 4,
    "total_records": 520,
    "format": "json",
    "seed": 6617493,
    "generation_time_ms": 356
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* Social */}
      <section>
        <h2 id="social" className="text-xl sm:text-2xl font-bold">
          social <Badge variant="outline">5 tables</Badge>
        </h2>
        <p className="mt-2 text-muted-foreground">
          A social network dataset with user profiles, posts, likes, follow relationships,
          and direct messages. Follows and likes reference valid users and posts.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Tables and Default Counts</h3>
        <TemplateTable
          rows={[
            { table: "users", count: 150, columns: "id, country, username, first_name, last_name, email, avatar_url, display_name, bio, is_verified, created_at, updated_at" },
            { table: "posts", count: 600, columns: "id, user_id (ref), content, hashtag, created_at" },
            { table: "likes", count: 3000, columns: "id, user_id (ref), post_id (ref), created_at" },
            { table: "follows", count: 2000, columns: "id, follower_id (ref users), following_id (ref users), created_at" },
            { table: "messages", count: 1000, columns: "id, sender_id (ref), receiver_id (ref), body, is_read, sent_at" },
          ]}
        />

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Request</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0

{
  "template": "social",
  "scale": 0.5,
  "format": "json"
}`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Response (truncated)</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`{
  "data": {
    "users": [
      {
        "id": "u1a2b3c4-...",
        "country": "US",
        "username": "liam_chen",
        "first_name": "Liam",
        "last_name": "Chen",
        "email": "liam.chen@example.com",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=738",
        "display_name": "Liam Chen",
        "bio": "Full-stack dev. Coffee enthusiast. Open source contributor.",
        "is_verified": false,
        "created_at": "2024-03-22T10:00:00Z",
        "updated_at": "2025-08-01T00:00:00Z"
      }
    ],
    "posts": [
      {
        "id": "p5e6f7a8-...",
        "user_id": "u1a2b3c4-...",
        "content": "Just shipped a new feature using MockHero for all our test data. Game changer.",
        "hashtag": "#devtools",
        "created_at": "2025-12-18T16:45:00Z"
      }
    ],
    "likes": [
      { "id": "l9b0c1d2-...", "user_id": "u3e4f5a6-...", "post_id": "p5e6f7a8-...", "created_at": "2025-12-18T17:02:00Z" }
    ],
    "follows": [
      { "id": "f7a8b9c0-...", "follower_id": "u3e4f5a6-...", "following_id": "u1a2b3c4-...", "created_at": "2024-05-10T00:00:00Z" }
    ],
    "messages": [
      {
        "id": "m1d2e3f4-...",
        "sender_id": "u3e4f5a6-...",
        "receiver_id": "u1a2b3c4-...",
        "body": "Hey! Loved your post about MockHero. Want to collaborate?",
        "is_read": true,
        "sent_at": "2025-12-18T18:30:00Z"
      }
    ]
  },
  "meta": {
    "tables": 5,
    "total_records": 3375,
    "format": "json",
    "seed": 9912847,
    "generation_time_ms": 298
  }
}`}
        </pre>
      </section>
    </div>
  )
}
