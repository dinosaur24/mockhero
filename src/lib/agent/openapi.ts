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

const checkoutRequestSchema = {
  type: "object",
  required: ["tier"],
  properties: {
    tier: { type: "string", enum: ["pro", "scale"] },
    source: { type: "string", enum: ["agent"] },
  },
};

const checkoutResponseSchema = {
  type: "object",
  required: ["url"],
  properties: {
    url: { type: "string", format: "uri", description: "Polar Checkout URL" },
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
      "/api/dashboard/checkout": {
        post: {
          summary: "Create a Polar checkout session",
          description:
            "Creates a Polar Checkout URL for Pro or Scale. Requires a signed-in MockHero web session. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.",
          security: [{ MockHeroWebSession: [] }],
          requestBody: jsonBody("#/components/schemas/CheckoutRequest"),
          responses: {
            "200": {
              description: "Polar Checkout URL",
              ...jsonBody("#/components/schemas/CheckoutResponse"),
            },
            "400": { description: "Invalid tier or missing account email" },
            "401": { description: "Signed-in MockHero web session required" },
            "500": { description: "Polar checkout creation failed" },
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
        MockHeroWebSession: {
          type: "apiKey",
          in: "cookie",
          name: "__session",
          description: "Authenticated MockHero web session managed by Clerk.",
        },
      },
      schemas: {
        GenerateRequest: generateRequestSchema,
        GenerateResponse: generateResponseSchema,
        CheckoutRequest: checkoutRequestSchema,
        CheckoutResponse: checkoutResponseSchema,
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
