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
  title: "Rate Limits",
  description: "Understand MockHero rate limits across Free, Pro, and Scale plans.",
}

export default function RateLimitsPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rate Limits</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          MockHero enforces rate limits to ensure fair usage and platform stability.
          Limits vary by plan and are measured in records generated, not API calls.
        </p>
      </div>

      <Separator />

      {/* Tier Comparison */}
      <section>
        <h2 id="tier-comparison" className="text-xl sm:text-2xl font-bold">Tier Comparison</h2>
        <p className="mt-2 text-muted-foreground">
          All limits reset daily at midnight UTC.
        </p>

        <ResponsiveTable
          mobileCards={
            <div className="mt-4 space-y-2">
              {[
                { limit: "Daily records", free: "1,000", pro: "100,000", scale: "1,000,000" },
                { limit: "Per-request records", free: "100", pro: "10,000", scale: "50,000" },
                { limit: "Requests per minute", free: "10", pro: "60", scale: "120" },
                { limit: "Output formats", free: "JSON", pro: "JSON, CSV, SQL", scale: "JSON, CSV, SQL" },
                { limit: "Seed for reproducibility", free: "No", pro: "Yes", scale: "Yes" },
                { limit: "Schema detection", free: "No", pro: "Yes", scale: "Yes" },
              ].map((row) => (
                <MobileCard
                  key={row.limit}
                  items={[
                    { label: "Limit", value: <span className="font-medium text-xs">{row.limit}</span> },
                    { label: "Free", value: <span className="text-xs">{row.free}</span> },
                    { label: "Pro ($29)", value: <span className="text-xs">{row.pro}</span> },
                    { label: "Scale ($79)", value: <span className="text-xs">{row.scale}</span> },
                  ]}
                />
              ))}
            </div>
          }
        >
          <Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Limit</TableHead>
              <TableHead>Free</TableHead>
              <TableHead>Pro ($29/mo)</TableHead>
              <TableHead>Scale ($79/mo)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Daily records</TableCell>
              <TableCell>1,000</TableCell>
              <TableCell>100,000</TableCell>
              <TableCell>1,000,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Per-request records</TableCell>
              <TableCell>100</TableCell>
              <TableCell>10,000</TableCell>
              <TableCell>50,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Requests per minute</TableCell>
              <TableCell>10</TableCell>
              <TableCell>60</TableCell>
              <TableCell>120</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Output formats</TableCell>
              <TableCell>JSON</TableCell>
              <TableCell>JSON, CSV, SQL</TableCell>
              <TableCell>JSON, CSV, SQL</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Seed for reproducibility</TableCell>
              <TableCell><span className="text-muted-foreground">No</span></TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Schema detection</TableCell>
              <TableCell><span className="text-muted-foreground">No</span></TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>
      </section>

      <Separator />

      {/* Response Headers */}
      <section>
        <h2 id="response-headers" className="text-xl sm:text-2xl font-bold">Rate Limit Response Headers</h2>
        <p className="mt-2 text-muted-foreground">
          Every authenticated response includes headers so you can track your usage
          without making extra API calls.
        </p>

        <ResponsiveTable
          mobileCards={
            <div className="mt-4 space-y-2">
              {[
                { header: "X-RateLimit-Limit", type: "integer", desc: "Maximum records your plan allows per day." },
                { header: "X-RateLimit-Remaining", type: "integer", desc: "Records remaining in the current daily window." },
                { header: "X-RateLimit-Reset", type: "string (ISO 8601)", desc: "Timestamp when the daily limit resets (midnight UTC)." },
                { header: "Retry-After", type: "integer", desc: "Seconds to wait before retrying. Only on 429 responses." },
              ].map((row) => (
                <MobileCard
                  key={row.header}
                  items={[
                    { label: "Header", value: <code className="font-mono text-xs">{row.header}</code> },
                    { label: "Type", value: <code className="font-mono text-xs">{row.type}</code> },
                    { label: "Description", value: <span className="text-xs">{row.desc}</span> },
                  ]}
                />
              ))}
            </div>
          }
        >
          <Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Limit</code></TableCell>
              <TableCell><code className="font-mono">integer</code></TableCell>
              <TableCell>Maximum records your plan allows per day.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Remaining</code></TableCell>
              <TableCell><code className="font-mono">integer</code></TableCell>
              <TableCell>Records remaining in the current daily window.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">X-RateLimit-Reset</code></TableCell>
              <TableCell><code className="font-mono">string (ISO 8601)</code></TableCell>
              <TableCell>ISO 8601 timestamp when the daily limit resets (midnight UTC). Example: <code className="font-mono">&quot;2026-03-21T00:00:00.000Z&quot;</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">Retry-After</code></TableCell>
              <TableCell><code className="font-mono">integer</code></TableCell>
              <TableCell>Seconds to wait before retrying. Only present on 429 responses for per-minute rate limits (not daily limits).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Example Headers</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 100000
