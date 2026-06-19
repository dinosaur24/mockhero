/**
 * POST /api/agent/checkout
 * Loginless Polar Checkout for AI agents. Polar remains Merchant of Record.
 */

import { NextResponse } from "next/server";
import { createAgentCheckout, AgentBillingError } from "@/lib/agent/billing";
import { internalError, validationError } from "@/lib/api/errors";

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return validationError("Invalid JSON in request body");
    }

    if (!isValidEmail(body.email)) {
      return validationError("email must be a valid billing email address");
    }

    const checkout = await createAgentCheckout({ email: body.email });
    return NextResponse.json(checkout);
  } catch (err) {
    if (err instanceof AgentBillingError) {
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
            next_action: "retry_checkout_creation_or_contact_support",
            provider: "Polar",
          },
        },
        { status: err.status }
      );
    }

    console.error("Agent checkout error:", err);
    return internalError("Failed to create agent checkout");
  }
}
