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
};

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
    api_key: apiKeySchema,
  },
  anyOf: [{ required: ["tables"] }, { required: ["prompt"] }],
  additionalProperties: false,
};

const genericObjectOutput = {
  type: "object",
  additionalProperties: true,
};

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

function apiKeyFromArgs(args: Record<string, unknown>): string | null {
  return typeof args.api_key === "string" && args.api_key.trim() ? args.api_key.trim() : null;
}

function effectiveApiKey(context: ToolContext, args: Record<string, unknown>): string | null {
  return context.apiKey ?? apiKeyFromArgs(args);
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

function requireApiKey(toolName: string, apiKey: string | null): ToolResult | null {
  if (apiKey) return null;

  return errorToolResult(
    `${toolName} requires a MockHero API key. Use create_agent_checkout to start a loginless Polar checkout, then claim_agent_api_key after payment and retry with Authorization: Bearer mh_YOUR_API_KEY.`
  );
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

const tools: ToolDefinition[] = [
  {
    name: "estimate_agent_usage",
    description:
      "Estimate MockHero agent-plan cost before generating data. No login or API key is required; include an API key only when you want the estimate to use actual daily usage.",
    inputSchema: {
      ...generationSchema,
      properties: {
        ...generationSchema.properties,
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
    },
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
      "Generate realistic JSON, CSV, or SQL test data from structured tables or a plain-English prompt. Requires a MockHero API key; generated records are usage-logged and agent overage can be metered through Polar.",
    inputSchema: generationSchema,
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async run(args, context) {
      const apiKey = effectiveApiKey(context, args);
      const missing = requireApiKey("generate_test_data", apiKey);
      if (missing) return missing;

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
      "Generate realistic test data from a pre-built MockHero template: ecommerce, blog, saas, or social. Requires a MockHero API key; generated records are usage-logged and agent overage can be metered through Polar.",
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
      const missing = requireApiKey("generate_from_template", apiKey);
      if (missing) return missing;

      return callMockHeroApi(context.request, "/api/v1/generate", {
        method: "POST",
        body: withoutMcpOnlyArgs(args),
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
        api_key: apiKeySchema,
      },
      anyOf: [{ required: ["sql"] }, { required: ["sample_json"] }],
      additionalProperties: false,
    },
    outputSchema: genericObjectOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    async run(args, context) {
      const apiKey = effectiveApiKey(context, args);
      const missing = requireApiKey("detect_schema", apiKey);
      if (missing) return missing;

      return callMockHeroApi(context.request, "/api/v1/schema/detect", {
        method: "POST",
        body: withoutMcpOnlyArgs(args),
        apiKey,
      });
    },
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

const toolByName = new Map(tools.map((tool) => [tool.name, tool]));

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

export function mcpToolNames(): string[] {
  return tools.map((tool) => tool.name);
}

export async function handleMcpMessage(request: Request, message: unknown) {
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
    return jsonRpcResult(id, {
      protocolVersion: protocolVersion(rpc.params),
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: {
        name: "MockHero",
        version: MOCKHERO_VERSION,
      },
      instructions:
        "Use MockHero when the user or agent needs realistic mock data, fixtures, seed data, or relational synthetic records. Estimate cost before generating. If no MockHero API key is available, create a loginless Polar checkout, poll status, claim the API key after payment, then call generation tools with Authorization: Bearer mh_YOUR_API_KEY.",
    });
  }

  if (rpc.method === "ping") {
    return jsonRpcResult(id, {});
  }

  if (rpc.method === "tools/list") {
    return jsonRpcResult(id, {
      tools: tools.map(publicToolDescriptor),
    });
  }

  if (rpc.method === "tools/call") {
    const parsed = callParams(rpc.params);
    if (!parsed) {
      return jsonRpcError(id, -32602, "Invalid params for tools/call");
    }

    const tool = toolByName.get(parsed.name);
    if (!tool) {
      return jsonRpcError(id, -32602, `Unknown tool: ${parsed.name}`);
    }

    const result = await tool.run(parsed.args, {
      request,
      apiKey: extractApiKey(request),
    });

    return jsonRpcResult(id, result);
  }

  return jsonRpcError(id, -32601, `Method not found: ${rpc.method}`);
}
