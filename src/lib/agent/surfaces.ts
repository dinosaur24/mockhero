import { MOCKHERO_AGENT_PROFILE } from "./profile";

export function buildAgentManifest() {
  const p = MOCKHERO_AGENT_PROFILE;

  return {
    name: p.name,
    description: p.summary,
    website_url: p.websiteUrl,
    capabilities_url: p.capabilitiesUrl,
    pricing_url: p.pricingUrl,
    openapi_url: p.openapiUrl,
    llms_txt_url: p.llmsTxtUrl,
    mcp: {
      package: p.mcpPackage,
      install: `npx ${p.mcpPackage}`,
      env: ["MOCKHERO_API_KEY"],
    },
    payment_protocols: p.payment.active.protocols,
    checkout_url: p.payment.active.checkoutUrl,
    agent_checkout_url: p.agentCheckoutUrl,
    merchant_of_record: {
      provider: p.payment.active.provider,
      active: p.payment.active.merchantOfRecord,
    },
    inactive_payment_protocols: p.payment.inactive.map((rail) => rail.protocol),
    support: p.trust.supportEmail,
    status_url: p.trust.statusUrl,
  };
}

export function buildAgentPricing() {
  const p = MOCKHERO_AGENT_PROFILE;

  return {
    service: p.name,
    pricing: {
      free: {
        price_usd: p.pricing.free.priceUsd,
        records_per_day: p.pricing.free.recordsPerDay,
        records_per_request: p.pricing.free.recordsPerRequest,
        requests_per_minute: p.pricing.free.requestsPerMinute,
        prompts_per_day: p.pricing.free.promptsPerDay,
      },
      agent: {
        free_records_per_day: p.pricing.agent.freeRecordsPerDay,
        price_usd_per_100_records: p.pricing.agent.priceUsdPer100Records,
        billing: p.pricing.agent.billing,
        billed_by: p.pricing.agent.billedBy,
        merchant_of_record: p.pricing.agent.merchantOfRecord,
        hard_daily_safety_cap_records: p.pricing.agent.hardDailySafetyCapRecords,
        records_per_request: p.pricing.agent.recordsPerRequest,
        requests_per_minute: p.pricing.agent.requestsPerMinute,
        prompts_per_day: p.pricing.agent.promptsPerDay,
        meter_unit: "100 billable records, rounded up per request",
      },
    },
    payment_protocols: p.payment.active.protocols,
    inactive_payment_protocols: p.payment.inactive.map((rail) => rail.protocol),
    checkout: {
      provider: p.payment.active.provider,
      merchant_of_record: p.payment.active.merchantOfRecord,
      checkout_url: p.payment.active.checkoutUrl,
      agent_checkout_url: p.agentCheckoutUrl,
      agent_checkout_api: {
        method: "POST",
        url: p.payment.active.agentCheckoutApiUrl,
        requires: "No MockHero login; agent supplies billing email",
        body_schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
      },
      agent_claim_api: {
        method: "POST",
        url: p.payment.active.agentClaimApiUrl,
        requires: "claim_token from agent checkout response and completed Polar checkout",
      },
    },
    status_url: p.trust.statusUrl,
  };
}

export function buildAgentCheckout() {
  const p = MOCKHERO_AGENT_PROFILE;

  return {
    service: p.name,
    provider: p.payment.active.provider,
    merchant_of_record: p.payment.active.merchantOfRecord,
    summary: p.payment.active.note,
    purchase_flow: {
      agent_checkout_api: {
        method: "POST",
        url: p.payment.active.agentCheckoutApiUrl,
        requires: "No MockHero login; agent supplies billing email",
        body_schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        response_schema: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri", description: "Polar Checkout URL" },
            claim_token: { type: "string", description: "One-time token used to claim the API key after payment" },
            claim_url: { type: "string", format: "uri" },
          },
        },
      },
      agent_claim_api: {
        method: "POST",
        url: p.payment.active.agentClaimApiUrl,
        requires: "Completed Polar Checkout and claim_token",
      },
    },
    plan: {
      tier: "agent",
      free_records_per_day: p.pricing.agent.freeRecordsPerDay,
      price_usd_per_100_records: p.pricing.agent.priceUsdPer100Records,
      billing: p.pricing.agent.billing,
      billed_by: p.pricing.agent.billedBy,
      hard_daily_safety_cap_records: p.pricing.agent.hardDailySafetyCapRecords,
      records_per_request: p.pricing.agent.recordsPerRequest,
      meter_unit: "100 billable records, rounded up per request",
    },
    inactive_payment_protocols: p.payment.inactive,
  };
}

export function buildCapabilities() {
  const p = MOCKHERO_AGENT_PROFILE;

  return {
    service: p.name,
    summary: p.summary,
    capabilities: p.capabilities,
    api: {
      base_url: p.apiBaseUrl,
      endpoints: p.endpoints,
      authentication: {
        preferred: p.canonicalAuthHeader,
        alternate: p.alternateAuthHeader,
      },
    },
    discovery: {
      openapi_url: p.openapiUrl,
      llms_txt_url: p.llmsTxtUrl,
      agent_manifest_url: p.agentManifestUrl,
      pricing_url: p.pricingUrl,
      checkout_url: p.agentCheckoutUrl,
    },
    mcp: {
      package: p.mcpPackage,
      install: `npx ${p.mcpPackage}`,
    },
    trust: {
      health_url: p.trust.healthUrl,
      status_url: p.trust.statusUrl,
      privacy: p.trust.privacy,
      data_retention: p.trust.dataRetention,
      support_email: p.trust.supportEmail,
    },
  };
}
