import {
  generate,
  generateFromRaw,
  parseSchema,
  detectFromSql,
  detectFromJson,
  listTemplates,
  generateFromTemplate,
  formatOutput,
  FIELD_TYPE_CATALOG,
} from "@engine";
import type { GenerateRequest } from "@engine";

// ── Types ───────────────────────────────────────────────

interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ── Tool Definitions ────────────────────────────────────

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "generate_test_data",
    description:
      "Generate realistic test data for database tables. Supports 135+ field types, 20 locales, relational data with foreign keys, and multiple output formats (JSON, CSV, SQL).",
    inputSchema: {
      type: "object",
      properties: {
        tables: {
          type: "array",
          description:
            "Array of table definitions. Each table has: name (string), count (number), fields (array of {name, type, params?, nullable?}). Field types include: first_name, last_name, email, uuid, integer, boolean, datetime, price, enum, ref, and 125+ more.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Table name" },
              count: {
                type: "number",
                description: "Number of rows to generate",
              },
              fields: {
                type: "array",
                description: "Array of field definitions",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Column name" },
                    type: {
                      type: "string",
                      description:
                        "Field type (e.g. first_name, email, uuid, integer, enum, ref)",
                    },
                    params: {
                      type: "object",
                      description:
                        "Optional type-specific parameters (e.g. {min: 0, max: 100} for integer, {values: ['a','b']} for enum, {table: 'users', field: 'id'} for ref)",
                    },
                    nullable: {
                      type: "boolean",
                      description:
                        "If true, ~15% of values will be null (configurable via params.null_rate)",
                    },
                  },
                  required: ["name", "type"],
                },
              },
            },
            required: ["name", "count", "fields"],
          },
        },
        locale: {
          type: "string",
          description:
            "Locale for generated data (en, de, fr, es, ru, zh, ar, it, ja, hi, pt, and more). Default: en",
        },
        format: {
          type: "string",
          enum: ["json", "csv", "sql"],
          description: "Output format. Default: json",
        },
        sql_dialect: {
          type: "string",
          enum: ["postgres", "mysql", "sqlite"],
          description:
            "SQL dialect when format is 'sql'. Default: postgres",
        },
        seed: {
          type: "number",
          description:
            "PRNG seed for reproducible output. Same seed = same data every time.",
        },
      },
      required: ["tables"],
    },
  },
  {
    name: "detect_schema",
    description:
      "Convert a SQL CREATE TABLE statement or JSON sample into MockHero's schema format. Use this to quickly generate test data for an existing database.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description:
            "One or more SQL CREATE TABLE statements to convert into MockHero schema format.",
        },
        sample_json: {
          type: "object",
          description:
            "A sample JSON object (or array of objects) to infer a schema from. The keys become field names, and values are used to detect types.",
        },
      },
    },
  },
  {
    name: "list_field_types",
    description:
      "List all 135+ available field types for test data generation, organized by category. Each type includes a description and supported parameters.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Optional filter by category (identity, location, business, temporal, technical, content, logic, etc.)",
        },
      },
    },
  },
  {
    name: "list_templates",
    description:
      "List pre-built schema templates for common database patterns: e-commerce, blog, SaaS, and social network.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "generate_from_template",
    description:
      "Generate test data using a pre-built template. Available templates: ecommerce, blog, saas, social. Use 'scale' to multiply record counts.",
    inputSchema: {
      type: "object",
      properties: {
        template: {
          type: "string",
          description:
            "Template ID: ecommerce, blog, saas, or social",
        },
        locale: {
          type: "string",
          description: "Locale for generated data. Default: en",
        },
        scale: {
          type: "number",
          description:
            "Multiplier for all table record counts. E.g. scale=10 generates 10x the default rows.",
        },
        format: {
          type: "string",
          enum: ["json", "csv", "sql"],
          description: "Output format. Default: json",
        },
        seed: {
          type: "number",
          description: "PRNG seed for reproducible output.",
        },
      },
      required: ["template"],
    },
  },
];

// ── Helpers ─────────────────────────────────────────────

