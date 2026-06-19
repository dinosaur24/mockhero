import { AGENT_USAGE_PRICING, TIER_LIMITS } from "@/lib/utils/constants";

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
  agentQuickstartUrl: `${websiteUrl}/agent-quickstart.json`,
  agentCheckoutUrl: `${websiteUrl}/agent-checkout.json`,
  agentRecommendationUrl: `${websiteUrl}/agent-recommendation.json`,
  agentComparisonsUrl: `${websiteUrl}/agent-comparisons.json`,
  chatGptAppUrl: `${websiteUrl}/chatgpt-app.json`,
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
    estimate: "/api/agent/estimate",
    checkout: "/api/agent/checkout",
    checkoutStatus: "/api/agent/checkout/status",
    claim: "/api/agent/claim",
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
    agent: {
      freeRecordsPerDay: AGENT_USAGE_PRICING.freeRecordsPerDay,
      priceUsdPer100Records: AGENT_USAGE_PRICING.priceUsdPer100Records,
      billing: AGENT_USAGE_PRICING.billing,
      billedBy: "Polar",
      merchantOfRecord: true,
      hardDailySafetyCapRecords: TIER_LIMITS.agent.dailyRecords,
      recordsPerRequest: TIER_LIMITS.agent.perRequest,
      requestsPerMinute: TIER_LIMITS.agent.perMinute,
      promptsPerDay: TIER_LIMITS.agent.promptsPerDay,
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
      checkoutUrl: `${websiteUrl}/api/agent/checkout`,
      agentCheckoutApiUrl: `${websiteUrl}/api/agent/checkout`,
      agentCheckoutStatusApiUrl: `${websiteUrl}/api/agent/checkout/status`,
      agentClaimApiUrl: `${websiteUrl}/api/agent/claim`,
      pricingUrl: `${websiteUrl}/agent-pricing.json`,
      supportedTiers: ["agent"],
      note:
        "Agents should create a loginless Polar Checkout for the agent metered plan, then claim an API key after the Polar webhook confirms payment. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.",
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
  chatGptApp: {
    readinessUrl: `${websiteUrl}/chatgpt-app.json`,
    appsSdkRequiresMcp: true,
    currentMcpTransport: "stdio_and_streamable_http",
    remoteMcpEndpoint: `${websiteUrl}/mcp`,
    remoteMcpStatus: "deployed",
    submissionStatus: "remote_mcp_ready_for_chatgpt_connection",
  },
  agentMcp: {
    remoteMcpEndpoint: `${websiteUrl}/mcp/agent`,
    remoteMcpStatus: "deployed",
    purpose:
      "Full agent-first MCP endpoint with Polar checkout, API key claim, and authenticated generation tools.",
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
