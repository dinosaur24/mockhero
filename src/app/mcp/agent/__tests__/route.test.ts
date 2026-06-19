import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

function rpcRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request("https://mockhero.dev/mcp/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /mcp/agent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes as the full agent MCP server", async () => {
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
    expect(body.result.serverInfo.name).toBe("MockHero Agent MCP");
    expect(body.result.instructions).toContain("loginless Polar checkout");
    expect(body.result.instructions).toContain("api_key tool argument");
  });

  it("lists the full checkout and API-key-capable agent tools", async () => {
    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: "tools",
        method: "tools/list",
      })
    );
    const body = await res.json();
    const names = body.result.tools.map((tool: { name: string }) => tool.name);
    const generateTool = body.result.tools.find(
      (tool: { name: string }) => tool.name === "generate_test_data"
    );

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
    expect(generateTool.inputSchema.properties.api_key.description).toContain("no-auth MCP clients");
  });

  it("generates a small proof-of-work preview without an API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 2,
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
    expect(body.result.isError).toBeUndefined();
    expect(body.result.structuredContent.data.users).toHaveLength(1);
    expect(body.result.structuredContent.meta.total_records).toBe(1);
  });

  it("tells no-key agents how to start checkout for prompt generation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: "prompt",
        method: "tools/call",
        params: {
          name: "generate_test_data",
          arguments: {
            prompt: "Generate 25 realistic SaaS users.",
          },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain("create_agent_checkout");
    expect(body.result.structuredContent.details.checkout_tool).toBe("create_agent_checkout");
  });

  it("tells no-key agents how to start checkout for larger generation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: "large",
        method: "tools/call",
        params: {
          name: "generate_test_data",
          arguments: {
            tables: [{ name: "users", count: 101, fields: [{ name: "id", type: "uuid" }] }],
          },
        },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain("create_agent_checkout");
    expect(body.result.structuredContent.details.free_record_limit).toBe(100);
  });

  it("accepts api_key as a tool argument and strips it before proxying generation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { users: [{ id: "u1" }] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "generate_test_data",
          arguments: {
            api_key: "mh_agent_arg",
            tables: [{ name: "users", count: 1, fields: [{ name: "id", type: "uuid" }] }],
          },
        },
      })
    );
    const body = await res.json();
    const proxiedBody = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.body as string
    );

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mockhero.dev/api/v1/generate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "mh_agent_arg" }),
      })
    );
    expect(proxiedBody.api_key).toBeUndefined();
    expect(body.result.structuredContent.data.users[0].id).toBe("u1");
  });

  it("proxies loginless Polar checkout creation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://polar.sh/checkout/test",
          claim_token: "claim_test",
          claim_url: "https://mockhero.dev/api/agent/claim",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await POST(
      rpcRequest({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "create_agent_checkout",
          arguments: { email: "agent@example.com" },
        },
      })
    );
    const body = await res.json();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://mockhero.dev/api/agent/checkout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "agent@example.com" }),
      })
    );
    expect(body.result.structuredContent.claim_token).toBe("claim_test");
  });
});
