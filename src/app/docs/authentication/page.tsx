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

export const metadata = {
  title: "Authentication",
  description: "Learn how to authenticate with the MockHero API using API keys.",
}

export default function AuthenticationPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          All MockHero API requests require an API key. Keys are scoped to your account
          and can be created and revoked from your dashboard.
        </p>
      </div>

      <Separator />

      {/* API Key Format */}
      <section>
        <h2 id="api-key-format" className="text-2xl font-bold">API Key Format</h2>
        <p className="mt-2 text-muted-foreground">
          All MockHero API keys share the same format:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">mh_</code> followed by 32
          hexadecimal characters. There is no distinction between test and production keys.
        </p>

        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Prefix</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1.5 py-0.5 font-mono">mh_</code></TableCell>
              <TableCell><code className="font-mono text-muted-foreground">mh_</code> + 32 hex characters</TableCell>
              <TableCell><code className="font-mono text-muted-foreground">mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p className="mt-4 text-sm text-muted-foreground">
          Keys are 35 characters long including the prefix. They contain lowercase hex characters (0-9, a-f).
        </p>
      </section>

      <Separator />

      {/* Sending Your Key */}
      <section>
        <h2 id="sending-your-key" className="text-2xl font-bold">Sending Your Key</h2>
        <p className="mt-2 text-muted-foreground">
          Include your API key in every request using one of the two supported header formats.
          Both are equivalent; use whichever fits your HTTP client.
        </p>

        <h3 id="bearer-token" className="mt-6 text-lg font-semibold">
          Option 1: Authorization Bearer <Badge variant="outline">Recommended</Badge>
        </h3>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0`}
        </pre>

        <h3 id="x-api-key" className="mt-8 text-lg font-semibold">
          Option 2: x-api-key Header
        </h3>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`x-api-key: mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0`}
        </pre>

        <h3 id="full-example" className="mt-8 text-lg font-semibold">Full Request Example</h3>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer mh_7a1c3b24f8d4e6a9b2c1d3e5f7a8b9c0" \\
  -H "Content-Type: application/json" \\
  -d '{ "template": "ecommerce", "scale": 1 }'`}
        </pre>
      </section>

      <Separator />

      {/* Getting a Key */}
      <section>
        <h2 id="getting-a-key" className="text-2xl font-bold">Getting an API Key</h2>
        <p className="mt-2 text-muted-foreground">
          API keys are managed from your MockHero dashboard.
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
          <li>
            Sign up or sign in at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">mockhero.dev/sign-up</code>.
          </li>
          <li>
            Navigate to <strong>Settings &rarr; API Keys</strong>.
          </li>
          <li>
            Click <strong>Create Key</strong>.
          </li>
          <li>
            Copy the key immediately. For security, the full key is only shown once.
          </li>
        </ol>
      </section>

      <Separator />

      {/* Key Rotation */}
      <section>
        <h2 id="key-rotation" className="text-2xl font-bold">Key Rotation</h2>
        <p className="mt-2 text-muted-foreground">
          If a key is compromised or you want to rotate keys as a security practice,
          you can revoke and replace keys without downtime.
        </p>

        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
          <li>
            Create a new key from the dashboard before revoking the old one.
          </li>
          <li>
            Update your application or CI environment to use the new key.
          </li>
          <li>
            Verify the new key works by making a test request.
          </li>
          <li>
            Revoke the old key from <strong>Settings &rarr; API Keys</strong>. The old key
            will immediately return <code className="rounded bg-muted px-1.5 py-0.5 font-mono">401 Unauthorized</code>.
          </li>
        </ol>

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Best practice</p>
          <p className="mt-1 text-muted-foreground">
            Store your API key in an environment variable (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">MOCKHERO_API_KEY</code>)
            rather than hard-coding it. Never commit keys to version control.
          </p>
        </div>
      </section>

      <Separator />

      {/* Error Responses */}
      <section>
        <h2 id="auth-errors" className="text-2xl font-bold">Authentication Errors</h2>
        <p className="mt-2 text-muted-foreground">
          If your key is missing, malformed, or revoked, the API returns one of these responses.
        </p>

        <h3 className="mt-6 text-lg font-semibold">401 Unauthorized &mdash; Missing or Invalid Key</h3>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key is missing or invalid. Include a valid key in the Authorization header."
  }
}`}
        </pre>

        <h3 className="mt-8 text-lg font-semibold">403 Forbidden &mdash; Key Lacks Permission</h3>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
{`{
  "error": {
    "code": "FEATURE_REQUIRES_UPGRADE",
    "message": "Schema detection requires Pro tier or above. Upgrade at https://mockhero.dev/pricing"
  }
}`}
        </pre>
      </section>
    </div>
  )
}