function ok(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function err(message: string): ToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

// ── Handlers ────────────────────────────────────────────

async function handleGenerateTestData(
  args: Record<string, unknown>
): Promise<ToolResult> {
  // Parse and validate the schema
  const parsed = parseSchema(args);
  if (!parsed.success) {
    return err(
      `Schema validation failed:\n${parsed.errors
        .map((e) => `  - ${e.field}: ${e.message}`)
        .join("\n")}`
    );
  }

  // Generate data
  const result = await generate(parsed.data);
  if (!result.success) {
    if ("errors" in result) {
      return err(
        `Generation failed:\n${result.errors
          .map((e) => `  - ${e.field}: ${e.message}`)
          .join("\n")}`
      );
    }
    return err(`Generation failed: circular dependency between tables: ${result.cycle.join(" -> ")}`);
  }

  // Optionally format output
  const format = args.format as string | undefined;
  if (format && format !== "json") {
    const sqlDialect = args.sql_dialect as string | undefined;
    const formatted = formatOutput(
      result.result,
      parsed.data.tables,
      format as "csv" | "sql",
      sqlDialect as "postgres" | "mysql" | "sqlite" | undefined
    );
    return ok(formatted.body);
  }

  return ok({ data: result.result.data, meta: result.result.meta });
}

async function handleDetectSchema(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const { sql, sample_json } = args;

  if (!sql && !sample_json) {
    return err(
      "Either 'sql' (SQL CREATE TABLE statements) or 'sample_json' (JSON sample data) is required."
    );
  }

  if (sql && typeof sql === "string") {
    const schema = detectFromSql(sql);
    if (schema.tables.length === 0) {
      return err(
        "Could not detect any tables from the provided SQL. Make sure it contains valid CREATE TABLE statements."
      );
    }
    return ok(schema);
  }

  if (sample_json) {
    const schema = detectFromJson(sample_json);
    return ok(schema);
  }

  return err("Invalid input. Provide 'sql' as a string or 'sample_json' as an object.");
}

function handleListFieldTypes(
  args: Record<string, unknown>
): ToolResult {
  const category = args.category as string | undefined;

  if (category) {
    const catalog = FIELD_TYPE_CATALOG as Record<string, unknown>;
    const match = catalog[category];
    if (!match) {
      const available = Object.keys(FIELD_TYPE_CATALOG).join(", ");
      return err(
        `Unknown category "${category}". Available categories: ${available}`
      );
    }
    return ok({ [category]: match });
  }

  return ok(FIELD_TYPE_CATALOG);
}

function handleListTemplates(): ToolResult {
  return ok(listTemplates());
}

async function handleGenerateFromTemplate(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const { template, locale, scale, format, seed } = args as {
    template: string;
    locale?: string;
    scale?: number;
    format?: string;
    seed?: number;
  };

  if (!template) {
    return err("'template' is required. Available templates: ecommerce, blog, saas, social");
  }

  let request: GenerateRequest;
  try {
    request = generateFromTemplate({
      template,
      locale: locale as GenerateRequest["locale"],
      scale,
      format: format as GenerateRequest["format"],
      seed,
    });
  } catch (e) {
    return err(`Template error: ${e instanceof Error ? e.message : String(e)}`);
  }

  const result = await generate(request);
  if (!result.success) {
    if ("errors" in result) {
      return err(
        `Generation failed:\n${result.errors
          .map((e) => `  - ${e.field}: ${e.message}`)
          .join("\n")}`
      );
    }
    return err(`Generation failed: circular dependency between tables: ${result.cycle.join(" -> ")}`);
  }

  // Optionally format output
  if (format && format !== "json") {
    const sqlDialect = args.sql_dialect as string | undefined;
    const formatted = formatOutput(
      result.result,
      request.tables,
      format as "csv" | "sql",
      sqlDialect as "postgres" | "mysql" | "sqlite" | undefined
    );
    return ok(formatted.body);
  }

  return ok({ data: result.result.data, meta: result.result.meta });
}

// ── Router ──────────────────────────────────────────────

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "generate_test_data":
      return handleGenerateTestData(args);
    case "detect_schema":
      return handleDetectSchema(args);
    case "list_field_types":
      return handleListFieldTypes(args);
    case "list_templates":
      return handleListTemplates();
    case "generate_from_template":
      return handleGenerateFromTemplate(args);
    default:
      return err(`Unknown tool: ${name}`);
  }
}
