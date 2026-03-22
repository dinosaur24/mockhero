import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponsiveTable } from "@/components/ui/responsive-table"

export const metadata = {
  title: "Error Codes",
  description: "Complete reference for all MockHero API error responses.",
}

export default function ErrorsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Codes</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          All errors follow a consistent envelope format. The HTTP status code indicates the
          error category, while the <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">error.code</code>{" "}
          field provides a machine-readable identifier you can match on in your code.
        </p>
      </div>

      <Separator />

      {/* Error Envelope */}
      <section>
        <h2 id="error-format" className="text-2xl font-bold">Error Response Format</h2>
        <p className="mt-2 text-muted-foreground">
          Every error response has the same shape, regardless of HTTP status code.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of what went wrong.",
    "details": []  // Optional array. Present on validation errors.
  }
}`}
        </pre>

        <ResponsiveTable>
        <Table className="mt-6 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">error.code</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell>Machine-readable error code. Stable across versions.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">error.message</code></TableCell>
              <TableCell><code className="font-mono">string</code></TableCell>
              <TableCell>Human-readable message. May change; do not match on this.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">error.details</code></TableCell>
              <TableCell><code className="font-mono">array</code></TableCell>
              <TableCell>Optional. Array of <code className="font-mono">{`{ field?, message, suggestion? }`}</code> objects for validation errors.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>
      </section>

      <Separator />

      {/* 400 */}
      <section>
        <h2 id="400" className="text-2xl font-bold">400 Bad Request</h2>
        <p className="mt-2 text-muted-foreground">
          The request body is not valid JSON, is empty, or is missing top-level required fields.
          This fires before schema validation, so it typically means the payload could not
          be parsed at all.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body must be valid JSON. Check for trailing commas or unquoted keys."
  }
}`}
        </pre>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Common causes</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Trailing comma in JSON body</li>
            <li>Missing <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Content-Type: application/json</code> header</li>
            <li>Empty request body</li>
            <li>Body sent as form-encoded instead of JSON</li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* 400 SCHEMA_ERROR */}
      <section>
        <h2 id="400-schema-error" className="text-2xl font-bold">400 Bad Request &mdash; Schema Error</h2>
        <p className="mt-2 text-muted-foreground">
          The schema definition contains invalid field types, references to undefined tables, or
          invalid count values.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "SCHEMA_ERROR",
    "message": "Schema validation failed. Check field types, table references, and count values."
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* 400 DEPENDENCY_CYCLE */}
      <section>
        <h2 id="400-dependency-cycle" className="text-2xl font-bold">400 Bad Request &mdash; Dependency Cycle</h2>
        <p className="mt-2 text-muted-foreground">
          The schema contains circular foreign-key references between tables that cannot be resolved.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "DEPENDENCY_CYCLE",
    "message": "Circular dependency detected between tables."
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* 401 */}
      <section>
        <h2 id="401" className="text-2xl font-bold">401 Unauthorized</h2>
        <p className="mt-2 text-muted-foreground">
          The API key is missing, malformed, expired, or revoked. Check that you are
          sending a valid key in the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Authorization</code>{" "}
          or <code className="rounded bg-muted px-1.5 py-0.5 font-mono">x-api-key</code> header.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key is missing or invalid. Include a valid key in the Authorization header."
  }
}`}
        </pre>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Common causes</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>No <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Authorization</code> or <code className="rounded bg-muted px-1.5 py-0.5 font-mono">x-api-key</code> header</li>
            <li>Missing <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Bearer </code> prefix in Authorization header</li>
            <li>Key has been revoked from the dashboard</li>
            <li>Using a key from a different MockHero account</li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* 403 */}
      <section>
        <h2 id="403" className="text-2xl font-bold">403 Forbidden</h2>
        <p className="mt-2 text-muted-foreground">
          Your API key is valid but your plan does not include the requested feature.
          Upgrade your plan to access the feature.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "FEATURE_REQUIRES_UPGRADE",
    "message": "Your plan does not include access to the schema detection endpoint. Upgrade to Pro or above."
  }
}`}
        </pre>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Features that require Pro or Scale</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Schema detection endpoint (<code className="rounded bg-muted px-1.5 py-0.5 font-mono">POST /schema/detect</code>)</li>
            <li>CSV and SQL output formats</li>
            <li>Seed parameter for reproducibility</li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* 404 */}
      <section>
        <h2 id="404" className="text-2xl font-bold">404 Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested resource does not exist. This typically means the ID in the URL path is
          invalid or the resource has been deleted.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found. Check the ID and try again."
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* 413 */}
      <section>
        <h2 id="413" className="text-2xl font-bold">413 Payload Too Large</h2>
        <p className="mt-2 text-muted-foreground">
          The request body exceeds the maximum allowed size of 1 MB. This typically happens
          when sending very large schema definitions or long prompts.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 413 Payload Too Large
Content-Type: application/json

