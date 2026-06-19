import { createAdminClient } from "@/lib/supabase/admin";

type McpTelemetryEvent = {
  surface: "chatgpt" | "agent";
  method: string;
  toolName?: string;
  hasApiKey: boolean;
  success: boolean;
  isErrorResult?: boolean;
  errorCode?: string;
  request: Request;
};

function truncate(value: string | null, max: number): string | null {
  if (!value) return null;
  return value.length > max ? value.slice(0, max) : value;
}

export async function recordMcpTelemetry(event: McpTelemetryEvent): Promise<void> {
  if (process.env.NODE_ENV === "test" && process.env.ENABLE_MCP_TELEMETRY_IN_TEST !== "true") {
    return;
  }

  try {
    const supabase = createAdminClient();
    await supabase.from("mcp_tool_events").insert({
      surface: event.surface,
      method: event.method,
      tool_name: event.toolName ?? null,
      has_api_key: event.hasApiKey,
      success: event.success,
      is_error_result: event.isErrorResult ?? false,
      error_code: event.errorCode ?? null,
      user_agent: truncate(event.request.headers.get("user-agent"), 255),
      origin: truncate(event.request.headers.get("origin"), 255),
    });
  } catch (err) {
    console.warn("[mcp telemetry] skipped", err instanceof Error ? err.message : err);
  }
}
