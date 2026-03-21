#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
var API_BASE = process.env.MOCKHERO_API_URL ?? "https://api.mockhero.dev";
var API_KEY = process.env.MOCKHERO_API_KEY ?? "";
async function apiCall(method, path, body) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "MockHero-MCP/0.1.0"
  };
  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : void 0
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
var server = new McpServer({
  name: "MockHero",
  version: "0.1.0"
});
server.tool(
  "generate_test_data",
  `Generate realistic test data for database tables.

Send either a structured schema (tables with fields) or a plain English description.
Supports relational data with foreign keys, locale-aware names and addresses,
22 locales, 157 field types, and multiple output formats (JSON, CSV, SQL).

The killer feature: define multiple tables with "ref" fields, and all foreign key
relationships are correct \u2014 orders reference real user IDs, reviews link to real
products. One call seeds your entire database.

Auto-locale: add a "country" field as an enum with country codes (DE, FR, US, etc.)
and names, emails, phones automatically match each row's nationality.`,
  {
    // Schema mode
    tables: z.array(
      z.object({
        name: z.string().describe("Table name"),
        count: z.number().describe("Number of records to generate"),
        fields: z.array(
          z.object({
            name: z.string().describe("Field/column name"),
            type: z.string().describe("Field type (uuid, first_name, email, ref, enum, etc.)"),
            params: z.record(z.string(), z.unknown()).optional().describe("Type-specific parameters"),
            nullable: z.boolean().optional().describe("If true, field can be null")
          })
        )
      })
    ).optional().describe("Structured schema \u2014 array of table definitions"),
    // Prompt mode
    prompt: z.string().optional().describe(
      'Plain English description (e.g. "50 users with German names and 200 orders linked to them")'
    ),
    // Options
    format: z.enum(["json", "csv", "sql"]).optional().default("json").describe("Output format"),
    sql_dialect: z.enum(["postgres", "mysql", "sqlite"]).optional().describe("SQL dialect (only when format=sql)"),
    locale: z.string().optional().describe("Default locale (en, de, fr, es, ja, etc.). Auto-detected from country field if present."),
    seed: z.number().optional().describe("Seed for reproducible output. Same seed + same schema = identical data.")
  },
  async (params) => {
    if (!params.tables && !params.prompt) {
      return {
        content: [
          {
            type: "text",
            text: "Error: provide either 'tables' (structured schema) or 'prompt' (plain English description)."
          }
        ]
      };
    }
    const body = {};
    if (params.tables) body.tables = params.tables;
    if (params.prompt) body.prompt = params.prompt;
    if (params.format) body.format = params.format;
    if (params.sql_dialect) body.sql_dialect = params.sql_dialect;
    if (params.locale) body.locale = params.locale;
    if (params.seed !== void 0) body.seed = params.seed;
    const res = await apiCall("POST", "/api/v1/generate", body);
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `API error (${res.status}): ${JSON.stringify(res.data, null, 2)}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }
      ]
    };
  }
);
server.tool(
  "detect_schema",
  `Convert an existing database schema or JSON sample into MockHero's schema format.

Send a SQL CREATE TABLE statement and get back the structured schema ready to use
with generate_test_data. Or send a sample JSON record and MockHero will infer
the field types.

This is useful when you have migration files or an existing database and want to
generate test data that matches your schema without manually writing the definition.`,
  {
    sql: z.string().optional().describe("SQL CREATE TABLE statement(s) to convert"),
    sample_json: z.record(z.string(), z.unknown()).optional().describe("Example JSON record to infer schema from")
  },
  async (params) => {
    if (!params.sql && !params.sample_json) {
      return {
        content: [
          {
            type: "text",
            text: "Error: provide either 'sql' (CREATE TABLE statements) or 'sample_json' (example record)."
          }
        ]
      };
    }
    const res = await apiCall("POST", "/api/v1/schema/detect", params);
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `API error (${res.status}): ${JSON.stringify(res.data, null, 2)}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }
      ]
    };
  }
);
server.tool(
  "list_field_types",
  `List all 157 available field types for test data generation.

Returns every supported type organized by category (Identity, Location, Financial,
Temporal, Technical, Content, Logic, Social, HR, Ecommerce, Security, AI/ML,
Healthcare, Edge Cases, Special) with descriptions, parameters, and examples.

Use this to discover what types are available before building a schema.`,
  {},
  async () => {
    const res = await apiCall("GET", "/api/v1/types");
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `API error (${res.status}): ${JSON.stringify(res.data, null, 2)}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }
      ]
    };
  }
);
server.tool(
  "list_templates",
  `List pre-built schema templates for common application patterns.

Available templates:
- ecommerce: Customers, products, orders, order items, reviews (5 tables)
- blog: Authors, posts, comments, tags, post_tags (5 tables)
- saas: Organizations, members, subscriptions, invoices (4 tables)
- social: Users, posts, likes, follows, messages (5 tables)

Each template includes realistic field types, proper foreign key relationships,
weighted enum distributions, and auto-locale detection via country fields.`,
  {},
  async () => {
    const res = await apiCall("GET", "/api/v1/templates");
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `API error (${res.status}): ${JSON.stringify(res.data, null, 2)}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }
      ]
    };
  }
);
server.tool(
  "generate_from_template",
  `Generate test data using a pre-built schema template.

Pick a template (ecommerce, blog, saas, social) and optionally adjust the scale,
locale, format, and seed. The template handles all the table definitions,
field types, and foreign key relationships for you.

Scale multiplier: 1.0 = default counts, 2.0 = double, 0.5 = half.
Example: ecommerce template at scale 2.0 generates 100 users, 200 products, etc.`,
  {
    template: z.enum(["ecommerce", "blog", "saas", "social"]).describe("Template name"),
    scale: z.number().optional().default(1).describe("Scale multiplier for record counts (default 1.0)"),
    locale: z.string().optional().describe("Default locale (en, de, fr, es, etc.)"),
    format: z.enum(["json", "csv", "sql"]).optional().default("json").describe("Output format"),
    sql_dialect: z.enum(["postgres", "mysql", "sqlite"]).optional().describe("SQL dialect (only when format=sql)"),
    seed: z.number().optional().describe("Seed for reproducible output")
  },
  async (params) => {
    const body = {
      template: params.template,
      scale: params.scale
    };
    if (params.locale) body.locale = params.locale;
    if (params.format) body.format = params.format;
    if (params.sql_dialect) body.sql_dialect = params.sql_dialect;
    if (params.seed !== void 0) body.seed = params.seed;
    const res = await apiCall("POST", "/api/v1/generate", body);
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `API error (${res.status}): ${JSON.stringify(res.data, null, 2)}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }
      ]
    };
  }
);
async function main() {
  if (!API_KEY) {
    console.error(
      "Warning: MOCKHERO_API_KEY not set. Requests will fail with 401.\nSet it via: MOCKHERO_API_KEY=mh_live_xxx npx @mockherodev/mcp-server\nGet your key at https://mockhero.dev"
    );
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
