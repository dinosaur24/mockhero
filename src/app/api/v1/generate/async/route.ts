/**
 * POST /api/v1/generate/async
 * Async (bulk) data generation — Scale tier only.
 * Creates a job, processes it after the response is sent via next/after(),
 * and returns a 202 with the job ID immediately.
 */

import { NextResponse } from "next/server";
import { after } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import { checkRateLimit, rateLimitHeaders, releaseReservedRecords } from "@/lib/api/rate-limiter";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { convertPromptToSchema } from "@/lib/engine/prompt-to-schema";
import { generateFromTemplate } from "@/lib/engine/templates";
import {
  unauthorizedError,
  validationError,
  schemaError,
  payloadTooLargeError,
  forbiddenFeatureError,
  internalError,
} from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliverWebhook } from "@/lib/api/webhooks";

// Allow up to 300s for bulk generation
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    // 1. Validate API key
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    // 2. Scale tier only
    if (user.tier !== "scale") {
      return forbiddenFeatureError("Async bulk generation", "Scale");
    }

    // 3. Parse request body
    let body: Record<string, unknown>;
    try {
      const text = await request.text();
      if (text.length > 5_000_000) {
        return payloadTooLargeError("Request body too large. Maximum 5MB for async requests.");
      }
      body = JSON.parse(text);
    } catch {
      return validationError("Invalid JSON in request body");
    }

    // 4. Parse schema (same 3 modes as sync endpoint)
    let parsed: ReturnType<typeof parseSchema>;

    if (typeof body.template === "string") {
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
      const conversion = await convertPromptToSchema(body.prompt);
      if (!conversion.success) {
        return NextResponse.json(
          {
            error: {
              code: "PROMPT_CONVERSION_FAILED",
              message: conversion.error ?? "Failed to convert prompt to schema",
            },
          },
          { status: 422 }
        );
      }
      if (body.format) conversion.schema.format = body.format as typeof conversion.schema.format;
      if (body.seed != null) conversion.schema.seed = body.seed as number;
      if (body.sql_dialect) conversion.schema.sql_dialect = body.sql_dialect as typeof conversion.schema.sql_dialect;
      parsed = { success: true, data: conversion.schema };
    } else {
      parsed = parseSchema(body);
    }

    if (!parsed.success) {
      return schemaError("Schema validation failed", parsed.errors);
    }

    // 5. Calculate total records and check rate limit
    const totalRecords = parsed.data.tables.reduce((sum, t) => sum + t.count, 0);

    const rateCheck = await checkRateLimit(
      user.user_id,
      user.tier,
      totalRecords
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: rateCheck.reason } },
        { status: 429, headers: rateCheck.retryAfter ? { "Retry-After": String(rateCheck.retryAfter) } : {} }
      );
    }

    // 6. Create job in database
    const supabase = createAdminClient();
    const { data: job, error: insertError } = await supabase
      .from("bulk_jobs")
      .insert({
        user_id: user.user_id,
        status: "pending",
        request: body,
        records_total: totalRecords,
      })
      .select("id")
      .single();

    if (insertError || !job) {
      releaseReservedRecords(user.user_id, totalRecords).catch(() => {});
      return internalError("Failed to create async job");
    }

    // 7. Process job after response is sent
    const parsedData = parsed.data;
    after(async () => {
      const db = createAdminClient();
      try {
        // Mark as processing
        await db
          .from("bulk_jobs")
          .update({ status: "processing", started_at: new Date().toISOString() })
          .eq("id", job.id);

        // Generate data
        const result = await generate(parsedData);

        if (!result.success) {
          releaseReservedRecords(user.user_id, totalRecords).catch(() => {});
          const errorMsg = "cycle" in result
            ? `Dependency cycle: ${result.cycle.join(" → ")}`
            : "Generation failed";
          await db
            .from("bulk_jobs")
            .update({ status: "failed", error: errorMsg, completed_at: new Date().toISOString() })
            .eq("id", job.id);
          return;
        }

        // Format output
        const formatted = formatOutput(
          result.result,
          parsedData.tables,
          parsedData.format ?? "json",
          parsedData.sql_dialect
        );

        // Store result
        await db
          .from("bulk_jobs")
          .update({
            status: "completed",
            result: formatted.body,
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        // Log usage
        await db.from("usage_logs").insert({
          user_id: user.user_id,
          api_key_id: user.api_key_id,
          records_generated: totalRecords,
          tables_count: parsedData.tables.length,
          format: parsedData.format ?? "json",
          locale: parsedData.locale ?? "en",
        });

        // Deliver webhook
        deliverWebhook(user.user_id, "generation.completed", {
          event: "generation.completed",
          job_id: job.id,
          data: formatted.body,
          meta: { records: totalRecords, tables: parsedData.tables.map(t => t.name), format: parsedData.format ?? "json" },
          timestamp: new Date().toISOString(),
        }).catch(() => {});

      } catch (err) {
        releaseReservedRecords(user.user_id, totalRecords).catch(() => {});
        await db
          .from("bulk_jobs")
          .update({
            status: "failed",
            error: err instanceof Error ? err.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      }
    });

    // 8. Return 202 immediately with rate limit headers
    const headers = rateLimitHeaders(rateCheck as Extract<typeof rateCheck, { allowed: true }>);
    return NextResponse.json(
      {
        job_id: job.id,
        status: "pending",
        poll_url: `/api/v1/jobs/${job.id}`,
        records_total: totalRecords,
      },
      { status: 202, headers }
    );
  } catch (err) {
    console.error("Async generate error:", err);
    return internalError();
  }
}
