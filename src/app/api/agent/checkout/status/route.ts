/**
 * GET/POST /api/agent/checkout/status
 * Lets agents poll a Polar checkout using the claim token returned at checkout creation.
 */

import { NextResponse } from "next/server";
import { AgentBillingError, getAgentCheckoutStatus } from "@/lib/agent/billing";
import { internalError, validationError } from "@/lib/api/errors";

function isValidClaimToken(token: unknown): token is string {
  return typeof token === "string" && token.length >= 16 && token.length <= 256;
}

async function status(token: unknown) {
  if (!isValidClaimToken(token)) {
    return validationError("token must be a valid agent checkout claim token");
  }

  try {
    const result = await getAgentCheckoutStatus(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AgentBillingError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status }
      );
    }

    console.error("Agent checkout status error:", err);
    return internalError("Failed to fetch agent checkout status");
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  return status(token);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON in request body");
  }

  return status(body.token);
}
