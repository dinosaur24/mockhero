/**
 * Unit tests for billing API routes: checkout and manage-subscription.
 * Mocks Clerk auth/clerkClient, Polar billing functions, and Supabase admin client.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = vi.fn();
const mockClerkUsersGetUser = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  clerkClient: () =>
    Promise.resolve({ users: { getUser: mockClerkUsersGetUser } }),
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: () => undefined,
    }),
}));

const mockCreateCheckoutSession = vi.fn();
const mockCancelSubscription = vi.fn();

vi.mock("@/lib/polar/client", () => ({
  createCheckoutSession: (...args: unknown[]) =>
    mockCreateCheckoutSession(...args),
  cancelSubscription: (...args: unknown[]) =>
    mockCancelSubscription(...args),
}));

// Build a chainable Supabase mock that records calls and resolves to
// configurable { data, error } at the end of the chain.
const supabaseResult = { data: null as unknown, error: null as unknown };

const supabaseChain: Record<string, ReturnType<typeof vi.fn>> = {
  from: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
};

function resetSupabaseChain() {
  for (const key of Object.keys(supabaseChain)) {
    if (key === "maybeSingle" || key === "single") {
      supabaseChain[key].mockImplementation(() => supabaseResult);
    } else {
      supabaseChain[key].mockReturnValue(supabaseChain);
    }
  }
}

resetSupabaseChain();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => supabaseChain,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import { POST as checkoutPOST } from "../checkout/route";
import { POST as manageSubPOST } from "../manage-subscription/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests — POST /api/dashboard/checkout
// ---------------------------------------------------------------------------

describe("POST /api/dashboard/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseResult.data = null;
    supabaseResult.error = null;
    resetSupabaseChain();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await checkoutPOST(jsonRequest({ tier: "pro" }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 when tier is missing", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const res = await checkoutPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("tier");
  });

  it("returns 400 when tier is invalid", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const res = await checkoutPOST(jsonRequest({ tier: "enterprise" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("tier");
  });

  it("returns 400 when user has no email", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockClerkUsersGetUser.mockResolvedValue({ emailAddresses: [] });

    const res = await checkoutPOST(jsonRequest({ tier: "pro" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("email");
  });

  it("returns 200 with checkout URL on success", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockClerkUsersGetUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });
    mockCreateCheckoutSession.mockResolvedValue({
      id: "checkout_abc",
      url: "https://checkout.polar.sh/abc",
    });

    const res = await checkoutPOST(jsonRequest({ tier: "pro" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://checkout.polar.sh/abc");
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: "pro",
        customerEmail: "test@example.com",
        userId: "user_123",
      })
    );
  });

  it("returns 200 for scale tier as well", async () => {
    mockAuth.mockResolvedValue({ userId: "user_456" });
    mockClerkUsersGetUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: "scale@example.com" }],
    });
    mockCreateCheckoutSession.mockResolvedValue({
      id: "checkout_def",
      url: "https://checkout.polar.sh/def",
    });

    const res = await checkoutPOST(jsonRequest({ tier: "scale" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://checkout.polar.sh/def");
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: "scale",
        customerEmail: "scale@example.com",
        userId: "user_456",
      })
    );
  });

  it("returns 500 when Polar API fails", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockClerkUsersGetUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });
    mockCreateCheckoutSession.mockRejectedValue(
      new Error("Polar checkout failed (502): Bad Gateway")
    );

    const res = await checkoutPOST(jsonRequest({ tier: "pro" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toContain("checkout");
  });
});

// ---------------------------------------------------------------------------
// Tests — POST /api/dashboard/manage-subscription
// ---------------------------------------------------------------------------

describe("POST /api/dashboard/manage-subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseResult.data = null;
    supabaseResult.error = null;
    resetSupabaseChain();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await manageSubPOST(jsonRequest({ action: "cancel" }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it('returns 400 when action is not "cancel"', async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const res = await manageSubPOST(jsonRequest({ action: "pause" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("cancel");
  });

  it("returns 400 when action is missing", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const res = await manageSubPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("cancel");
  });

  it("returns 400 when no active subscription found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    supabaseResult.data = null;
    supabaseResult.error = null;

    const res = await manageSubPOST(jsonRequest({ action: "cancel" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("subscription");
  });

  it("returns 200 on successful cancellation", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    supabaseResult.data = { polar_subscription_id: "polar_sub_abc" };
    supabaseResult.error = null;
    mockCancelSubscription.mockResolvedValue(undefined);

    const res = await manageSubPOST(jsonRequest({ action: "cancel" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockCancelSubscription).toHaveBeenCalledWith("polar_sub_abc");
    expect(supabaseChain.from).toHaveBeenCalledWith("subscriptions");
  });

  it("returns 500 when Polar cancel fails", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    supabaseResult.data = { polar_subscription_id: "polar_sub_abc" };
    supabaseResult.error = null;
    mockCancelSubscription.mockRejectedValue(
      new Error("Polar cancel failed (500): Internal Server Error")
    );

    const res = await manageSubPOST(jsonRequest({ action: "cancel" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toContain("subscription");
  });
});
