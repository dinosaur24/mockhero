import { generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generateFromTemplate } from "@/lib/engine/templates";
import { recordMcpTelemetry } from "@/lib/mcp/telemetry";
import {
  SUPPORTED_FORMATS,
  SUPPORTED_LOCALES,
  SUPPORTED_SQL_DIALECTS,
  type GenerateRequest,
  type Locale,
  type OutputFormat,
  type SqlDialect,
} from "@/lib/engine/types";

const MOCKHERO_VERSION = "0.1.0";
const LATEST_PROTOCOL_VERSION = "2025-11-25";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
]);

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
};

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: true;
};

type ToolContext = {
  request: Request;
  apiKey: string | null;
  surface: McpSurface;
};

type McpSurface = "chatgpt" | "agent";

type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
};

type ToolDefinition = ToolDescriptor & {
  run: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
};

const textSchema = { type: "string" } as const;
const numberSchema = { type: "number" } as const;
const integerSchema = { type: "integer", minimum: 1 } as const;
const booleanSchema = { type: "boolean" } as const;
const jsonObjectSchema = { type: "object", additionalProperties: true } as const;
const apiKeySchema = {
  type: "string",
  description:
    "Optional MockHero API key for no-auth MCP clients. Prefer the Authorization header when the client supports it.",
} as const;

const fieldSchema = {
  type: "object",
  required: ["name", "type"],
  properties: {
    name: textSchema,
    type: textSchema,
    params: jsonObjectSchema,
    nullable: booleanSchema,
  },
  additionalProperties: false,
};

const tableSchema = {
  type: "object",
  required: ["name", "count", "fields"],
  properties: {
    name: textSchema,
    count: integerSchema,
    fields: { type: "array", items: fieldSchema, minItems: 1 },
  },
  additionalProperties: false,
};

const generationSchema = {
  type: "object",
  properties: {
    tables: { type: "array", items: tableSchema, minItems: 1 },
    prompt: {
      type: "string",
      description: "Plain-English data request. Example: 50 users and 200 orders linked to them.",
    },
    format: { type: "string", enum: ["json", "csv", "sql"], default: "json" },
    sql_dialect: { type: "string", enum: ["postgres", "mysql", "sqlite"] },
    locale: { type: "string", description: "Default locale such as en, de, fr, es, or ja." },
    seed: { type: "number", description: "Seed for reproducible output." },
  },
  anyOf: [{ required: ["tables"] }, { required: ["prompt"] }],
  additionalProperties: false,
};

const estimateSchema = {
  type: "object",
  properties: {
    ...generationSchema.properties,
    template: { type: "string", enum: ["ecommerce", "blog", "saas", "social"] },
    scale: {
      type: "number",
      description: "Multiplier for template record counts.",
    },
    estimated_records: {
      type: "integer",
      minimum: 1,
      description: "Required for prompt estimates because this tool does not run prompt-to-schema conversion.",
    },
    daily_used_before: {
      type: "integer",
      minimum: 0,
      description: "Optional assumption when no API key is supplied.",
    },
  },
  anyOf: [
    { required: ["tables"] },
    { required: ["template"] },
    { required: ["prompt", "estimated_records"] },
  ],
  additionalProperties: false,
};

const agentGenerationSchema = {
  ...generationSchema,
  properties: {
    ...generationSchema.properties,
    api_key: apiKeySchema,
  },
};

const agentEstimateSchema = {
  ...estimateSchema,
  properties: {
    ...estimateSchema.properties,
    api_key: apiKeySchema,
  },
};

const genericObjectOutput = {
  type: "object",
  additionalProperties: true,
};

const ANONYMOUS_MCP_RECORD_LIMIT = 100;

function originFromRequest(request: Request): string {
  const configured =
    process.env.MOCKHERO_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.MOCKHERO_API_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return url.origin;
}

