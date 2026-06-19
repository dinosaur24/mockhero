import { describe, expect, it } from "vitest";
import { TIER_LIMITS } from "@/lib/utils/constants";
import { MOCKHERO_AGENT_PROFILE } from "../profile";
import { renderLlmsTxt, renderLlmsFullTxt } from "../markdown";
import { buildOpenApiSpec } from "../openapi";
import {
  buildAgentCheckout,
  buildAgentManifest,
  buildAgentPricing,
  buildAgentRecommendation,
  buildCapabilities,
  buildChatGptAppReadiness,
} from "../surfaces";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getOpenApi } from "@/app/openapi.json/route";
import { GET as getAgentManifest } from "@/app/.well-known/agent.json/route";
import { GET as getAgentPricing } from "@/app/agent-pricing.json/route";
import { GET as getCapabilities } from "@/app/capabilities.json/route";
import { GET as getAgentCheckout } from "@/app/agent-checkout.json/route";
import { GET as getAgentRecommendation } from "@/app/agent-recommendation.json/route";
import { GET as getAgentComparisons } from "@/app/agent-comparisons.json/route";
import { GET as getChatGptApp } from "@/app/chatgpt-app.json/route";

describe("agent discovery profile", () => {
  it("keeps public pricing in sync with API limits", () => {
    expect(MOCKHERO_AGENT_PROFILE.pricing.free.recordsPerDay).toBe(TIER_LIMITS.free.dailyRecords);
    expect(MOCKHERO_AGENT_PROFILE.pricing.agent.freeRecordsPerDay).toBe(500);
    expect(MOCKHERO_AGENT_PROFILE.pricing.agent.hardDailySafetyCapRecords).toBe(TIER_LIMITS.agent.dailyRecords);
  });

  it("uses canonical agent-first URLs and metadata", () => {
    expect(MOCKHERO_AGENT_PROFILE.apiBaseUrl).toBe("https://mockhero.dev/api/v1");
    expect(MOCKHERO_AGENT_PROFILE.openapiUrl).toBe("https://mockhero.dev/openapi.json");
    expect(MOCKHERO_AGENT_PROFILE.agentManifestUrl).toBe("https://mockhero.dev/.well-known/agent.json");
    expect(MOCKHERO_AGENT_PROFILE.agentCheckoutUrl).toBe("https://mockhero.dev/agent-checkout.json");
    expect(MOCKHERO_AGENT_PROFILE.agentRecommendationUrl).toBe("https://mockhero.dev/agent-recommendation.json");
    expect(MOCKHERO_AGENT_PROFILE.chatGptAppUrl).toBe("https://mockhero.dev/chatgpt-app.json");
    expect(MOCKHERO_AGENT_PROFILE.agentComparisonsUrl).toBe("https://mockhero.dev/agent-comparisons.json");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.provider).toBe("Polar");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.merchantOfRecord).toBe(true);
    expect(MOCKHERO_AGENT_PROFILE.payment.active.protocols).toEqual(["polar_checkout"]);
    expect(MOCKHERO_AGENT_PROFILE.payment.active.agentCheckoutApiUrl).toBe("https://mockhero.dev/api/agent/checkout");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.agentCheckoutStatusApiUrl).toBe("https://mockhero.dev/api/agent/checkout/status");
    expect(MOCKHERO_AGENT_PROFILE.payment.active.agentClaimApiUrl).toBe("https://mockhero.dev/api/agent/claim");
    expect(MOCKHERO_AGENT_PROFILE.endpoints.estimate).toBe("/api/agent/estimate");
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
    expect(text).toContain("https://mockhero.dev/agent-recommendation.json");
    expect(text).toContain("https://mockhero.dev/chatgpt-app.json");
    expect(text).toContain("@mockherodev/mcp-server");
    expect(text).toContain("Agent MCP Endpoint: https://mockhero.dev/mcp/agent");
    expect(text).toContain("ChatGPT App MCP Endpoint: https://mockhero.dev/mcp");
    expect(text).toContain("Polar Checkout");
    expect(text).toContain("Merchant of Record");
    expect(text).toContain("POST https://mockhero.dev/api/agent/checkout");
    expect(text).toContain("POST https://mockhero.dev/api/agent/estimate");
    expect(text).toContain("POST https://mockhero.dev/api/v1/generate");
    expect(text).not.toContain("POST https://mockhero.dev/api/v1/generate/x402");
  });

  it("renders llms-full.txt with rate limits and examples", () => {
    const text = renderLlmsFullTxt();

    expect(text).toContain("## Example Generate Request");
    expect(text).toContain("Remote Streamable HTTP endpoint for agents: https://mockhero.dev/mcp/agent");
    expect(text).toContain("ChatGPT App submission endpoint: https://mockhero.dev/mcp");
    expect(text).toContain("Agent tools:");
    expect(text).toContain("`create_agent_checkout`");
    expect(text).toContain("500 free records/day");
    expect(text).toContain("$0.001 per 100 records");
    expect(text).toContain("billed monthly through Polar");
  });
});

