import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateAgentCheckout,
  mockClaimAgentCheckout,
  mockGetAgentCheckoutStatus,
  MockAgentBillingError,
} = vi.hoisted(() => ({
  mockCreateAgentCheckout: vi.fn(),
  mockClaimAgentCheckout: vi.fn(),
  mockGetAgentCheckoutStatus: vi.fn(),
  MockAgentBillingError: class MockAgentBillingError extends Error {},
}));

vi.mock("@/lib/agent/billing", () => ({
  AgentBillingError: MockAgentBillingError,
  createAgentCheckout: (...args: unknown[]) => mockCreateAgentCheckout(...args),
  claimAgentCheckout: (...args: unknown[]) => mockClaimAgentCheckout(...args),
  getAgentCheckoutStatus: (...args: unknown[]) => mockGetAgentCheckoutStatus(...args),
}));

import { POST as checkoutPOST } from "../checkout/route";
import { GET as checkoutStatusGET, POST as checkoutStatusPOST } from "../checkout/status/route";
import { POST as claimPOST } from "../claim/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agent/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid billing email", async () => {
    const res = await checkoutPOST(jsonRequest({ email: "not-an-email" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mockCreateAgentCheckout).not.toHaveBeenCalled();
  });

  it("creates a Polar checkout without a MockHero login", async () => {
    mockCreateAgentCheckout.mockResolvedValue({
      checkout_id: "agentco_123",
      url: "https://checkout.polar.sh/agentco_123",
      claim_url: "https://mockhero.dev/api/agent/claim",
      claim_token: "claim_token_once",
      provider: "Polar",
      merchant_of_record: true,
      pricing: {
        free_records_per_day: 500,
        price_usd_per_100_records: "0.001",
        billing: "monthly_usage",
      },
    });

    const res = await checkoutPOST(jsonRequest({ email: "agent@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://checkout.polar.sh/agentco_123");
    expect(body.claim_token).toBe("claim_token_once");
    expect(body.provider).toBe("Polar");
    expect(body.merchant_of_record).toBe(true);
    expect(mockCreateAgentCheckout).toHaveBeenCalledWith({
      email: "agent@example.com",
    });
  });
});

describe("POST /api/agent/claim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a claim token", async () => {
    const res = await claimPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mockClaimAgentCheckout).not.toHaveBeenCalled();
  });

  it("returns a one-time API key after Polar payment is confirmed", async () => {
    mockClaimAgentCheckout.mockResolvedValue({
      api_key: "mh_abc123",
      key_prefix: "mh_abc123",
      tier: "agent",
      usage: {
        free_records_per_day: 500,
        price_usd_per_100_records: "0.001",
        billing: "monthly_usage",
      },
    });

    const res = await claimPOST(jsonRequest({ token: "claim_token_once" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.api_key).toBe("mh_abc123");
    expect(body.tier).toBe("agent");
    expect(body.usage.free_records_per_day).toBe(500);
    expect(mockClaimAgentCheckout).toHaveBeenCalledWith("claim_token_once");
  });
});

describe("GET /api/agent/checkout/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a checkout claim token", async () => {
    const res = await checkoutStatusGET(new Request("http://localhost/api/agent/checkout/status"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mockGetAgentCheckoutStatus).not.toHaveBeenCalled();
  });

  it("returns payment and claim state for agents polling Polar checkout", async () => {
    mockGetAgentCheckoutStatus.mockResolvedValue({
      checkout_id: "agentco_123",
      status: "paid",
      paid: true,
      claimed: false,
      provider: "Polar",
      merchant_of_record: true,
      claim_url: "https://mockhero.dev/api/agent/claim",
      next_action: "claim_api_key",
      pricing: {
        free_records_per_day: 500,
        price_usd_per_100_records: "0.001",
        billing: "monthly_usage",
      },
    });

    const res = await checkoutStatusGET(
      new Request("http://localhost/api/agent/checkout/status?token=claim_token_once")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("paid");
    expect(body.paid).toBe(true);
    expect(body.next_action).toBe("claim_api_key");
    expect(mockGetAgentCheckoutStatus).toHaveBeenCalledWith("claim_token_once");
  });

  it("also accepts POST for agents that avoid token-bearing URLs", async () => {
    mockGetAgentCheckoutStatus.mockResolvedValue({
      checkout_id: "agentco_123",
      status: "pending",
      paid: false,
      claimed: false,
      provider: "Polar",
      merchant_of_record: true,
      claim_url: "https://mockhero.dev/api/agent/claim",
      next_action: "complete_checkout",
      pricing: {
        free_records_per_day: 500,
        price_usd_per_100_records: "0.001",
        billing: "monthly_usage",
      },
    });

    const res = await checkoutStatusPOST(jsonRequest({ token: "claim_token_once" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.next_action).toBe("complete_checkout");
    expect(mockGetAgentCheckoutStatus).toHaveBeenCalledWith("claim_token_once");
  });
});
