/**
 * POST /api/v1/generate
 * Main data generation endpoint.
 * Authenticated via x-api-key header. Rate limited by tier.
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import { checkRateLimit, rateLimitHeaders, releaseReservedRecords } from "@/lib/api/rate-limiter";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { convertPromptToSchema } from "@/lib/engine/prompt-to-schema";
import { generateFromTemplate } from "@/lib/engine/templates";
import {
  unauthorizedError,
  schemaError,
  dependencyCycleError,
  rateLimitError,
  validationError,
  internalError,
  payloadTooLargeError,
  forbiddenFeatureError,
} from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliverWebhook } from "@/lib/api/webhooks";
import { TIER_LIMITS } from "@/lib/utils/constants";
import { checkUsageAlerts } from "@/lib/email/usage-alerts";

// Allow up to 30s for large generation requests
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // 1. Validate API key
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    // 2. Parse request body
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

    // 3. Handle three input modes:
    //    Mode 1: Template — { "template": "ecommerce", "scale": 2, "locale": "de" }
    //    Mode 2: Prompt — { "prompt": "50 users and 200 orders" }
    //    Mode 3: Structured — { "tables": [...] }
    let parsed: ReturnType<typeof parseSchema> extends infer R ? R : never;

    if (typeof body.template === "string") {
      // Mode 1: Template mode
      try {
        const templateRequest = generateFromTemplate({
          template: body.template,
          scale: typeof body.scale === "number" ? body.scale : 1,
          locale: typeof body.locale === "string" ? (body.locale as any) : undefined,
          format: typeof body.format === "string" ? (body.format as any) : undefined,
          sql_dialect: typeof body.sql_dialect === "string" ? (body.sql_dialect as any) : undefined,
          seed: typeof body.seed === "number" ? body.seed : undefined,
        });
        parsed = { success: true, data: templateRequest };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown template error";
        return validationError(message);
      }
    } else if (typeof body.prompt === "string" && !body.tables) {
      // Mode 2: Prompt mode (plain English → schema conversion)
      if (body.prompt.length > 2000) {
        return validationError("Prompt must be 2,000 characters or fewer");
      }
      const conversion = await convertPromptToSchema(body.prompt);

      if (!conversion.success) {
        return NextResponse.json(
          {
            error: {
              code: "PROMPT_CONVERSION_FAILED",
              message: conversion.error ?? "Failed to convert prompt to schema",
              ...(conversion.raw_output ? { raw_output: conversion.raw_output } : {}),
              ...(conversion.validation_errors ? { details: conversion.validation_errors } : {}),
            },
          },
          { status: 422 }
        );
      }

      // Apply format/seed overrides from the original request
      if (body.format) conversion.schema.format = body.format as typeof conversion.schema.format;
      if (body.seed != null) conversion.schema.seed = body.seed as number;
      if (body.sql_dialect) conversion.schema.sql_dialect = body.sql_dialect as typeof conversion.schema.sql_dialect;

      parsed = { success: true, data: conversion.schema };
    } else {
      // Mode 3: Structured schema
      parsed = parseSchema(body);
    }

    if (!parsed.success) {
      return schemaError("Schema validation failed", parsed.errors);
    }

    // 4. Feature gating — enforce tier restrictions
    const requestedFormat = parsed.data.format ?? "json";
    const requestedSeed = parsed.data.seed;

    if (user.tier === "free") {
      // Free tier: JSON only
      if (requestedFormat === "csv" || requestedFormat === "sql") {
        return forbiddenFeatureError("CSV and SQL output", "Pro");
      }
      // Free tier: no reproducible seeds
      if (requestedSeed != null) {
        return forbiddenFeatureError("Reproducible seeds", "Pro");
      }
    }

    // 5. Calculate total records requested
    const totalRecords = parsed.data.tables.reduce((sum, t) => sum + t.count, 0);

    // Check rate limits
    const rateCheck = await checkRateLimit(
      user.user_id,
      user.tier,
      totalRecords
    );

    if (!rateCheck.allowed) {
      const response = rateLimitError(rateCheck.reason);
      if (rateCheck.retryAfter) {
        response.headers.set("Retry-After", String(rateCheck.retryAfter));
      }
      // Include rate limit headers on 429 so developers can programmatically
      // check their limits without needing a separate API call
      response.headers.set("X-RateLimit-Limit", String(
        TIER_LIMITS[user.tier].dailyRecords
      ));
      return response;
    }

    // 6. Generate data (records already reserved atomically in rate limiter)
    let result: Awaited<ReturnType<typeof generate>>;
    try {
      result = await generate(parsed.data);
    } catch (err) {
      releaseReservedRecords(user.user_id, totalRecords).catch(() => {});
      console.error("Generate endpoint error (generation):", err);
      return internalError("Data generation failed");
    }

    if (!result.success) {
      // Release reserved records since generation failed
      releaseReservedRecords(user.user_id, totalRecords).catch(() => {});

      if ("cycle" in result) {
        return dependencyCycleError(result.cycle);
      }
      if ("errors" in result) {
        return schemaError("Generation failed", result.errors);
      }
      return internalError("Data generation failed");
    }

    // 7. Format output
    let formatted: ReturnType<typeof formatOutput>;
    try {
      formatted = formatOutput(
        result.result,
        parsed.data.tables,
        parsed.data.format ?? "json",
        parsed.data.sql_dialect
      );
    } catch (err) {
      releaseReservedRecords(user.user_id, totalRecords).catch(() => {});
      console.error("Generate endpoint error (formatting):", err);
      return internalError("Output formatting failed");
    }

    // 8. Deliver webhook (Scale tier, fire-and-forget)
    if (user.tier === "scale") {
      deliverWebhook(user.user_id, "generation.completed", {
        event: "generation.completed",
        data: formatted.body,
        meta: { records: totalRecords, tables: parsed.data.tables.map(t => t.name), format: requestedFormat },
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    // 9. Log detailed usage (fire-and-forget — daily count already reserved)
    logUsage(user, totalRecords, parsed.data).catch((err) => {
      console.error("Usage logging failed:", err);
    });

    // 10. Check usage alerts (fire-and-forget — sends warning/limit emails)
    checkUsageAlerts(user.user_id, rateCheck.dailyUsed, rateCheck.dailyLimit, user.tier).catch(() => {});

    // 11. Return response with rate limit headers
    // Note: All formats (JSON, CSV, SQL) return JSON envelopes, so
    // NextResponse.json() is correct for all cases. The Content-Type
    // is always application/json — CSV/SQL strings are wrapped in the
    // JSON response body, not sent as raw text.
    const headers = rateLimitHeaders(rateCheck);

    return NextResponse.json(formatted.body, { headers });
  } catch (err) {
    console.error("Generate endpoint error:", err);
    return internalError();
  }
}

/** Log detailed usage to Supabase (fire-and-forget).
 *  Daily record counts are already reserved atomically in the rate limiter.
 *  This only logs the detailed usage_logs entry for analytics. */
async function logUsage(
  user: { user_id: string; api_key_id: string },
  totalRecords: number,
  request: { tables: { name: string }[]; format?: string; locale?: string }
) {
  const supabase = createAdminClient();

  await supabase.from("usage_logs").insert({
    user_id: user.user_id,
    api_key_id: user.api_key_id,
    records_generated: totalRecords,
    tables_count: request.tables.length,
    format: request.format ?? "json",
    locale: request.locale ?? "en",
  });
}
