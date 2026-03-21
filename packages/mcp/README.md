# @mockhero/mcp

MCP server for MockHero — generate realistic synthetic test data directly from Claude Desktop, Cursor, or any MCP-compatible AI agent. Supports 135+ field types, 20 locales, relational foreign keys, and JSON/CSV/SQL output formats, all powered by a deterministic TypeScript engine with no external API calls.

## Installation

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `generate_test_data` | Generate realistic test data for one or more database tables with full control over field types, row counts, locale, and output format. |
| `detect_schema` | Convert SQL CREATE TABLE statements or sample JSON into MockHero schema format for instant data generation. |
| `list_field_types` | Browse all 135+ field types organized by category (identity, location, business, temporal, technical, content, logic, and more). |
| `list_templates` | List pre-built schema templates for common database patterns. |
| `generate_from_template` | Generate test data from a template (ecommerce, blog, saas, social) with optional locale, scale multiplier, and output format. |

## Example Prompts

- "Generate 50 users and 200 orders with German names"
- "Create test data for an e-commerce app"
- "What field types are available for addresses?"
- "Show me the available templates"
- "Generate a SaaS database with 10x the default size"

## Development

```bash
npm install
npm run build    # one-time build
npm run dev      # watch mode
```

## License

MIT
