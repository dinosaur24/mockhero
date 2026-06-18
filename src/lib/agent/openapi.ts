import { MOCKHERO_AGENT_PROFILE } from "./profile";

type OpenApiSpec = {
  openapi: "3.1.0";
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string }[];
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
};

const fieldDefinitionSchema = {
  type: "object",
  required: ["name", "type"],
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    params: { type: "object", additionalProperties: true },
    nullable: { type: "boolean" },
  },
};

const generateRequestSchema = {
  type: "object",
  required: ["tables"],
  properties: {
    tables: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["name", "count", "fields"],
        properties: {
          name: { type: "string" },
          count: { type: "integer", minimum: 1 },
          fields: {
            type: "array",
            minItems: 1,
            items: fieldDefinitionSchema,
          },
        },
      },
    },
    locale: { type: "string" },
    format: { type: "string", enum: ["json", "csv", "sql"] },
    sql_dialect: { type: "string", enum: ["postgres", "mysql", "sqlite"] },
    seed: { type: "integer", minimum: 0, maximum: 4294967295 },
  },
};

const generateResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
    },
    meta: {
      type: "object",
      properties: {
        tables: { type: "integer" },
        total_records: { type: "integer" },
        records_per_table: { type: "object", additionalProperties: { type: "integer" } },
        locale: { type: "string" },
        format: { type: "string" },
        seed: { type: "integer" },
        generation_time_ms: { type: "number" },
      },
    },
  },
};

const agentCheckoutRequestSchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: { type: "string", format: "email" },
  },
};

const agentCheckoutResponseSchema = {
  type: "object",
  required: ["checkout_id", "url", "claim_url", "claim_token"],
  properties: {
    checkout_id: { type: "string" },
    url: { type: "string", format: "uri", description: "Polar Checkout URL" },
    claim_url: { type: "string", format: "uri" },
    claim_token: { type: "string", description: "One-time token for claiming the API key after Polar confirms payment" },
    provider: { type: "string", enum: ["Polar"] },
    merchant_of_record: { type: "boolean" },
  },
};

const agentCheckoutStatusRequestSchema = {
  type: "object",
  required: ["token"],
  properties: {
    token: { type: "string", description: "claim_token returned by /api/agent/checkout" },
  },
};

const agentCheckoutStatusResponseSchema = {
  type: "object",
  required: ["checkout_id", "status", "paid", "claimed", "next_action"],
  properties: {
    checkout_id: { type: "string" },
    status: { type: "string", enum: ["pending", "paid", "claimed", "expired"] },
    paid: { type: "boolean" },
    claimed: { type: "boolean" },
    provider: { type: "string", enum: ["Polar"] },
    merchant_of_record: { type: "boolean" },
    claim_url: { type: "string", format: "uri" },
    next_action: {
      type: "string",
      enum: ["complete_checkout", "claim_api_key", "already_claimed", "expired"],
    },
    pricing: { type: "object", additionalProperties: true },
  },
};

const agentClaimRequestSchema = {
  type: "object",
  required: ["token"],
  properties: {
    token: { type: "string" },
  },
};

const agentClaimResponseSchema = {
  type: "object",
  required: ["api_key", "key_prefix", "tier", "usage"],
  properties: {
    api_key: { type: "string", description: "Shown once. Store as MOCKHERO_API_KEY." },
    key_prefix: { type: "string" },
    tier: { type: "string", enum: ["agent"] },
    usage: { type: "object", additionalProperties: true },
  },
};

const agentEstimateRequestSchema = {
  type: "object",
  properties: {
    tables: generateRequestSchema.properties.tables,
    template: {
      type: "string",
      enum: ["ecommerce", "blog", "saas", "social"],
      description: "Optional template name. If provided, records are counted from the template.",
    },
    scale: { type: "number", minimum: 0.01, maximum: 100 },
    prompt: {
      type: "string",
      description: "Plain-English request. Requires estimated_records; this endpoint does not run LLM conversion.",
    },
    estimated_records: {
      type: "integer",
      minimum: 1,
      description: "Required when estimating a prompt without tables or template.",
    },
    daily_used_before: {
      type: "integer",
      minimum: 0,
      description: "Optional unauthenticated assumption. Ignored when a valid API key is supplied.",
    },
  },
};

const agentEstimateResponseSchema = {
  type: "object",
  required: ["service", "mode", "authenticated", "estimate", "pricing"],
  properties: {
    service: { type: "string" },
    mode: { type: "string", enum: ["schema", "template", "prompt_estimate"] },
    authenticated: { type: "boolean" },
    tier: { type: "string" },
    estimate: {
      type: "object",
      properties: {
        requested_records: { type: "integer" },
        daily_used_before: { type: "integer" },
        daily_used_after: { type: "integer" },
        free_records_per_day: { type: "integer" },
        free_records_remaining_before: { type: "integer" },
        billable_records: { type: "integer" },
        billable_units_100: { type: "integer" },
        estimated_cost_usd: { type: "string" },
        price_usd_per_100_records: { type: "string" },
        billing: { type: "string" },
      },
    },
    pricing: { type: "object", additionalProperties: true },
    assumptions: { type: "array", items: { type: "string" } },
  },
};

function jsonBody(schemaRef: string) {
  return {
    content: {
      "application/json": {
        schema: { $ref: schemaRef },
      },
    },
  };
}

