# @mockherodev/mcp-server

MCP server for [MockHero](https://mockhero.dev) — generate realistic test data from Claude Desktop, Cursor, Windsurf, and other AI agents.

## Setup

### Claude Desktop

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["@mockherodev/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_live_your_key_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["@mockherodev/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_live_your_key_here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add mockhero -- env MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server
```

## Tools

### generate_test_data

Generate realistic test data from a structured schema or plain English description.

```
"Generate 50 users with German names and 200 orders linked to them"
```

### detect_schema

Convert SQL CREATE TABLE statements or JSON samples into MockHero's schema format.

### list_field_types

List all 135+ supported field types with descriptions and parameters.

### list_templates

List pre-built schema templates (e-commerce, blog, SaaS, social network).

### generate_from_template

Generate data using a template — no schema definition needed.

```
Use the ecommerce template at 2x scale with German locale
```

## Get your API key

Sign up free at [mockhero.dev](https://mockhero.dev)
