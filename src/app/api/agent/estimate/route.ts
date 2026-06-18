/**
 * POST /api/agent/estimate
 * Loginless cost estimate for agent metered usage.
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import { schemaError, internalError, validationError } from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { estimateAgentMeteredUsage, agentUsagePricingResponse } from "@/lib/agent/billing";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generateFromTemplate } from "@/lib/engine/templates";
import {
  SUPPORTED_FORMATS,
  SUPPORTED_LOCALES,
  SUPPORTED_SQL_DIALECTS,
  type Locale,
  type OutputFormat,
  type SqlDialect,
} from "@/lib/engine/types";

type EstimateMode = "schema" | "template" | "prompt_estimate";

function positiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function supportedLocale(value: unknown): Locale | undefined {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
    ? (value as Locale)
    : undefined;
}

function supportedFormat(value: unknown): OutputFormat | undefined {
  return typeof value === "string" && SUPPORTED_FORMATS.includes(value as OutputFormat)
    ? (value as OutputFormat)
    : undefined;
}

function supportedSqlDialect(value: unknown): SqlDialect | undefined {
  return typeof value === "string" && SUPPORTED_SQL_DIALECTS.includes(value as SqlDialect)
    ? (value as SqlDialect)
    : undefined;
}

function countRecords(body: Record<string, unknown>): { mode: EstimateMode; totalRecords: number } | NextResponse {
  if (typeof body.template === "string") {
    try {
      const templateRequest = generateFromTemplate({
        template: body.template,
        scale: typeof body.scale === "number" ? body.scale : 1,
        locale: supportedLocale(body.locale),
        format: supportedFormat(body.format),
        sql_dialect: supportedSqlDialect(body.sql_dialect),
        seed: typeof body.seed === "number" ? body.seed : undefined,
      });

      return {
        mode: "template",
        totalRecords: templateRequest.tables.reduce((sum, table) => sum + table.count, 0),
      };
    } catch (err) {
      return validationError(err instanceof Error ? err.message : "Unknown template error");
    }
  }

  if (typeof body.prompt === "string" && !body.tables) {
    const estimatedRecords = positiveInteger(body.estimated_records);
    if (!estimatedRecords) {
      return validationError(
        "estimated_records is required for prompt estimates because /api/agent/estimate does not run prompt-to-schema conversion"
      );
    }

    return {
      mode: "prompt_estimate",
      totalRecords: estimatedRecords,
    };
  }

  const parsed = parseSchema(body);
  if (!parsed.success) {
    return schemaError("Schema validation failed", parsed.errors);
  }

  return {
    mode: "schema",
    totalRecords: parsed.data.tables.reduce((sum, table) => sum + table.count, 0),
  };
}

async function getAuthenticatedDailyUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("daily_usage")
    .select("records_used")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  return numberOrZero((data as { records_used?: unknown } | null)?.records_used);
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return validationError("Invalid JSON in request body");
    }

    const counted = countRecords(body);
    if (counted instanceof NextResponse) {
      return counted;
    }

    const user = await validateApiKey(request);
    const dailyUsedBefore = user
      ? await getAuthenticatedDailyUsage(user.user_id)
      : numberOrZero(body.daily_used_before);

    return NextResponse.json({
      service: "MockHero",
      mode: counted.mode,
      authenticated: Boolean(user),
      tier: user?.tier ?? "agent",
      estimate: estimateAgentMeteredUsage({
        requestedRecords: counted.totalRecords,
        dailyUsedBefore,
      }),
      pricing: agentUsagePricingResponse(),
      assumptions: [
        "Estimate uses the agent metered plan: 500 free records/day, then $0.001 per 100 billable records.",
        "Polar meter units are rounded up per 100 billable records per request.",
        "Prompt estimates require estimated_records and do not run LLM prompt conversion.",
      ],
    });
  } catch (err) {
    console.error("Agent estimate error:", err);
    return internalError("Failed to estimate agent usage");
  }
}
