import { handleMcpMessage } from "@/lib/mcp/mockhero-mcp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedOrigins = new Set([
  "https://chatgpt.com",
  "https://chat.openai.com",
  "https://platform.openai.com",
  "https://mockhero.dev",
]);

function configuredOrigins(): string[] {
  return (process.env.MOCKHERO_MCP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return allowedOrigins.has(origin) || configuredOrigins().includes(origin);
}

function corsHeaders(request?: Request): HeadersInit {
  const origin = request?.headers.get("origin");
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, content-type, accept, x-api-key, x-mockhero-api-key, mcp-protocol-version, mcp-session-id, last-event-id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(request: Request, body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request),
      "Cache-Control": "no-store",
      "MCP-Protocol-Version": "2025-11-25",
    },
  });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return jsonResponse(
      request,
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Origin is not allowed for MockHero MCP",
        },
      },
      403
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error: invalid JSON",
      },
    });
  }

  const response = await handleMcpMessage(request, body);
  if (response === null) {
    return new Response(null, {
      status: 202,
      headers: corsHeaders(request),
    });
  }

  return jsonResponse(request, response);
}

export async function GET(request: Request) {
  return Response.json(
    {
      error: "MockHero MCP does not expose a server-initiated SSE stream. Use POST with JSON-RPC messages.",
    },
    {
      status: 405,
      headers: {
        ...corsHeaders(request),
        Allow: "POST, OPTIONS",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
