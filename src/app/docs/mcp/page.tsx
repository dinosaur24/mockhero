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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">MCP Server</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          Use MockHero directly from your AI coding agent. Generate test data
          without leaving your editor — just describe what you need in plain English.
        </p>
      </div>

      {/* What is MCP */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">What is MCP?</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Model Context Protocol (MCP) lets AI agents call external tools.
          When you install the MockHero MCP server, your AI agent gets direct
          access to test data generation — it can create schemas, generate data,
          and detect field types without you writing any API calls.
        </p>
      </section>

      {/* Supported agents */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Supported Agents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { name: "Claude Desktop", anchor: "claude-desktop" },
            { name: "Claude Code", anchor: "claude-code" },
            { name: "Cursor", anchor: "cursor" },
            { name: "Windsurf", anchor: "windsurf" },
            { name: "Cline", anchor: "cline" },
            { name: "Codex CLI", anchor: "codex-cli" },
            { name: "VS Code Copilot", anchor: "vs-code-copilot" },
            { name: "Zed", anchor: "zed" },
            { name: "Continue", anchor: "continue" },
          ].map((agent) => (
            <a
              key={agent.name}
              href={`#${agent.anchor}`}
              className="group rounded-lg border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {agent.name}
            </a>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-3">
          Any MCP-compatible agent will work. The setup is the same — point it
          at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@mockherodev/mcp-server</code> with
          your API key.
        </p>
      </section>

      {/* Install */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Installation</h2>
        <p className="text-muted-foreground mb-4">
          You need an API key from MockHero.{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up free
          </Link>{" "}
          and create one in your dashboard.
        </p>

        <div className="space-y-6">
          <div id="claude-desktop" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Claude Desktop</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/.claude/claude_desktop_config.json</code>:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
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

          <div id="claude-code" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Claude Code</h3>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>claude mcp add mockhero -- env MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server</code>
            </pre>
          </div>

          <div id="cursor" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Cursor</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.cursor/mcp.json</code> in your project:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
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

          <div id="windsurf" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Windsurf</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/.codeium/windsurf/mcp_config.json</code>:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
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

          <div id="cline" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Cline</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Open the Cline MCP settings in VS Code and add a server with this config:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
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

          <div id="codex-cli" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Codex CLI</h3>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server</code>
            </pre>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Pass the MCP server as a tool provider when launching Codex.
            </p>
          </div>

          <div id="vs-code-copilot" className="scroll-mt-20">
            <h3 className="font-medium mb-2">VS Code Copilot</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.vscode/mcp.json</code> in your project:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>{`{
  "servers": {
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

          <div id="zed" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Zed</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to your Zed <code className="text-xs bg-muted px-1.5 py-0.5 rounded">settings.json</code> under <code className="text-xs bg-muted px-1.5 py-0.5 rounded">context_servers</code>:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>{`{
  "context_servers": {
    "mockhero": {
      "command": {
        "path": "npx",
        "args": ["@mockherodev/mcp-server"],
        "env": {
          "MOCKHERO_API_KEY": "mh_live_your_key_here"
        }
      }
    }
  }
}`}</code>
            </pre>
          </div>

          <div id="continue" className="scroll-mt-20">
            <h3 className="font-medium mb-2">Continue</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Add to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/.continue/config.yaml</code>:
            </p>
            <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>{`mcpServers:
  - name: mockhero
    command: npx
    args:
      - "@mockherodev/mcp-server"
    env:
      MOCKHERO_API_KEY: mh_live_your_key_here`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Available Tools</h2>
        <p className="text-muted-foreground mb-4">
          Once installed, your AI agent can use these tools:
        </p>
        <div className="space-y-3 sm:space-y-4">
          {tools.map((tool) => (
            <Card key={tool.name}>
              <CardContent className="pt-4 sm:pt-6">
                <code className="text-xs sm:text-sm font-mono font-semibold text-primary break-all">{tool.name}</code>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{tool.description}</p>
                {tool.example && (
                  <pre className="bg-muted rounded-md p-2.5 sm:p-3 text-xs sm:text-sm font-mono mt-3 text-muted-foreground overflow-x-auto">
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
        <h2 className="text-lg sm:text-xl font-semibold mb-3">npm Package</h2>
        <p className="text-muted-foreground">
          The MCP server is published as{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@mockherodev/mcp-server</code>{" "}
          on npm. You can also run it directly:
        </p>
        <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono mt-3 overflow-x-auto">
          <code>MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server</code>
        </pre>
      </section>
    </div>
  )
}
