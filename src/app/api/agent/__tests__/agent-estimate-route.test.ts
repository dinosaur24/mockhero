import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockValidateApiKey, mockCreateAdminClient } = vi.hoisted(() => ({
  mockValidateApiKey: vi.fn(),
  mockCreateAdminClient: vi.fn(),
}));

vi.mock("@/lib/api/middleware", () => ({
  validateApiKey: (...args: unknown[]) => mockValidateApiKey(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

import { POST as estimatePOST } from "../estimate/route";

function jsonRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request("http://localhost/api/agent/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agent/estimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateApiKey.mockResolvedValue(null);
  });

  it("estimates structured schema cost without login", async () => {
    const res = await estimatePOST(
      jsonRequest({
        daily_used_before: 450,
        tables: [
          {
            name: "users",
            count: 200,
            fields: [
              { name: "id", type: "uuid" },
              { name: "email", type: "email" },
            ],
          },
        ],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mode).toBe("schema");
    expect(body.authenticated).toBe(false);
    expect(body.estimate.requested_records).toBe(200);
    expect(body.estimate.billable_records).toBe(150);
    expect(body.estimate.billable_units_100).toBe(2);
    expect(body.estimate.estimated_cost_usd).toBe("0.002");
  });

  it("uses authenticated daily usage when an agent API key is supplied", async () => {
    mockValidateApiKey.mockResolvedValue({
      user_id: "agent_123",
      api_key_id: "key_123",
      tier: "agent",
    });
    mockCreateAdminClient.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { records_used: 600 }, error: null }),
            }),
          }),
        }),
      }),
    });

    const res = await estimatePOST(
      jsonRequest(
        {
          tables: [
            {
              name: "events",
              count: 50,
              fields: [{ name: "id", type: "uuid" }],
            },
          ],
        },
        { Authorization: "Bearer mh_agent" }
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.authenticated).toBe(true);
    expect(body.tier).toBe("agent");
    expect(body.estimate.daily_used_before).toBe(600);
    expect(body.estimate.billable_records).toBe(50);
    expect(body.estimate.estimated_cost_usd).toBe("0.001");
  });

  it("requires estimated_records when estimating a prompt without converting it", async () => {
    const res = await estimatePOST(jsonRequest({ prompt: "users and orders" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("estimated_records");
  });
});