X-RateLimit-Remaining: 94320
X-RateLimit-Reset: 2026-03-21T00:00:00.000Z
X-Request-Id: req_8a3f2c1d7e9b`}
        </pre>
      </section>

      <Separator />

      {/* What Happens When Limited */}
      <section>
        <h2 id="rate-limit-exceeded" className="text-xl sm:text-2xl font-bold">When You Hit the Limit</h2>
        <p className="mt-2 text-muted-foreground">
          When you exceed your daily record limit or per-minute request limit, the API
          returns a <code className="rounded bg-muted px-1.5 py-0.5 font-mono">429 Too Many Requests</code>{" "}
          response. For per-minute limits, a <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Retry-After</code>{" "}
          header is included indicating how many seconds to wait.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">429 Response Example</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-04-01T00:00:00.000Z

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily record limit exceeded. Your plan allows 1,000 records per day. Resets at 2026-04-01T00:00:00Z."
  }
}`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">Best Practices</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Monitor the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">X-RateLimit-Remaining</code>{" "}
            header to see how many records you have left before hitting the limit.
          </li>
          <li>
            Use the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">seed</code> parameter (Pro+)
            to cache and replay results instead of re-generating identical datasets.
          </li>
          <li>
            Generate data in bulk rather than one record at a time to maximize the
            value of each request within per-minute limits.
          </li>
          <li>
            If you consistently hit limits, consider upgrading your plan. The Pro tier
            offers 100x the daily record allowance of the Free tier.
          </li>
        </ul>
      </section>

      <Separator />

      {/* Per-Minute Limits */}
      <section>
        <h2 id="per-minute-limits" className="text-xl sm:text-2xl font-bold">Per-Minute Rate Limits</h2>
        <p className="mt-2 text-muted-foreground">
          In addition to daily record limits, MockHero enforces per-minute request limits
          to prevent burst abuse. These are measured as total HTTP requests to any authenticated
          endpoint, not records generated.
        </p>

        <ResponsiveTable
          mobileCards={
            <div className="mt-4 space-y-2">
              {[
                { plan: "Free", rpm: "10", window: "Fixed 60-second window" },
                { plan: "Pro", rpm: "60", window: "Fixed 60-second window" },
                { plan: "Scale", rpm: "120", window: "Fixed 60-second window" },
              ].map((row) => (
                <MobileCard
                  key={row.plan}
                  items={[
                    { label: "Plan", value: <span className="text-xs font-medium">{row.plan}</span> },
                    { label: "Requests / Min", value: <span className="text-xs">{row.rpm}</span> },
                    { label: "Burst Window", value: <span className="text-xs">{row.window}</span> },
                  ]}
                />
              ))}
            </div>
          }
        >
          <Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Requests / Minute</TableHead>
              <TableHead>Burst Window</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Free</TableCell>
              <TableCell>10</TableCell>
              <TableCell>Fixed 60-second window</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pro</TableCell>
              <TableCell>60</TableCell>
              <TableCell>Fixed 60-second window</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Scale</TableCell>
              <TableCell>120</TableCell>
              <TableCell>Fixed 60-second window</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>

        <p className="mt-4 text-sm text-muted-foreground">
          Per-minute limits use a fixed window algorithm that resets every 60 seconds. If you
          exhaust your limit, you must wait until the current window resets before sending
          additional requests.
        </p>
      </section>

    </div>
  )
}
