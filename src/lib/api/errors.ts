/**
 * Standardized API error responses.
 * Shape: { error: { code, message, details? } }
 */

import { NextResponse } from "next/server";

interface ErrorDetail {
  field?: string;
  message: string;
  suggestion?: string;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    next_action?: string;
    docs_url?: string;
    mcp_agent_endpoint?: string;
    checkout_tool?: string;
    claim_tool?: string;
  };
}

type ErrorOptions = {
  details?: ErrorDetail[];
  nextAction?: string;
  docsUrl?: string;
  mcpAgentEndpoint?: string;
  checkoutTool?: string;
  claimTool?: string;
};

function errorResponse(
  status: number,
  code: string,
  message: string,
  detailsOrOptions?: ErrorDetail[] | ErrorOptions
): NextResponse<ApiError> {
  const options: ErrorOptions = Array.isArray(detailsOrOptions)
    ? { details: detailsOrOptions }
    : detailsOrOptions ?? {};

  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(options.details && options.details.length > 0 ? { details: options.details } : {}),
        ...(options.nextAction ? { next_action: options.nextAction } : {}),
        ...(options.docsUrl ? { docs_url: options.docsUrl } : {}),
        ...(options.mcpAgentEndpoint ? { mcp_agent_endpoint: options.mcpAgentEndpoint } : {}),
        ...(options.checkoutTool ? { checkout_tool: options.checkoutTool } : {}),
        ...(options.claimTool ? { claim_tool: options.claimTool } : {}),
      },
    },
    { status }
  );
}

export function validationError(message: string, details?: ErrorDetail[]) {
  return errorResponse(400, "VALIDATION_ERROR", message, details);
}

export function schemaError(message: string, details?: ErrorDetail[]) {
  return errorResponse(400, "SCHEMA_ERROR", message, details);
}

export function dependencyCycleError(cyclePath: string[]) {
  return errorResponse(400, "DEPENDENCY_CYCLE", `Circular dependency detected: ${cyclePath.join(" → ")}`, [
    { message: `Tables involved: ${cyclePath.join(", ")}` },
  ]);
}

export function unauthorizedError(message = "Invalid or missing API key") {
  return errorResponse(401, "UNAUTHORIZED", message, {
    nextAction:
      "Provide a MockHero API key. Agents without a key should call create_agent_checkout, complete Polar checkout, then call claim_agent_api_key and retry.",
    docsUrl: "https://mockhero.dev/docs/authentication",
    mcpAgentEndpoint: "https://mockhero.dev/mcp/agent",
    checkoutTool: "create_agent_checkout",
    claimTool: "claim_agent_api_key",
  });
}

export function rateLimitError(message: string, details?: ErrorDetail[]) {
  return errorResponse(429, "RATE_LIMIT_EXCEEDED", message, {
    details: [
      ...(details ?? []),
      {
        message:
          "Reduce requested records, wait for the reset window, or use agent checkout for metered usage.",
      },
    ],
    nextAction:
      "Call estimate_agent_usage before retrying. If the user wants more records, use create_agent_checkout and claim_agent_api_key.",
    docsUrl: "https://mockhero.dev/agent-pricing.json",
    mcpAgentEndpoint: "https://mockhero.dev/mcp/agent",
    checkoutTool: "create_agent_checkout",
    claimTool: "claim_agent_api_key",
  });
}

export function payloadTooLargeError(message = "Request body too large. Maximum 1MB.") {
  return errorResponse(413, "PAYLOAD_TOO_LARGE", message);
}

export function internalError(message = "An unexpected error occurred") {
  return errorResponse(500, "INTERNAL_ERROR", message);
}

export function forbiddenFeatureError(feature: string, requiredTier: string) {
  return errorResponse(403, "FEATURE_REQUIRES_UPGRADE", `${feature} requires ${requiredTier} tier or above.`, {
    nextAction:
      "Use an API key for a plan that supports this feature, or use create_agent_checkout for agent metered generation.",
    docsUrl: "https://mockhero.dev/agent-pricing.json",
    mcpAgentEndpoint: "https://mockhero.dev/mcp/agent",
    checkoutTool: "create_agent_checkout",
    claimTool: "claim_agent_api_key",
  });
}

export function serviceUnavailableError(message = "Service temporarily unavailable") {
  return errorResponse(503, "SERVICE_UNAVAILABLE", message, {
    nextAction: "Retry later and check the health endpoint before retrying.",
    docsUrl: "https://mockhero.dev/api/v1/health",
  });
}
