import { beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

vi.mock("x402-next", () => ({
  withX402: (handler: (request: Request) => Promise<Response>) => handler,
}));

import { POST } from "../route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/v1/generate/x402", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/generate/x402", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.X402_PAY_TO;
    delete process.env.ENABLE_DIRECT_X402;
  });

  it("returns 503 until the x402 receiving wallet is configured", async () => {
    const res = await POST(jsonRequest({
      tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
    }) as never);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("X402_NOT_CONFIGURED");
  });

  it("returns 503 when a wallet is configured but direct x402 is not explicitly enabled", async () => {
    process.env.X402_PAY_TO = "0x0000000000000000000000000000000000000000";

    const res = await POST(jsonRequest({
      tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
    }) as never);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("X402_NOT_CONFIGURED");
    expect(body.error.message).toContain("Polar Checkout");
  });

  it("rejects prompt mode on the paid agent endpoint", async () => {
    process.env.X402_PAY_TO = "0x0000000000000000000000000000000000000000";
    process.env.ENABLE_DIRECT_X402 = "true";

    const res = await POST(jsonRequest({ prompt: "10 German users" }) as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("Schema mode");
  });

  it("caps x402 schema generation to 100 records per request", async () => {
    process.env.X402_PAY_TO = "0x0000000000000000000000000000000000000000";
    process.env.ENABLE_DIRECT_X402 = "true";

    const res = await POST(jsonRequest({
      tables: [{ name: "users", count: 101, fields: [{ name: "id", type: "uuid" }] }],
    }) as never);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.error.message).toContain("100 records");
  });

  it("generates data after x402 wrapper approval", async () => {
    process.env.X402_PAY_TO = "0x0000000000000000000000000000000000000000";
    process.env.ENABLE_DIRECT_X402 = "true";

    const res = await POST(jsonRequest({
      tables: [
        {
          name: "users",
          count: 2,
          fields: [
            { name: "id", type: "uuid" },
            { name: "email", type: "email" },
          ],
        },
      ],
      format: "json",
    }) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.users).toHaveLength(2);
    expect(body.meta.total_records).toBe(2);
  });
});
