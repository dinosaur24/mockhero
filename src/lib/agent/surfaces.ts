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
      pro: {
        price_usd_monthly: p.pricing.pro.priceUsdMonthly,
        records_per_day: p.pricing.pro.recordsPerDay,
        records_per_request: p.pricing.pro.recordsPerRequest,
        requests_per_minute: p.pricing.pro.requestsPerMinute,
        prompts_per_day: p.pricing.pro.promptsPerDay,
      },
      scale: {
        price_usd_monthly: p.pricing.scale.priceUsdMonthly,
        records_per_day: p.pricing.scale.recordsPerDay,
        records_per_request: p.pricing.scale.recordsPerRequest,
        requests_per_minute: p.pricing.scale.requestsPerMinute,
        prompts_per_day: p.pricing.scale.promptsPerDay,
      },
    },
    payment_protocols: p.payment.active.protocols,
    inactive_payment_protocols: p.payment.inactive.map((rail) => rail.protocol),
    checkout: {
      provider: p.payment.active.provider,
      merchant_of_record: p.payment.active.merchantOfRecord,
      checkout_url: p.payment.active.checkoutUrl,
      new_customer_url: p.payment.active.newCustomerUrl,
      agent_checkout_url: p.agentCheckoutUrl,
      authenticated_checkout_api: {
        method: "POST",
        url: p.payment.active.authenticatedCheckoutApiUrl,
        requires: "Signed-in MockHero web session",
        body_schema: {
          type: "object",
          required: ["tier"],
          properties: {
            tier: { type: "string", enum: p.payment.active.supportedTiers },
            source: { type: "string", enum: ["agent"] },
          },
        },
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
      new_customer_url: p.payment.active.newCustomerUrl,
      existing_customer_url: p.payment.active.checkoutUrl,
      authenticated_checkout_api: {
        method: "POST",
        url: p.payment.active.authenticatedCheckoutApiUrl,
        requires: "Signed-in MockHero web session",
        body_schema: {
          type: "object",
          required: ["tier"],
          properties: {
            tier: { type: "string", enum: p.payment.active.supportedTiers },
            source: { type: "string", enum: ["agent"] },
          },
        },
        response_schema: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri", description: "Polar Checkout URL" },
          },
        },
      },
    },
    plans: [
      {
        tier: "pro",
        price_usd_monthly: p.pricing.pro.priceUsdMonthly,
        records_per_day: p.pricing.pro.recordsPerDay,
        records_per_request: p.pricing.pro.recordsPerRequest,
      },
      {
        tier: "scale",
        price_usd_monthly: p.pricing.scale.priceUsdMonthly,
        records_per_day: p.pricing.scale.recordsPerDay,
        records_per_request: p.pricing.scale.recordsPerRequest,
      },
    ],
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
