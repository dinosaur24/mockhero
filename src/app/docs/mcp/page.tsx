import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const tools = [
  {
    name: "generate_test_data",
    description:
      "Generate realistic test data from a structured schema or plain English. Works with all 156 field types, 22 locales, and relational references.",
    example: '"Generate 50 users with German names and 200 orders linked to them"',
  },
  {
    name: "detect_schema",
    description:
      "Convert SQL CREATE TABLE statements or JSON samples into MockHero schema format. Paste your existing DDL and get a ready-to-use schema back.",
    example: null,
  },
  {
    name: "list_field_types",
    description: "List all 156 supported field types with descriptions and parameters.",
    example: null,
  },
  {
    name: "list_templates",
    description: "List pre-built schema templates — e-commerce, blog, SaaS, and social network.",
    example: null,
  },
  {
    name: "generate_from_template",
    description:
      "Generate data using a template with optional scale and locale overrides. No schema definition needed.",
    example: '"Use the ecommerce template at 2x scale with German locale"',
  },
]

export default function McpDocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <Badge variant="secondary" className="mb-4">MCP</Badge>
        <h1 className="text-3xl font-bold tracking-tight">MCP Server</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Use MockHero directly from your AI coding agent. Generate test data
          without leaving your editor — just describe what you need in plain English.
        </p>
      </div>

      {/* What is MCP */}
      <section>
        <h2 className="text-xl font-semibold mb-3">What is MCP?</h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          The Model Context Protocol (MCP) lets AI agents call external tools.
          When you install the MockHero MCP server, your AI agent gets direct
          access to test data generation — it can create schemas, generate data,
          and detect field types without you writing any API calls.
        </p>
      </section>

      {/* Supported agents */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Supported Agents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "Claude Desktop",
            "Claude Code",
            "Cursor",
            "Windsurf",
            "Cline",
            "Codex CLI",
            "VS Code Copilot",
            "Zed",
            "Continue",
          ].map((agent) => (
            <Card key={agent}>
              <CardContent className="pt-6">
                <p className="font-medium">{agent}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Any MCP-compatible agent will work. The setup is the same — point it
          at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@mockherodev/mcp-server</code> with
          your API key.
        </p>
      </section>

      {/* Install */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Installation</h2>
        <p className="text-muted-foreground mb-4">
          You need an API key from MockHero.{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up free
          </Link>{" "}
          and create one in your dashboard.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Claude Desktop</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/.claude/claude_desktop_config.json</code>:
            </p>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <code>{`{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["@mockherodev/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_live_your_key_here"
      }
    }
  }
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Claude Code</h3>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <code>claude mcp add mockhero -- env MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Cursor</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.cursor/mcp.json</code> in your project:
            </p>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <code>{`{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["@mockherodev/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_live_your_key_here"
      }
    }
  }
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Available Tools</h2>
        <p className="text-muted-foreground mb-4">
          Once installed, your AI agent can use these tools:
        </p>
        <div className="space-y-4">
          {tools.map((tool) => (
            <Card key={tool.name}>
              <CardContent className="pt-6">
                <code className="text-sm font-mono font-semibold text-primary">{tool.name}</code>
                <p className="text-sm text-muted-foreground mt-2">{tool.description}</p>
                {tool.example && (
                  <pre className="bg-muted rounded-md p-3 text-sm font-mono mt-3 text-muted-foreground">
                    {tool.example}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* npm */}
      <section>
        <h2 className="text-xl font-semibold mb-3">npm Package</h2>
        <p className="text-muted-foreground">
          The MCP server is published as{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@mockherodev/mcp-server</code>{" "}
          on npm. You can also run it directly:
        </p>
        <pre className="bg-muted rounded-lg p-4 text-sm font-mono mt-3 overflow-x-auto">
          <code>MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server</code>
        </pre>
      </section>
    </div>
  )
}
