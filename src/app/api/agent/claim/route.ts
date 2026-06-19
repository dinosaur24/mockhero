/**
 * POST /api/agent/claim
 * Claims a paid agent checkout and returns the API key once.
 */

import { NextResponse } from "next/server";
import { claimAgentCheckout, AgentBillingError } from "@/lib/agent/billing";
import { internalError, validationError } from "@/lib/api/errors";

function claimError(status: number, code: string, message: string) {
  const nextAction =
    code === "PAYMENT_REQUIRED"
      ? "complete_checkout_then_retry_claim"
      : code === "AGENT_CHECKOUT_ALREADY_CLAIMED"
        ? "use_existing_api_key_or_create_new_checkout"
        : code === "AGENT_CHECKOUT_NOT_FOUND"
          ? "create_agent_checkout"
          : "retry_or_contact_support";

  return NextResponse.json(
    {
      error: {
        code,
        message,
        next_action: nextAction,
        checkout_status_tool: "check_agent_checkout_status",
        checkout_tool: "create_agent_checkout",
      },
    },
    { status }
  );
}

async function claim(token: unknown) {
  if (typeof token !== "string" || token.length < 16 || token.length > 256) {
    return validationError("token must be a valid agent checkout claim token");
  }

  try {
    const result = await claimAgentCheckout(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AgentBillingError) {
      return claimError(err.status, err.code, err.message);
    }

    console.error("Agent claim error:", err);
    return internalError("Failed to claim agent checkout");
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON in request body");
  }

  return claim(body.token);
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  return claim(token);
}