export function buildOpenApiSpec(): OpenApiSpec {
  const p = MOCKHERO_AGENT_PROFILE;

  return {
    openapi: "3.1.0",
    info: {
      title: "MockHero API",
      version: "0.1.0",
      description: p.summary,
    },
    servers: [{ url: p.websiteUrl }],
    paths: {
      "/api/v1/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "Service health",
              ...jsonBody("#/components/schemas/HealthResponse"),
            },
          },
        },
      },
      "/api/v1/types": {
        get: {
          summary: "List supported field types",
          responses: {
            "200": {
              description: "Field type catalog",
            },
          },
        },
      },
      "/api/v1/templates": {
        get: {
          summary: "List pre-built schema templates",
          responses: {
            "200": {
              description: "Template list",
            },
          },
        },
      },
      "/api/v1/generate": {
        post: {
          summary: "Generate synthetic test data",
          security: [{ MockHeroApiKey: [] }, { MockHeroBearer: [] }],
          requestBody: jsonBody("#/components/schemas/GenerateRequest"),
          responses: {
            "200": {
              description: "Generated test data",
              ...jsonBody("#/components/schemas/GenerateResponse"),
            },
            "401": { description: "Missing or invalid API key" },
            "429": { description: "Rate limit exceeded" },
          },
        },
      },
      "/api/agent/checkout": {
        post: {
          summary: "Create a loginless Polar checkout session for an agent",
          description:
            "Creates a Polar Checkout URL for agent metered usage. No MockHero login is required. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.",
          requestBody: jsonBody("#/components/schemas/AgentCheckoutRequest"),
          responses: {
            "200": {
              description: "Polar Checkout URL plus one-time claim token",
              ...jsonBody("#/components/schemas/AgentCheckoutResponse"),
            },
            "400": { description: "Invalid or missing billing email" },
            "500": { description: "Polar checkout creation failed" },
          },
        },
      },
      "/api/agent/checkout/status": {
        get: {
          summary: "Poll a Polar checkout created for an agent",
          description:
            "Returns checkout payment and claim state using the claim_token returned by /api/agent/checkout. Use POST instead if the agent should avoid token-bearing URLs.",
          parameters: [
            {
              name: "token",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "claim_token returned by /api/agent/checkout",
            },
          ],
          responses: {
            "200": {
              description: "Agent checkout status",
              ...jsonBody("#/components/schemas/AgentCheckoutStatusResponse"),
            },
            "400": { description: "Missing or invalid claim token" },
            "404": { description: "Claim token not found" },
          },
        },
        post: {
          summary: "Poll a Polar checkout with token in JSON body",
          requestBody: jsonBody("#/components/schemas/AgentCheckoutStatusRequest"),
          responses: {
            "200": {
              description: "Agent checkout status",
              ...jsonBody("#/components/schemas/AgentCheckoutStatusResponse"),
            },
            "400": { description: "Missing or invalid claim token" },
            "404": { description: "Claim token not found" },
          },
        },
      },
      "/api/agent/claim": {
        post: {
          summary: "Claim an API key after Polar checkout is paid",
          description:
            "Returns a MockHero API key once the Polar webhook has marked the agent checkout as paid. The API key is shown only once.",
          requestBody: jsonBody("#/components/schemas/AgentClaimRequest"),
          responses: {
            "200": {
              description: "One-time API key response",
              ...jsonBody("#/components/schemas/AgentClaimResponse"),
            },
            "400": { description: "Missing or invalid claim token" },
            "402": { description: "Polar checkout is not paid yet" },
            "404": { description: "Claim token not found" },
            "409": { description: "Checkout already claimed" },
          },
        },
      },
      "/api/agent/estimate": {
        post: {
          summary: "Estimate agent metered usage cost before generating data",
          description:
            "Loginless estimate for the agent metered plan. If a valid API key is supplied, MockHero uses actual daily usage; otherwise agents may pass daily_used_before as an assumption.",
          requestBody: jsonBody("#/components/schemas/AgentEstimateRequest"),
          responses: {
            "200": {
              description: "Estimated agent cost",
              ...jsonBody("#/components/schemas/AgentEstimateResponse"),
            },
            "400": { description: "Invalid schema, template, or prompt estimate request" },
          },
        },
      },
      "/api/v1/schema/detect": {
        post: {
          summary: "Detect MockHero schema from SQL or JSON sample",
          security: [{ MockHeroApiKey: [] }, { MockHeroBearer: [] }],
          responses: {
            "200": { description: "Detected schema" },
            "401": { description: "Missing or invalid API key" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        MockHeroApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
        MockHeroBearer: {
          type: "http",
          scheme: "bearer",
        },
      },
      schemas: {
        GenerateRequest: generateRequestSchema,
        GenerateResponse: generateResponseSchema,
        AgentCheckoutRequest: agentCheckoutRequestSchema,
        AgentCheckoutResponse: agentCheckoutResponseSchema,
        AgentCheckoutStatusRequest: agentCheckoutStatusRequestSchema,
        AgentCheckoutStatusResponse: agentCheckoutStatusResponseSchema,
        AgentClaimRequest: agentClaimRequestSchema,
        AgentClaimResponse: agentClaimResponseSchema,
        AgentEstimateRequest: agentEstimateRequestSchema,
        AgentEstimateResponse: agentEstimateResponseSchema,
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["ok", "degraded"] },
            version: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            checks: {
              type: "object",
              properties: {
                api: { type: "string" },
                database: { type: "string" },
              },
            },
          },
        },
      },
    },
  };
}
