import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, OPTIONS, POST } from "../route";

function rpcRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request("https://mockhero.dev/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /mcp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes as a Streamable HTTP MCP server", async () => {
    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "vitest", version: "0.0.0" },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(body).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: "2025-11-25",
        serverInfo: { name: "MockHero" },
        capabilities: { tools: { listChanged: false } },
      },
    });
    expect(body.result.instructions).toMatch(/estimate/i);
    expect(body.result.instructions).toContain("Polar");
  });

  it("lists generation and Polar checkout tools for ChatGPT", async () => {
    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: "tools",
        method: "tools/list",
      })
    );
    const body = await res.json();
    const names = body.result.tools.map((tool: { name: string }) => tool.name);

    expect(res.status).toBe(200);
    expect(names).toEqual([
      "estimate_agent_usage",
      "create_agent_checkout",
      "check_agent_checkout_status",
      "claim_agent_api_key",
      "generate_test_data",
      "generate_from_template",
      "detect_schema",
      "list_field_types",
      "list_templates",
    ]);
    expect(body.result.tools[0].inputSchema.type).toBe("object");
  });

  it("lets agents estimate cost without a MockHero API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          service: "MockHero",
          estimate: { requested_records: 200, billable_records: 0, estimated_cost_usd: "0.000" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "estimate_agent_usage",
          arguments: {
            daily_used_before: 0,
            tables: [{ name: "users", count: 200, fields: [{ name: "id", type: "uuid" }] }],
          },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mockhero.dev/api/agent/estimate",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"daily_used_before\":0"),
      })
    );
    expect(body.result.structuredContent.estimate.requested_records).toBe(200);
    expect(body.result.content[0].text).toContain("\"estimated_cost_usd\"");
  });

  it("passes a bearer API key through to billable generation calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { users: [{ id: "u1" }] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await POST(
      rpcRequest(
        {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "generate_test_data",
            arguments: {
              tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
            },
          },
        },
        { Authorization: "Bearer mh_agent_test" }
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mockhero.dev/api/v1/generate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "mh_agent_test" }),
      })
    );
    expect(body.result.isError).toBeUndefined();
    expect(body.result.structuredContent.data.users[0].id).toBe("u1");
  });

  it("accepts a claimed API key as a tool argument for no-auth MCP clients", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { users: [{ id: "u2" }] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 33,
        method: "tools/call",
        params: {
          name: "generate_test_data",
          arguments: {
            api_key: "mh_claimed_test",
            tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
          },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mockhero.dev/api/v1/generate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "mh_claimed_test" }),
        body: expect.not.stringContaining("api_key"),
      })
    );
    expect(body.result.structuredContent.data.users[0].id).toBe("u2");
  });

  it("returns a tool-level auth error before generating without an API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "generate_test_data",
          arguments: {
            tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
          },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain("MockHero API key");
    expect(body.result.content[0].text).toContain("create_agent_checkout");
  });

  it("accepts initialized notifications with 202 and no JSON body", async () => {
    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      })
    );

    expect(res.status).toBe(202);
    expect(await res.text()).toBe("");
  });

  it("reports unknown JSON-RPC methods", async () => {
    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: "bad",
        method: "mockhero/nope",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error.code).toBe(-32601);
  });
});

describe("MCP transport helper methods", () => {
  it("returns 405 for server-initiated GET streams when SSE is not offered", async () => {
    const res = await GET(new Request("https://mockhero.dev/mcp", { method: "GET" }));

    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
  });

  it("answers CORS preflight for MCP clients", async () => {
    const res = await OPTIONS(
      new Request("https://mockhero.dev/mcp", {
        method: "OPTIONS",
        headers: { Origin: "https://chatgpt.com" },
      })
    );

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
  });
});
