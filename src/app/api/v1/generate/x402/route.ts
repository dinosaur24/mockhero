/**
 * POST /api/v1/generate/x402
 * Agent-native paid generation endpoint using x402.
 *
 * This endpoint is intentionally schema-only and capped at 100 records/request.
 * Prompt mode is excluded here to avoid unauthenticated LLM cost exposure.
 */

import { NextResponse, type NextRequest } from "next/server";
import { withX402, type RouteConfig } from "x402-next";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { MOCKHERO_AGENT_PROFILE } from "@/lib/agent/profile";
import {
  dependencyCycleError,
  internalError,
  payloadTooLargeError,
  rateLimitError,
  schemaError,
  validationError,
} from "@/lib/api/errors";

export const maxDuration = 30;

const X402_MAX_RECORDS = MOCKHERO_AGENT_PROFILE.pricing.x402.maxRecordsPerRequest;

function isProtocolUrl(url: string): url is `${string}://${string}` {
  return url.includes("://");
}

function x402NotConfigured() {
  return NextResponse.json(
    {
      error: {
        code: "X402_NOT_CONFIGURED",
        message:
          "Direct x402 payments are disabled. Use Polar Checkout as the Merchant of Record, or set ENABLE_DIRECT_X402=true and X402_PAY_TO only after direct crypto tax/compliance handling is approved.",
      },
    },
    { status: 503 },
  );
}

function x402RouteConfig(): RouteConfig {
  return {
    price: `$${MOCKHERO_AGENT_PROFILE.pricing.x402.priceUsdPerRequest}`,
    network: (process.env.X402_NETWORK ?? MOCKHERO_AGENT_PROFILE.pricing.x402.network) as
      | "base"
      | "base-sepolia",
    config: {
      description:
        "Generate realistic relational synthetic test data from a JSON schema.",
      mimeType: "application/json",
      resource: MOCKHERO_AGENT_PROFILE.pricing.x402.endpoint,
    },
  };
}

function x402FacilitatorConfig() {
  const url = process.env.X402_FACILITATOR_URL;
  if (!url) {
    return undefined;
  }
  if (!isProtocolUrl(url)) {
    console.warn("Ignoring X402_FACILITATOR_URL because it is not an absolute URL");
    return undefined;
  }
  return { url };
}

async function generatePaidData(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    const text = await request.text();
    if (text.length > 1_000_000) {
      return payloadTooLargeError();
    }
    body = JSON.parse(text);
  } catch {
    return validationError("Invalid JSON in request body");
  }

  if (typeof body.prompt === "string" || typeof body.template === "string") {
    return validationError(
      "Schema mode is required on the x402 endpoint. Use /api/v1/generate with an API key for prompt or template mode.",
    );
  }

  const parsed = parseSchema(body);
  if (!parsed.success) {
    return schemaError("Schema validation failed", parsed.errors);
  }

  const totalRecords = parsed.data.tables.reduce((sum, table) => sum + table.count, 0);
  if (totalRecords > X402_MAX_RECORDS) {
    return rateLimitError(
      `x402 endpoint allows up to ${X402_MAX_RECORDS} records per request. Requested ${totalRecords.toLocaleString("en-US")} records.`,
    );
  }

  let result: Awaited<ReturnType<typeof generate>>;
  try {
    result = await generate(parsed.data);
  } catch (err) {
    console.error("x402 generate endpoint error:", err);
    return internalError("Data generation failed");
  }

  if (!result.success) {
    if ("cycle" in result) {
      return dependencyCycleError(result.cycle);
    }
    if ("errors" in result) {
      return schemaError("Generation failed", result.errors);
    }
    return internalError("Data generation failed");
  }

  try {
    const formatted = formatOutput(
      result.result,
      parsed.data.tables,
      parsed.data.format ?? "json",
      parsed.data.sql_dialect,
    );

    return NextResponse.json(formatted.body, {
      headers: {
        "X-MockHero-Payment-Rail": "x402",
      },
    });
  } catch (err) {
    console.error("x402 generate endpoint formatting error:", err);
    return internalError("Output formatting failed");
  }
}

export async function POST(request: NextRequest) {
  const payTo = process.env.X402_PAY_TO;
  if (process.env.ENABLE_DIRECT_X402 !== "true" || !payTo) {
    return x402NotConfigured();
  }

  const handler = withX402(
    generatePaidData,
    payTo as never,
    x402RouteConfig(),
    x402FacilitatorConfig(),
  );

  return handler(request);
}
