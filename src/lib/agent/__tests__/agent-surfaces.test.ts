import { describe, expect, it } from "vitest";
import { TIER_LIMITS } from "@/lib/utils/constants";
import { MOCKHERO_AGENT_PROFILE } from "../profile";
import { renderLlmsTxt, renderLlmsFullTxt } from "../markdown";
import { buildOpenApiSpec } from "../openapi";
import { buildAgentCheckout, buildAgentManifest, buildAgentPricing, buildCapabilities } from "../surfaces";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getOpenApi } from "@/app/openapi.json/route";
import { GET as getAgentManifest } from "@/app/.well-known/agent.json/route";
import { GET as getAgentPricing } from "@/app/agent-pricing.json/route";
import { GET as getCapabilities } from "@/app/capabilities.json/route";
import { GET as getAgentCheckout } from "@/app/agent-checkout.json/route";

describe("agent discovery profile", () => {
  it("keeps public pricing in sync with API limits", () => {
    expect(MOCKHERO_AGENT_PROFILE.pricing.free.recordsPerDay).toBe(TIER_LIMITS.free.dailyRecords);
    expect(MOCKHERO_AGENT_PROFILE.pricing.pro.recordsPerDay).toBe(TIER_LIMITS.pro.dailyRecords);
    expect(MOCKHERO_AGENT_PROFILE.pricing.scale.recordsPerDay).toBe(TIER_LIMITS.scale.dailyRecords);
  });

  it("uses canonical agent-first URLs and metadata", () => {
    expect(MOCKHERO_AGENT_PROFILE.apiBaseUrl).toBe("https://mockhero.dev/api/v1");
    expect(MOCKHERO_AGENT_PROFILE.openapiUrl).toBe("https://mockhero.dev/openapi.json");
    expect(MOCKHERO_AGENT_PROFILE.agentManifestUrl).toBe("https://mockhero.dev/.well-known/agent.json");
    expect(MOCKHERO_AGENT_PROFILE.agentCheckoutUrl).toBe("https://mockhero.dev/agent-checkout.json");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.provider).toBe("Polar");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.merchantOfRecord).toBe(true);
    expect(MOCKHERO_AGENT_PROFILE.payment.active.protocols).toEqual(["polar_checkout"]);
    expect(MOCKHERO_AGENT_PROFILE.fieldTypeCount).toBe(156);
    expect(MOCKHERO_AGENT_PROFILE.localeCount).toBe(22);
  });
});

describe("agent-readable document renderers", () => {
  it("renders llms.txt with the key agent entry points", () => {
    const text = renderLlmsTxt();

    expect(text).toContain("# MockHero");
    expect(text).toContain("https://mockhero.dev/openapi.json");
    expect(text).toContain("https://mockhero.dev/.well-known/agent.json");
    expect(text).toContain("https://mockhero.dev/agent-pricing.json");
    expect(text).toContain("https://mockhero.dev/agent-checkout.json");
    expect(text).toContain("@mockherodev/mcp-server");
    expect(text).toContain("Polar Checkout");
    expect(text).toContain("Merchant of Record");
    expect(text).toContain("POST https://mockhero.dev/api/v1/generate");
    expect(text).not.toContain("POST https://mockhero.dev/api/v1/generate/x402");
  });

  it("renders llms-full.txt with rate limits and examples", () => {
    const text = renderLlmsFullTxt();

    expect(text).toContain("## Example Generate Request");
    expect(text).toContain("1,000 records/day");
    expect(text).toContain("100,000 records/day");
    expect(text).toContain("1,000,000 records/day");
  });
});