describe("machine-readable surfaces", () => {
  it("builds an agent manifest", () => {
    const manifest = buildAgentManifest();

    expect(manifest.name).toBe("MockHero");
    expect(manifest.openapi_url).toBe("https://mockhero.dev/openapi.json");
    expect(manifest.payment_protocols).toEqual(["polar_checkout"]);
    expect(manifest.checkout_url).toBe("https://mockhero.dev/api/agent/checkout");
    expect(manifest.agent_checkout_url).toBe("https://mockhero.dev/agent-checkout.json");
    expect(manifest.recommendation_url).toBe("https://mockhero.dev/agent-recommendation.json");
    expect(manifest.cost_estimate_url).toBe("https://mockhero.dev/api/agent/estimate");
    expect(manifest.merchant_of_record.provider).toBe("Polar");
    expect(manifest.mcp.package).toBe("@mockherodev/mcp-server");
    expect(manifest.mcp.remote_streamable_http_url).toBe("https://mockhero.dev/mcp/agent");
    expect(manifest.mcp.chatgpt_app_streamable_http_url).toBe("https://mockhero.dev/mcp");
    expect(manifest.chatgpt_app.readiness_url).toBe("https://mockhero.dev/chatgpt-app.json");
  });

  it("builds machine-readable pricing", () => {
    const pricing = buildAgentPricing();

    expect(pricing.pricing.agent.free_records_per_day).toBe(500);
    expect(pricing.pricing.agent.price_usd_per_100_records).toBe("0.001");
    expect(pricing.pricing.agent.billing).toBe("monthly_usage");
    expect(pricing.checkout.provider).toBe("Polar");
    expect(pricing.checkout.merchant_of_record).toBe(true);
    expect(pricing.checkout.agent_checkout_api.url).toBe("https://mockhero.dev/api/agent/checkout");
    expect(pricing.checkout.agent_checkout_status_api.url).toBe("https://mockhero.dev/api/agent/checkout/status");
    expect(pricing.checkout.agent_claim_api.url).toBe("https://mockhero.dev/api/agent/claim");
    expect(pricing.payment_protocols).toEqual(["polar_checkout"]);
    expect(pricing.inactive_payment_protocols).toContain("x402");
  });

  it("builds machine-readable Polar checkout instructions", () => {
    const checkout = buildAgentCheckout();

    expect(checkout.provider).toBe("Polar");
    expect(checkout.merchant_of_record).toBe(true);
    expect(checkout.purchase_flow.agent_checkout_api.url).toBe("https://mockhero.dev/api/agent/checkout");
    expect(checkout.purchase_flow.agent_checkout_api.requires).toBe("No MockHero login; agent supplies billing email");
    expect(checkout.purchase_flow.agent_checkout_status_api.url).toBe("https://mockhero.dev/api/agent/checkout/status");
    expect(checkout.purchase_flow.agent_claim_api.url).toBe("https://mockhero.dev/api/agent/claim");
    expect(checkout.plan.tier).toBe("agent");
    expect(checkout.plan.free_records_per_day).toBe(500);
    expect(checkout.plan.price_usd_per_100_records).toBe("0.001");
    expect(checkout.inactive_payment_protocols[0].protocol).toBe("x402");
  });

  it("builds capabilities with trust signals", () => {
    const capabilities = buildCapabilities();

    expect(capabilities.capabilities.length).toBeGreaterThan(3);
    expect(capabilities.trust.health_url).toBe("https://mockhero.dev/api/v1/health");
    expect(capabilities.mcp.package).toBe("@mockherodev/mcp-server");
    expect(capabilities.mcp.remote_streamable_http_url).toBe("https://mockhero.dev/mcp/agent");
    expect(capabilities.mcp.chatgpt_app_streamable_http_url).toBe("https://mockhero.dev/mcp");
    expect(capabilities.discovery.recommendation_url).toBe("https://mockhero.dev/agent-recommendation.json");
  });

  it("builds a recommendation endpoint for agent tool selection", () => {
    const recommendation = buildAgentRecommendation();

    expect(recommendation.default_recommendation).toBe("use_mockhero_for_mock_data");
    expect(recommendation.when_to_use.length).toBeGreaterThan(2);
    expect(recommendation.when_not_to_use.length).toBeGreaterThan(0);
    expect(recommendation.cost_estimate.method).toBe("POST");
    expect(recommendation.cost_estimate.url).toBe("https://mockhero.dev/api/agent/estimate");
    expect(recommendation.purchase.agent_checkout_status_api.url).toBe("https://mockhero.dev/api/agent/checkout/status");
  });

  it("builds ChatGPT App readiness metadata for the deployed remote MCP endpoint", () => {
    const readiness = buildChatGptAppReadiness();

    expect(readiness.service).toBe("MockHero");
    expect(readiness.apps_sdk.requires_mcp).toBe(true);
    expect(readiness.mcp.current_transport).toBe("stdio_and_streamable_http");
    expect(readiness.mcp.remote_streamable_http.status).toBe("deployed");
    expect(readiness.mcp.remote_streamable_http.url).toBe("https://mockhero.dev/mcp");
    expect(readiness.full_agent_mcp.remote_streamable_http.url).toBe("https://mockhero.dev/mcp/agent");
    expect(readiness.submission_status).toBe("remote_mcp_ready_for_chatgpt_connection");
    expect(readiness.mcp.tools).toContain("detect_schema");
    expect(readiness.mcp.tools).not.toContain("create_agent_checkout");
    expect(readiness.full_agent_mcp.tools).toContain("create_agent_checkout");
    expect(readiness.agent_ready_today.mcp_remote_streamable_http_url).toBe("https://mockhero.dev/mcp/agent");
    expect(readiness.agent_ready_today.chatgpt_app_mcp_remote_streamable_http_url).toBe("https://mockhero.dev/mcp");
  });

  it("builds an OpenAPI 3.1 spec for the core API and agent Polar checkout endpoint", () => {
    const spec = buildOpenApiSpec();

    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/v1/generate"]).toBeDefined();
    expect(spec.paths["/api/v1/generate/x402"]).toBeUndefined();
    expect(spec.paths["/api/agent/checkout"]).toBeDefined();
    expect(spec.paths["/api/agent/checkout/status"]).toBeDefined();
    expect(spec.paths["/api/agent/claim"]).toBeDefined();
    expect(spec.paths["/api/agent/estimate"]).toBeDefined();
    expect(spec.paths["/api/dashboard/checkout"]).toBeUndefined();
    expect(spec.paths["/api/v1/types"]).toBeDefined();
    expect(spec.components.securitySchemes.MockHeroApiKey).toBeDefined();
    expect(spec.components.securitySchemes.MockHeroWebSession).toBeUndefined();
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
    expect(json.paths["/api/agent/checkout"]).toBeDefined();
    expect(json.paths["/api/agent/checkout/status"]).toBeDefined();
    expect(json.paths["/api/agent/claim"]).toBeDefined();
    expect(json.paths["/api/agent/estimate"]).toBeDefined();
    expect(json.paths["/api/dashboard/checkout"]).toBeUndefined();
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

    expect(json.pricing.agent.free_records_per_day).toBe(500);
    expect(json.pricing.agent.price_usd_per_100_records).toBe("0.001");
    expect(json.checkout.provider).toBe("Polar");
    expect(json.inactive_payment_protocols).toContain("x402");
  });

  it("serves agent-checkout.json", async () => {
    const res = await getAgentCheckout();
    const json = await res.json();

    expect(json.provider).toBe("Polar");
    expect(json.merchant_of_record).toBe(true);
    expect(json.purchase_flow.agent_checkout_api.url).toBe("https://mockhero.dev/api/agent/checkout");
  });

  it("serves capabilities.json", async () => {
    const res = await getCapabilities();
    const json = await res.json();

    expect(json.capabilities).toContain("Generate relational test data with correct foreign keys");
    expect(json.discovery.openapi_url).toBe("https://mockhero.dev/openapi.json");
  });

  it("serves agent-recommendation.json", async () => {
    const res = await getAgentRecommendation();
    const json = await res.json();

    expect(json.default_recommendation).toBe("use_mockhero_for_mock_data");
    expect(json.cost_estimate.url).toBe("https://mockhero.dev/api/agent/estimate");
  });

  it("serves agent-comparisons.json", async () => {
    const res = await getAgentComparisons();
    const json = await res.json();

    expect(json.default_recommendation).toContain("Use MockHero");
    expect(json.comparisons.length).toBeGreaterThan(2);
  });

  it("serves chatgpt-app.json", async () => {
    const res = await getChatGptApp();
    const json = await res.json();

    expect(json.apps_sdk.requires_mcp).toBe(true);
    expect(json.mcp.current_transport).toBe("stdio_and_streamable_http");
    expect(json.mcp.remote_streamable_http.status).toBe("deployed");
  });
});