{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request body exceeds the 1 MB limit. Reduce the number of table definitions or use a template instead."
  }
}`}
        </pre>
      </section>

      <Separator />

      {/* 422 */}
      <section>
        <h2 id="422" className="text-2xl font-bold">422 Unprocessable Entity</h2>
        <p className="mt-2 text-muted-foreground">
          The JSON is well-formed but the content fails validation. This covers schema
          errors (invalid field types, missing required fields, circular references) and
          prompt conversion failures.
        </p>

        <h3 className="mt-6 text-lg font-semibold">Schema Validation Error</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Schema validation failed. See details for specific issues.",
    "details": [
      {
        "field": "tables[0].fields[2].type",
        "message": "Unknown field type \\"emial\\"",
        "suggestion": "Did you mean \\"email\\"?"
      },
      {
        "field": "tables[1].fields[0].params.table",
        "message": "Referenced table \\"users\\" is not defined in the schema."
      }
    ]
  }
}`}
        </pre>

        <h3 className="mt-8 text-lg font-semibold">Prompt Conversion Error</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": {
    "code": "PROMPT_CONVERSION_FAILED",
    "message": "Could not convert prompt to a valid schema. Try being more specific about the tables and columns you need."
  }
}`}
        </pre>

      </section>

      <Separator />

      {/* 429 */}
      <section>
        <h2 id="429" className="text-2xl font-bold">429 Too Many Requests</h2>
        <p className="mt-2 text-muted-foreground">
          You have exceeded your daily record limit or per-minute request limit. For per-minute
          limits, the response includes a <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Retry-After</code>{" "}
          header indicating how many seconds to wait.
        </p>

        <h3 className="mt-6 text-lg font-semibold">Per-Request Limit Exceeded</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Per-request limit exceeded. Maximum 10,000 records per request for pro tier."
  }
}`}
        </pre>

        <h3 className="mt-8 text-lg font-semibold">Daily Limit Exceeded</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
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

        <h3 className="mt-8 text-lg font-semibold">Per-Minute Limit Exceeded</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 42

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Per-minute request limit exceeded. Your plan allows 10 requests per minute."
  }
}`}
        </pre>

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Handling 429 responses</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Read the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Retry-After</code> header and wait that many seconds before retrying.</li>
            <li>Implement exponential backoff if you receive multiple 429s in a row.</li>
            <li>Do not retry immediately in a tight loop. This may result in extended throttling.</li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* 500 */}
      <section>
        <h2 id="500" className="text-2xl font-bold">500 Internal Server Error</h2>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred on the MockHero server. These are rare and are
          automatically reported to our engineering team. If the error persists, include
          the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">X-Request-Id</code>{" "}
          header value when contacting support.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`HTTP/1.1 500 Internal Server Error
Content-Type: application/json
X-Request-Id: req_8a3f2c1d7e9b

{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Our team has been notified. If this persists, contact support@mockhero.dev with request ID req_8a3f2c1d7e9b."
  }
}`}
        </pre>

        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">When to retry</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Wait 1-2 seconds and retry once. Most 500 errors are transient.</li>
            <li>If the error persists after 3 retries, check the <a href="https://status.mockhero.dev" className="text-primary underline underline-offset-4">status page</a> for ongoing incidents.</li>
            <li>Contact <code className="rounded bg-muted px-1.5 py-0.5 font-mono">support@mockhero.dev</code> with the <code className="rounded bg-muted px-1.5 py-0.5 font-mono">X-Request-Id</code> value for investigation.</li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* Summary Table */}
      <section>
        <h2 id="summary" className="text-2xl font-bold">Quick Reference</h2>
        <ResponsiveTable>
        <Table className="mt-4 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Retryable</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="font-mono">400</code></TableCell>
              <TableCell><code className="font-mono">VALIDATION_ERROR</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Fix the JSON payload.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">400</code></TableCell>
              <TableCell><code className="font-mono">SCHEMA_ERROR</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Fix field types, table refs, or counts.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">400</code></TableCell>
              <TableCell><code className="font-mono">DEPENDENCY_CYCLE</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Remove circular table dependencies.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">401</code></TableCell>
              <TableCell><code className="font-mono">UNAUTHORIZED</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Check your API key.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">403</code></TableCell>
              <TableCell><code className="font-mono">FEATURE_REQUIRES_UPGRADE</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Upgrade your plan.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">404</code></TableCell>
              <TableCell><code className="font-mono">NOT_FOUND</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Check the resource ID and try again.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">413</code></TableCell>
              <TableCell><code className="font-mono">PAYLOAD_TOO_LARGE</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Reduce request body size.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">422</code></TableCell>
              <TableCell><code className="font-mono">VALIDATION_ERROR</code></TableCell>
              <TableCell>No</TableCell>
              <TableCell>Fix validation issues in details.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">429</code></TableCell>
              <TableCell><code className="font-mono">RATE_LIMIT_EXCEEDED</code></TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Wait for Retry-After seconds.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="font-mono">500</code></TableCell>
              <TableCell><code className="font-mono">INTERNAL_ERROR</code></TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Retry after 1-2 seconds.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </ResponsiveTable>
      </section>
    </div>
  )
}