describe("machine-readable surfaces", () => {
  it("builds an agent manifest", () => {
    const manifest = buildAgentManifest();

    expect(manifest.name).toBe("MockHero");
    expect(manifest.openapi_url).toBe("https://mockhero.dev/openapi.json");
    expect(manifest.payment_protocols).toEqual(["polar_checkout"]);
    expect(manifest.checkout_url).toBe("https://mockhero.dev/dashboard/billing");
    expect(manifest.agent_checkout_url).toBe("https://mockhero.dev/agent-checkout.json");
    expect(manifest.merchant_of_record.provider).toBe("Polar");
    expect(manifest.mcp.package).toBe("@mockherodev/mcp-server");
  });

  it("builds machine-readable pricing", () => {
    const pricing = buildAgentPricing();

    expect(pricing.pricing.free.records_per_day).toBe(1000);
    expect(pricing.checkout.provider).toBe("Polar");
    expect(pricing.checkout.merchant_of_record).toBe(true);
    expect(pricing.checkout.authenticated_checkout_api.url).toBe("https://mockhero.dev/api/dashboard/checkout");
    expect(pricing.payment_protocols).toEqual(["polar_checkout"]);
    expect(pricing.inactive_payment_protocols).toContain("x402");
  });

  it("builds machine-readable Polar checkout instructions", () => {
    const checkout = buildAgentCheckout();

    expect(checkout.provider).toBe("Polar");
    expect(checkout.merchant_of_record).toBe(true);
    expect(checkout.purchase_flow.existing_customer_url).toBe("https://mockhero.dev/dashboard/billing");
    expect(checkout.purchase_flow.authenticated_checkout_api.body_schema.properties.tier.enum).toEqual(["pro", "scale"]);
    expect(checkout.plans.map((plan) => plan.tier)).toEqual(["pro", "scale"]);
    expect(checkout.inactive_payment_protocols[0].protocol).toBe("x402");
  });

  it("builds capabilities with trust signals", () => {
    const capabilities = buildCapabilities();

    expect(capabilities.capabilities.length).toBeGreaterThan(3);
    expect(capabilities.trust.health_url).toBe("https://mockhero.dev/api/v1/health");
    expect(capabilities.mcp.package).toBe("@mockherodev/mcp-server");
  });

  it("builds an OpenAPI 3.1 spec for the core API and Polar checkout endpoint", () => {
    const spec = buildOpenApiSpec();

    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/v1/generate"]).toBeDefined();
    expect(spec.paths["/api/v1/generate/x402"]).toBeUndefined();
    expect(spec.paths["/api/dashboard/checkout"]).toBeDefined();
    expect(spec.paths["/api/v1/types"]).toBeDefined();
    expect(spec.components.securitySchemes.MockHeroApiKey).toBeDefined();
    expect(spec.components.securitySchemes.MockHeroWebSession).toBeDefined();
  });
});

describe("agent routes", () => {
  it("serves llms.txt as text", async () => {
    const res = await getLlmsTxt();
    const text = await res.text();

    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("Agent Manifest");
  });

  it("serves openapi.json", async () => {
    const res = await getOpenApi();
    const json = await res.json();

    expect(json.openapi).toBe("3.1.0");
    expect(json.paths["/api/v1/generate/x402"]).toBeUndefined();
    expect(json.paths["/api/dashboard/checkout"]).toBeDefined();
  });

  it("serves .well-known/agent.json", async () => {
    const res = await getAgentManifest();
    const json = await res.json();

    expect(json.openapi_url).toBe("https://mockhero.dev/openapi.json");
    expect(json.payment_protocols).toEqual(["polar_checkout"]);
    expect(json.merchant_of_record.provider).toBe("Polar");
  });

  it("serves agent-pricing.json", async () => {
    const res = await getAgentPricing();
    const json = await res.json();

    expect(json.pricing.free.records_per_day).toBe(1000);
    expect(json.checkout.provider).toBe("Polar");
    expect(json.inactive_payment_protocols).toContain("x402");
  });

  it("serves agent-checkout.json", async () => {
    const res = await getAgentCheckout();
    const json = await res.json();

    expect(json.provider).toBe("Polar");
    expect(json.merchant_of_record).toBe(true);
    expect(json.purchase_flow.authenticated_checkout_api.url).toBe("https://mockhero.dev/api/dashboard/checkout");
  });

  it("serves capabilities.json", async () => {
    const res = await getCapabilities();
    const json = await res.json();

    expect(json.capabilities).toContain("Generate relational test data with correct foreign keys");
    expect(json.discovery.openapi_url).toBe("https://mockhero.dev/openapi.json");
  });
});
