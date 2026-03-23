/**
 * Unit tests for dashboard API routes: create-key and revoke-key.
 * Mocks Clerk auth, key generation, and Supabase admin client.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

const mockGenerateApiKey = vi.fn();
vi.mock("@/lib/api/keys", () => ({
  generateApiKey: (...args: unknown[]) => mockGenerateApiKey(...args),
}));

// Build a chainable Supabase mock that records calls and resolves to
// configurable { data, error } at the end of the chain.
const supabaseResult = { data: null as unknown, error: null as unknown };

const supabaseChain: Record<string, ReturnType<typeof vi.fn>> = {
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
};

// Every method returns the chain itself, except `single` which resolves.
for (const key of Object.keys(supabaseChain)) {
  if (key === "single") {
    supabaseChain[key].mockImplementation(() => supabaseResult);
  } else {
    supabaseChain[key].mockReturnValue(supabaseChain);
  }
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => supabaseChain,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import { POST as createKeyPOST } from "../create-key/route";
import { POST as revokeKeyPOST } from "../revoke-key/route";

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
// Tests — POST /api/dashboard/create-key
// ---------------------------------------------------------------------------

describe("POST /api/dashboard/create-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain returns after clearAllMocks
    for (const key of Object.keys(supabaseChain)) {
      if (key === "single") {
        supabaseChain[key].mockImplementation(() => supabaseResult);
      } else {
        supabaseChain[key].mockReturnValue(supabaseChain);
      }
    }
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await createKeyPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 200 with rawKey and keyPrefix when authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockGenerateApiKey.mockResolvedValue({
      rawKey: "mh_testrawapikey1234567890abcdef",
      keyPrefix: "mh_testrawap",
    });

    const res = await createKeyPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.rawKey).toBe("mh_testrawapikey1234567890abcdef");
    expect(body.keyPrefix).toBe("mh_testrawap");
    expect(mockGenerateApiKey).toHaveBeenCalledWith("user_123", undefined);
  });

  it("returns 500 when key generation fails", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockGenerateApiKey.mockRejectedValue(new Error("DB insert failed"));

    const res = await createKeyPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});

// ---------------------------------------------------------------------------
// Tests — POST /api/dashboard/revoke-key
// ---------------------------------------------------------------------------

describe("POST /api/dashboard/revoke-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseResult.data = null;
    supabaseResult.error = null;
    // Reset chain returns after clearAllMocks
    for (const key of Object.keys(supabaseChain)) {
      if (key === "single") {
        supabaseChain[key].mockImplementation(() => supabaseResult);
      } else {
        supabaseChain[key].mockReturnValue(supabaseChain);
      }
    }
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await revokeKeyPOST(jsonRequest({ keyId: "key_abc" }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 when keyId is missing from body", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const res = await revokeKeyPOST(jsonRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("keyId");
  });

  it("returns 200 with { success: true } when valid", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    supabaseResult.data = { id: "key_abc" };
    supabaseResult.error = null;

    const res = await revokeKeyPOST(jsonRequest({ keyId: "key_abc" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(supabaseChain.from).toHaveBeenCalledWith("api_keys");
  });

  it("returns 400 when key not found or already revoked", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    supabaseResult.data = null;
    supabaseResult.error = { message: "Row not found" };

    const res = await revokeKeyPOST(jsonRequest({ keyId: "key_nonexistent" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("not found");
  });
});
