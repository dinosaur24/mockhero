-- Track MCP discovery and tool-call funnel events for agent-first conversion.
-- No request bodies, API keys, claim tokens, or generated data are stored here.

CREATE TABLE IF NOT EXISTS public.mcp_tool_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  surface TEXT NOT NULL CHECK (surface IN ('chatgpt', 'agent')),
  method TEXT NOT NULL,
  tool_name TEXT,
  has_api_key BOOLEAN NOT NULL DEFAULT FALSE,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  is_error_result BOOLEAN NOT NULL DEFAULT FALSE,
  error_code TEXT,
  user_agent TEXT,
  origin TEXT
);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_events_created
  ON public.mcp_tool_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_events_surface_tool_created
  ON public.mcp_tool_events (surface, tool_name, created_at DESC);

ALTER TABLE public.mcp_tool_events ENABLE ROW LEVEL SECURITY;
