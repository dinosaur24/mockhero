import { TIER_LIMITS } from "@/lib/utils/constants";

const websiteUrl = "https://mockhero.dev";

export const MOCKHERO_AGENT_PROFILE = {
  name: "MockHero",
  summary:
    "MockHero is a synthetic test data API for developers and AI coding agents. It generates realistic, relational mock data from schemas, prompts, or templates.",
  websiteUrl,
  apiBaseUrl: `${websiteUrl}/api/v1`,
  openapiUrl: `${websiteUrl}/openapi.json`,
  agentManifestUrl: `${websiteUrl}/.well-known/agent.json`,
  pricingUrl: `${websiteUrl}/agent-pricing.json`,
  agentCheckoutUrl: `${websiteUrl}/agent-checkout.json`,
  capabilitiesUrl: `${websiteUrl}/capabilities.json`,
  llmsTxtUrl: `${websiteUrl}/llms.txt`,
  canonicalAuthHeader: "Authorization: Bearer mh_YOUR_API_KEY",
  alternateAuthHeader: "x-api-key: mh_YOUR_API_KEY",
  mcpPackage: "@mockherodev/mcp-server",
  fieldTypeCount: 156,
  localeCount: 22,
  endpoints: {
    generate: "/api/v1/generate",
    generateX402: "/api/v1/generate/x402",
    checkout: "/api/dashboard/checkout",
    templates: "/api/v1/templates",
    types: "/api/v1/types",
    schemaDetect: "/api/v1/schema/detect",
    health: "/api/v1/health",
  },
  pricing: {
    free: {
      priceUsd: 0,
      recordsPerDay: TIER_LIMITS.free.dailyRecords,
      recordsPerRequest: TIER_LIMITS.free.perRequest,
      requestsPerMinute: TIER_LIMITS.free.perMinute,
      promptsPerDay: TIER_LIMITS.free.promptsPerDay,
    },
    pro: {
      priceUsdMonthly: 29,
      recordsPerDay: TIER_LIMITS.pro.dailyRecords,
      recordsPerRequest: TIER_LIMITS.pro.perRequest,
      requestsPerMinute: TIER_LIMITS.pro.perMinute,
      promptsPerDay: TIER_LIMITS.pro.promptsPerDay,
    },
    scale: {
      priceUsdMonthly: 79,
      recordsPerDay: TIER_LIMITS.scale.dailyRecords,
      recordsPerRequest: TIER_LIMITS.scale.perRequest,
      requestsPerMinute: TIER_LIMITS.scale.perMinute,
      promptsPerDay: TIER_LIMITS.scale.promptsPerDay,
    },
    x402: {
      priceUsdPerRequest: "0.001",
      maxRecordsPerRequest: 100,
      endpoint: `${websiteUrl}/api/v1/generate/x402`,
      network: "base",
      asset: "USDC",
      status: "disabled",
      reason:
        "Direct x402 payments are not advertised while Polar is the Merchant of Record checkout path.",
    },
  },
  payment: {
    active: {
      provider: "Polar",
      protocols: ["polar_checkout"],
      merchantOfRecord: true,
      checkoutUrl: `${websiteUrl}/dashboard/billing`,
      newCustomerUrl: `${websiteUrl}/sign-up`,
      authenticatedCheckoutApiUrl: `${websiteUrl}/api/dashboard/checkout`,
      supportedTiers: ["pro", "scale"],
      note:
        "Agents should use Polar Checkout. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.",
    },
    inactive: [
      {
        protocol: "x402",
        endpoint: `${websiteUrl}/api/v1/generate/x402`,
        status: "disabled",
        reason:
          "Direct wallet settlement would bypass the Merchant of Record checkout flow.",
      },
    ],
  },
  capabilities: [
    "Generate relational test data with correct foreign keys",
    "Generate locale-aware names, emails, addresses, and phone numbers",
    "Generate JSON, CSV, and SQL output",
    "Convert plain English prompts into schemas",
    "Detect schemas from SQL CREATE TABLE statements",
    "Expose MCP tools for AI coding agents",
  ],
  trust: {
    privacy: "Synthetic data generation only; no production data required.",
    dataRetention:
      "Generation usage is logged for analytics, rate limiting, billing, and abuse prevention.",
    supportEmail: "hello@mockhero.dev",
    statusUrl: `${websiteUrl}/api/v1/health`,
    healthUrl: `${websiteUrl}/api/v1/health`,
  },
} as const;

export type MockHeroAgentProfile = typeof MOCKHERO_AGENT_PROFILE;
