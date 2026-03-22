# MockHero

Synthetic test data API. Generate realistic, relational data for any database schema.

## What it does

- **156 field types** across 15+ categories (identity, location, financial, temporal, and more)
- **Relational data** — foreign keys just work. Orders reference real user IDs, reviews link to real products. One API call seeds your entire database.
- **3 input modes** — structured schema, plain English prompt, or pre-built templates
- **Auto-locale** — add a `country` enum field and names, emails, phones match each row's nationality. 22 locales supported.
- **JSON, CSV, SQL output** — Postgres, MySQL, SQLite dialects
- **Deterministic seeds** — same seed + same schema = identical data every time
- **MCP server** — use from Claude Desktop, Cursor, Windsurf, or any AI agent

## Quick start

```bash
curl -X POST https://mockhero.dev/api/v1/generate \
  -H "Authorization: Bearer mh_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tables": [
      {
        "name": "users",
        "count": 50,
        "fields": [
          { "name": "id", "type": "uuid" },
          { "name": "name", "type": "full_name" },
          { "name": "email", "type": "email" },
          { "name": "country", "type": "enum", "params": { "values": ["US", "DE", "FR", "JP"] } },
          { "name": "created_at", "type": "datetime" }
        ]
      },
      {
        "name": "orders",
        "count": 200,
        "fields": [
          { "name": "id", "type": "uuid" },
          { "name": "user_id", "type": "ref", "params": { "table": "users", "field": "id" } },
          { "name": "total", "type": "price" },
          { "name": "status", "type": "enum", "params": { "values": ["pending", "shipped", "delivered"] } }
        ]
      }
    ]
  }'
```

Or use plain English:

```bash
curl -X POST https://mockhero.dev/api/v1/generate \
  -H "Authorization: Bearer mh_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "50 users with German names and 200 orders linked to them" }'
```

## Templates

Pre-built schemas for common patterns — no schema definition needed:

```bash
curl -X POST https://mockhero.dev/api/v1/generate \
  -H "Authorization: Bearer mh_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "template": "ecommerce", "scale": 2, "locale": "de" }'
```

Available: `ecommerce`, `blog`, `saas`, `social`

## MCP server

Use MockHero from AI agents via the Model Context Protocol:

```bash
npm install -g @mockherodev/mcp-server
```

See [@mockherodev/mcp-server](./packages/mcp-server) for setup instructions.

## Pricing

| | Free | Pro | Scale |
|---|---|---|---|
| Daily records | 1,000 | 50,000 | 500,000 |
| Requests/min | 10 | 60 | 200 |
| Price | $0 | $19/mo | $59/mo |

## Tech stack

- Next.js 15 (App Router)
- Supabase (Postgres)
- Clerk (Auth)
- Polar (Billing)
- Tailwind v4

## License

MIT
