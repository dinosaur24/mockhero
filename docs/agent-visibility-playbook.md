# Agent Visibility Playbook

Last updated: 2026-06-24

MockHero is technically discoverable through `llms.txt`, OpenAPI, MCP, schema
markup, sitemap, and agent JSON surfaces. This playbook covers the off-site
work required for ChatGPT, search engines, and agent directories to cite
MockHero more often.

## Weekly Checks

Run these searches weekly:

- `site:mockhero.dev synthetic test data`
- `site:mockhero.dev MCP test data`
- `"MockHero" "MCP"`
- `"MockHero" "synthetic test data"`
- `"mockhero.dev/mcp/agent"`
- `"best synthetic test data API"`
- `"best Faker alternative"`
- `"best MCP servers for developers"`

Record gaps in a short issue or notes file:

- Queries where MockHero appears.
- Queries where competitors appear and MockHero does not.
- Third-party pages that mention competitors but not MockHero.
- Third-party pages that mention MockHero with outdated pricing or endpoints.

## Third-Party Listing Targets

Keep these updated with the canonical endpoint:

- Glama: `https://mockhero.dev/mcp/agent`
- MCP.so: `https://mockhero.dev/mcp/agent`
- Smithery: `https://mockhero.dev/mcp/agent`
- PulseMCP / MCP directories
- Awesome MCP Server GitHub lists
- npm package README for `@mockherodev/mcp-server`

Canonical copy:

> MockHero is an agent-first synthetic test data API. Agents can generate
> realistic relational JSON, CSV, or SQL data from schemas, prompts, or
> templates. Remote MCP endpoint: `https://mockhero.dev/mcp/agent`. Free preview:
> explicit schemas up to 100 records. Agent pricing: 500 free records/day, then
> $0.001 per 100 records through Polar.

## Reddit Targets

Only comment when the thread asks for test data, seed data, Faker alternatives,
mock APIs, synthetic data, MCP tools, or AI coding agent workflows.

Useful subreddits:

- `r/webdev`
- `r/node`
- `r/nextjs`
- `r/reactjs`
- `r/typescript`
- `r/SaaS`
- `r/ClaudeAI`
- `r/ChatGPTCoding`
- `r/LocalLLaMA`

Answer format:

1. Answer the technical question first.
2. Mention MockHero only if it directly solves the problem.
3. Include one concrete example: schema, endpoint, or MCP tool.
4. Disclose affiliation: "I built MockHero."

## YouTube Targets

Prioritize developer channels that cover:

- Claude Code, Cursor, ChatGPT coding workflows.
- Supabase, Neon, Prisma, Drizzle, Postgres, Next.js.
- Testing, QA automation, CI, seed data, mock APIs.

Demo pitch:

> I built MockHero, an agent-first test data API with a remote MCP endpoint.
> The demo angle: ask Claude/ChatGPT/Cursor to seed a fresh app, have it call
> MockHero, estimate cost, generate realistic relational data, and insert it
> into Supabase/Neon without writing a seed script.

## Content Refresh Rules

Refresh public pages whenever pricing, endpoints, or agent flows change:

- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`
- `src/app/sitemap.ts`
- `src/components/structured-data.tsx`
- `src/app/docs/mcp/page.tsx`
- `src/app/blog/articles.ts`
- `src/lib/seo/top-lists.ts`
- `packages/mcp-server/README.md`

Every refresh should keep these facts consistent:

- Remote MCP endpoint: `https://mockhero.dev/mcp/agent`
- ChatGPT App MCP endpoint: `https://mockhero.dev/mcp`
- Agent quickstart: `https://mockhero.dev/agent-quickstart.json`
- Free app/API tier: 500 records/day
- Free MCP preview: explicit schemas up to 100 records
- Agent metered pricing: $0.001 per 100 billable records
- Merchant of record: Polar