function extractApiKey(request: Request): string | null {
  const explicit = request.headers.get("x-api-key") ?? request.headers.get("x-mockhero-api-key");
  if (explicit) return explicit.trim();

  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

async function recordMcpEvent(params: {
  request: Request;
  surface: McpSurface;
  method: string;
  toolName?: string;
  apiKey: string | null;
  success: boolean;
  isErrorResult?: boolean;
  errorCode?: string;
}) {
  await recordMcpTelemetry({
    request: params.request,
    surface: params.surface,
    method: params.method,
    toolName: params.toolName,
    hasApiKey: Boolean(params.apiKey),
    success: params.success,
    isErrorResult: params.isErrorResult,
    errorCode: params.errorCode,
  });
}

function apiKeyFromArgs(args: Record<string, unknown>): string | null {
  return typeof args.api_key === "string" && args.api_key.trim() ? args.api_key.trim() : null;
}

function effectiveApiKey(context: ToolContext, args: Record<string, unknown>): string | null {
  return context.apiKey ?? (context.surface === "agent" ? apiKeyFromArgs(args) : null);
}

function withoutMcpOnlyArgs(args: Record<string, unknown>): Record<string, unknown> {
  if (!("api_key" in args)) return args;

  const rest = { ...args };
  delete rest.api_key;
  return rest;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

function structuredContent(data: unknown): Record<string, unknown> {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }

  return { data };
}

function textResult(data: unknown): ToolResult {
  return {
    structuredContent: structuredContent(data),
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorToolResult(message: string, data?: unknown): ToolResult {
  return {
    isError: true,
    structuredContent: {
      ok: false,
      error: message,
      ...(data === undefined ? {} : { details: data }),
    },
    content: [{ type: "text", text: message }],
  };
}

function totalRecords(request: GenerateRequest): number {
  return request.tables.reduce((sum, table) => sum + table.count, 0);
}

function anonymousLimitError(records: number, surface: McpSurface): ToolResult | null {
  if (records <= ANONYMOUS_MCP_RECORD_LIMIT) return null;

  if (surface === "agent") {
    return errorToolResult(
      `Free MCP generation is limited to ${ANONYMOUS_MCP_RECORD_LIMIT} records per request. Use create_agent_checkout or configure a MockHero API key for larger generations.`,
      {
        requested_records: records,
        free_record_limit: ANONYMOUS_MCP_RECORD_LIMIT,
        checkout_tool: "create_agent_checkout",
      }
    );
  }

  return errorToolResult(
    `Free MCP generation is limited to ${ANONYMOUS_MCP_RECORD_LIMIT} records per request. Configure a MockHero API key for larger generations.`,
    { requested_records: records, free_record_limit: ANONYMOUS_MCP_RECORD_LIMIT }
  );
}

function supportedLocale(value: unknown): Locale | undefined {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
    ? (value as Locale)
    : undefined;
}

function supportedFormat(value: unknown): OutputFormat | undefined {
  return typeof value === "string" && SUPPORTED_FORMATS.includes(value as OutputFormat)
    ? (value as OutputFormat)
    : undefined;
}

function supportedSqlDialect(value: unknown): SqlDialect | undefined {
  return typeof value === "string" && SUPPORTED_SQL_DIALECTS.includes(value as SqlDialect)
    ? (value as SqlDialect)
    : undefined;
}

async function runEngineGeneration(request: GenerateRequest): Promise<ToolResult> {
  const generated = await generate(request);
  if (!generated.success) {
    if ("cycle" in generated) {
      return errorToolResult("Generation failed because the schema has a circular dependency.", {
        cycle: generated.cycle,
      });
    }

    return errorToolResult("Generation failed because the schema is invalid.", {
      errors: generated.errors,
    });
  }

  const formatted = formatOutput(
    generated.result,
    request.tables,
    request.format ?? "json",
    request.sql_dialect
  );

  return textResult(formatted.body);
}

async function runAnonymousSchemaGeneration(
  args: Record<string, unknown>,
  surface: McpSurface
): Promise<ToolResult> {
  if (typeof args.prompt === "string" && !args.tables) {
    if (surface === "agent") {
      return errorToolResult(
        "Free MCP generation supports explicit table schemas only. Use detect_schema first, then call generate_test_data with tables for a free preview. For plain-English prompt generation, use create_agent_checkout and claim_agent_api_key, then retry with an API key.",
        {
          suggested_next_tool: "detect_schema",
          checkout_tool: "create_agent_checkout",
          claim_tool: "claim_agent_api_key",
        }
      );
    }

    return errorToolResult(
      "Free MCP generation supports explicit table schemas only. Configure a MockHero API key for plain-English prompt generation."
    );
  }

  const parsed = parseSchema(args);
  if (!parsed.success) {
    return errorToolResult("Schema validation failed.", { errors: parsed.errors });
  }

  const limitError = anonymousLimitError(totalRecords(parsed.data), surface);
  if (limitError) return limitError;

  return runEngineGeneration(parsed.data);
}

async function runAnonymousTemplateGeneration(
  args: Record<string, unknown>,
  surface: McpSurface
): Promise<ToolResult> {
  if (typeof args.template !== "string") {
    return errorToolResult("template is required.");
  }

  let request: GenerateRequest;
  try {
    request = generateFromTemplate({
      template: args.template,
      scale: typeof args.scale === "number" ? args.scale : 0.05,
      locale: supportedLocale(args.locale),
      format: supportedFormat(args.format),
      sql_dialect: supportedSqlDialect(args.sql_dialect),
      seed: typeof args.seed === "number" ? args.seed : undefined,
    });
  } catch (err) {
    return errorToolResult(err instanceof Error ? err.message : "Unknown template error");
  }

  const limitError = anonymousLimitError(totalRecords(request), surface);
  if (limitError) return limitError;

  return runEngineGeneration(request);
}

async function callMockHeroApi(
  request: Request,
  path: string,
  options: {
    method: "GET" | "POST";
    body?: unknown;
    apiKey?: string | null;
  }
): Promise<ToolResult> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "MockHero-Remote-MCP/0.1.0",
  };

  if (options.method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  if (options.apiKey) {
    headers["x-api-key"] = options.apiKey;
  }

  const url = `${originFromRequest(request)}${path}`;
  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await readJson(response);

  if (!response.ok) {
    return {
      isError: true,
      structuredContent: {
        ok: false,
        status: response.status,
        error: data,
      },
      content: [
        {
          type: "text",
          text: `MockHero API error (${response.status}): ${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  return textResult(data);
}

const chatGptTools: ToolDefinition[] = [
  {
    name: "estimate_agent_usage",
    description:
      "Estimate MockHero agent-plan cost before generating data. No login or API key is required; authenticated MCP requests use actual daily usage when available.",
    inputSchema: estimateSchema,
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/agent/estimate", {
        method: "POST",
        body: args,
        apiKey: context.apiKey,
      }),
  },
  {
    name: "generate_test_data",
    description:
      "Generate realistic JSON, CSV, or SQL test data. Explicit table schemas up to 100 records can run free without login; plain-English prompt generation, larger requests, and authenticated usage require a MockHero API key configured by the MCP client.",
    inputSchema: generationSchema,
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async run(args, context) {
      const apiKey = context.apiKey;
      if (!apiKey) return runAnonymousSchemaGeneration(args, context.surface);

      return callMockHeroApi(context.request, "/api/v1/generate", {
        method: "POST",
        body: args,
        apiKey,
      });
    },
  },
  {
    name: "generate_from_template",
    description:
      "Generate realistic test data from a pre-built MockHero template: ecommerce, blog, saas, or social. Small template previews up to 100 records can run free without login; larger or authenticated usage requires a MockHero API key configured by the MCP client.",
    inputSchema: {
      type: "object",
      required: ["template"],
      properties: {
        template: { type: "string", enum: ["ecommerce", "blog", "saas", "social"] },
        scale: {
          type: "number",
          default: 0.05,
          description:
            "Multiplier for template record counts. Free MCP generation is capped at 100 records.",
        },
        locale: textSchema,
        format: { type: "string", enum: ["json", "csv", "sql"], default: "json" },
        sql_dialect: { type: "string", enum: ["postgres", "mysql", "sqlite"] },
        seed: numberSchema,
      },
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async run(args, context) {
      const apiKey = context.apiKey;
      if (!apiKey) return runAnonymousTemplateGeneration(args, context.surface);

      return callMockHeroApi(context.request, "/api/v1/generate", {
        method: "POST",
        body: args,
        apiKey,
      });
    },
  },
  {
    name: "detect_schema",
    description:
      "Convert SQL CREATE TABLE statements or one sample JSON object into a MockHero schema that can be passed to generate_test_data.",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "SQL CREATE TABLE statement or statements." },
        sample_json: {
          type: "object",
          additionalProperties: true,
          description: "Single example JSON object to infer fields from.",
        },
      },
      anyOf: [{ required: ["sql"] }, { required: ["sample_json"] }],
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/v1/schema/detect", {
        method: "POST",
        body: args,
      }),
  },
  {
    name: "list_field_types",
    description:
      "List MockHero field types, descriptions, parameters, and examples before building a schema.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (_args, context) =>
      callMockHeroApi(context.request, "/api/v1/types", {
        method: "GET",
      }),
  },
  {
    name: "list_templates",
    description:
      "List MockHero's pre-built schema templates for ecommerce, blog, SaaS, and social apps.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (_args, context) =>
      callMockHeroApi(context.request, "/api/v1/templates", {
        method: "GET",
      }),
  },
];

const agentTools: ToolDefinition[] = [
  {
    name: "estimate_agent_usage",
    description:
      "Estimate MockHero agent-plan cost before generating data. No login or API key is required; include an API key only when you want the estimate to use actual daily usage.",
    inputSchema: agentEstimateSchema,
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/agent/estimate", {
        method: "POST",
        body: withoutMcpOnlyArgs(args),
        apiKey: effectiveApiKey(context, args),
      }),
  },
  {
    name: "create_agent_checkout",
    description:
      "Create a loginless Polar Checkout URL for MockHero's metered agent plan. Polar is the Merchant of Record for checkout, tax collection, and remittance.",
    inputSchema: {
      type: "object",
      required: ["email"],
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "Billing email for the agent or the agent operator.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/agent/checkout", {
        method: "POST",
        body: args,
      }),
  },
  {
    name: "check_agent_checkout_status",
    description:
      "Poll a Polar checkout created by create_agent_checkout using the returned claim_token.",
    inputSchema: {
      type: "object",
      required: ["token"],
      properties: {
        token: {
          type: "string",
          description: "claim_token returned by create_agent_checkout.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/agent/checkout/status", {
        method: "POST",
        body: args,
      }),
  },
  {
    name: "claim_agent_api_key",
    description:
      "Claim the MockHero API key after Polar marks the loginless agent checkout as paid. The key is returned once.",
    inputSchema: {
      type: "object",
      required: ["token"],
      properties: {
        token: {
          type: "string",
          description: "claim_token returned by create_agent_checkout.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    run: (args, context) =>
      callMockHeroApi(context.request, "/api/agent/claim", {
        method: "POST",
        body: args,
      }),
  },
  {
    name: "generate_test_data",
    description:
      "Generate realistic JSON, CSV, or SQL test data from structured tables or a plain-English prompt. Explicit table schemas up to 100 records can run free as a proof-of-work preview; plain-English prompt generation, larger requests, and production usage require a MockHero API key.",
    inputSchema: agentGenerationSchema,
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async run(args, context) {
      const apiKey = effectiveApiKey(context, args);
      if (!apiKey) return runAnonymousSchemaGeneration(withoutMcpOnlyArgs(args), context.surface);

      return callMockHeroApi(context.request, "/api/v1/generate", {
        method: "POST",
        body: withoutMcpOnlyArgs(args),
        apiKey,
      });
    },
  },
  {
    name: "generate_from_template",
    description:
      "Generate realistic test data from a pre-built MockHero template: ecommerce, blog, saas, or social. Small template previews up to 100 records can run free; larger or production usage requires a MockHero API key.",
    inputSchema: {
      type: "object",
      required: ["template"],
      properties: {
        template: { type: "string", enum: ["ecommerce", "blog", "saas", "social"] },
        scale: { type: "number", default: 1 },
        locale: textSchema,
        format: { type: "string", enum: ["json", "csv", "sql"], default: "json" },
        sql_dialect: { type: "string", enum: ["postgres", "mysql", "sqlite"] },
        seed: numberSchema,
        api_key: apiKeySchema,
      },
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async run(args, context) {
      const apiKey = effectiveApiKey(context, args);
      if (!apiKey) {
        return runAnonymousTemplateGeneration(withoutMcpOnlyArgs(args), context.surface);
      }

      return callMockHeroApi(context.request, "/api/v1/generate", {
        method: "POST",
        body: withoutMcpOnlyArgs(args),
        apiKey,
      });
    },
  },
  ...chatGptTools.filter((tool) =>
    ["detect_schema", "list_field_types", "list_templates"].includes(tool.name)
  ),
];

function toolsForSurface(surface: McpSurface): ToolDefinition[] {
  return surface === "agent" ? agentTools : chatGptTools;
}

function publicToolDescriptor(tool: ToolDefinition): ToolDescriptor {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    ...(tool.outputSchema ? { outputSchema: tool.outputSchema } : {}),
    ...(tool.annotations ? { annotations: tool.annotations } : {}),
  };
}

function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: JsonRpcId, code: number, message: string, data?: unknown) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

function protocolVersion(params: unknown): string {
  if (
    params &&
    typeof params === "object" &&
    "protocolVersion" in params &&
    typeof params.protocolVersion === "string" &&
    SUPPORTED_PROTOCOL_VERSIONS.has(params.protocolVersion)
  ) {
    return params.protocolVersion;
  }

  return LATEST_PROTOCOL_VERSION;
}

function callParams(params: unknown): { name: string; args: Record<string, unknown> } | null {
  if (!params || typeof params !== "object") return null;
  const value = params as Record<string, unknown>;
  if (typeof value.name !== "string") return null;

  const args = value.arguments;
  if (args === undefined) return { name: value.name, args: {} };
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;

  return { name: value.name, args: args as Record<string, unknown> };
}

export function mcpToolNames(surface: McpSurface = "chatgpt"): string[] {
  return toolsForSurface(surface).map((tool) => tool.name);
}

export async function handleMcpMessage(
  request: Request,
  message: unknown,
  options: { surface?: McpSurface } = {}
) {
  const surface = options.surface ?? "chatgpt";
  const tools = toolsForSurface(surface);
  const toolByName = new Map(tools.map((tool) => [tool.name, tool]));

  if (Array.isArray(message)) {
    return jsonRpcError(null, -32600, "Invalid Request: batch JSON-RPC messages are not supported");
  }

  if (!message || typeof message !== "object") {
    return jsonRpcError(null, -32600, "Invalid Request");
  }

  const rpc = message as JsonRpcRequest;
  const id = rpc.id ?? null;

  if (rpc.jsonrpc !== "2.0") {
    return jsonRpcError(id, -32600, "Invalid Request: jsonrpc must be 2.0");
  }

  if (!rpc.method) {
    return null;
  }

  if (rpc.id === undefined) {
    return null;
  }

  if (rpc.method === "initialize") {
    await recordMcpEvent({
      request,
      surface,
      method: rpc.method,
      apiKey: extractApiKey(request),
      success: true,
    });

    return jsonRpcResult(id, {
      protocolVersion: protocolVersion(rpc.params),
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: {
        name: surface === "agent" ? "MockHero Agent MCP" : "MockHero",
        version: MOCKHERO_VERSION,
      },
      instructions:
        surface === "agent"
          ? "Use MockHero when an agent needs realistic mock data, fixtures, seed data, or relational synthetic records. Estimate cost before generating. If no MockHero API key is available, create a loginless Polar checkout, poll status, claim the API key after payment, then call generation tools with Authorization: Bearer mh_YOUR_API_KEY or the api_key tool argument."
          : "Use MockHero when the user needs realistic mock data, fixtures, seed data, or relational synthetic records. Estimate cost, inspect field types/templates, detect schemas, and generate small free previews directly. Larger, prompt-based, or paid generation requires a MockHero API key configured by the MCP client.",
    });
  }

  if (rpc.method === "ping") {
    return jsonRpcResult(id, {});
  }

  if (rpc.method === "tools/list") {
    await recordMcpEvent({
      request,
      surface,
      method: rpc.method,
      apiKey: extractApiKey(request),
      success: true,
    });

    return jsonRpcResult(id, {
      tools: tools.map(publicToolDescriptor),
    });
  }

  if (rpc.method === "tools/call") {
    const parsed = callParams(rpc.params);
    const apiKey = extractApiKey(request);
    if (!parsed) {
      await recordMcpEvent({
        request,
        surface,
        method: rpc.method,
        apiKey,
        success: false,
        errorCode: "INVALID_PARAMS",
      });
      return jsonRpcError(id, -32602, "Invalid params for tools/call");
    }

    const tool = toolByName.get(parsed.name);
    if (!tool) {
      await recordMcpEvent({
        request,
        surface,
        method: rpc.method,
        toolName: parsed.name,
        apiKey,
        success: false,
        errorCode: "UNKNOWN_TOOL",
      });
      return jsonRpcError(id, -32602, `Unknown tool: ${parsed.name}`);
    }

    const result = await tool.run(parsed.args, {
      request,
      apiKey,
      surface,
    });

    await recordMcpEvent({
      request,
      surface,
      method: rpc.method,
      toolName: parsed.name,
      apiKey: effectiveApiKey({ request, apiKey, surface }, parsed.args),
      success: !result.isError,
      isErrorResult: Boolean(result.isError),
      errorCode:
        result.structuredContent?.ok === false && typeof result.structuredContent.error === "string"
          ? result.structuredContent.error
          : undefined,
    });

    return jsonRpcResult(id, result);
  }

  await recordMcpEvent({
    request,
    surface,
    method: rpc.method,
    apiKey: extractApiKey(request),
    success: false,
    errorCode: "METHOD_NOT_FOUND",
  });

  return jsonRpcError(id, -32601, `Method not found: ${rpc.method}`);
}
