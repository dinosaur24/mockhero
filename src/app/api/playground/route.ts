/**
 * POST /api/playground
 * Unauthenticated endpoint for the landing page playground.
 * Rate limited by IP: 10 requests/hour.
 */

import { NextResponse } from "next/server";
import { generateFromRaw, generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";
import { generateFromTemplate } from "@/lib/engine/templates";
import {
  validationError,
  schemaError,
  dependencyCycleError,
  rateLimitError,
  internalError,
} from "@/lib/api/errors";
import type { EngineResult } from "@/lib/engine/generator";

// Simple in-memory rate limiter (per IP, resets hourly)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

let lastCleanup = Date.now();

function checkPlaygroundRateLimit(ip: string): boolean {
  const now = Date.now();

  // Lazy cleanup: purge stale entries every 10 minutes instead of setInterval
  // This avoids holding serverless containers alive with timers
  if (now - lastCleanup > 10 * 60 * 1000) {
    lastCleanup = now;
    for (const [key, entry] of ipRequestCounts) {
      if (now > entry.resetAt) {
        ipRequestCounts.delete(key);
      }
    }
  }

  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP — prefer x-real-ip (set by Vercel edge, not spoofable)
    const ip =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    if (!ip) {
      return rateLimitError("Unable to determine client IP. Try again later.");
    }

    if (!checkPlaygroundRateLimit(ip)) {
      return rateLimitError("Playground rate limit exceeded. Sign up for a free API key to get 1,000 records/day.");
    }

    // Parse body with size limit (100KB — playground schemas are small)
    let body: unknown;
    try {
      const text = await request.text();
      if (text.length > 100_000) {
        return validationError("Request body too large for playground. Maximum 100KB.");
      }
      body = JSON.parse(text);
    } catch {
      return validationError("Invalid JSON in request body");
    }

    const raw = body as Record<string, unknown>;

    // Handle template mode
    let result: EngineResult;
    let validatedTables: Parameters<typeof formatOutput>[1] | undefined;

    if (typeof raw.template === "string") {
      // Reject negative scale with a 400 instead of silently clamping
      if (typeof raw.scale === "number" && raw.scale < 0) {
        return validationError("Scale must be a positive number (e.g. 0.5 for half, 2 for double).");
      }

      try {
        const templateRequest = generateFromTemplate({
          template: raw.template,
          scale: typeof raw.scale === "number" ? Math.min(Math.max(raw.scale, 0.01), 10) : 1,
          locale: typeof raw.locale === "string" ? (raw.locale as any) : undefined,
          // Playground: JSON only, no seeds (Pro features)
          format: "json",
          sql_dialect: undefined,
          seed: undefined,
        });

        // Cap records at 100 for playground
        for (const table of templateRequest.tables) {
          if (table.count > 100) {
            table.count = 100;
          }
        }

        validatedTables = templateRequest.tables;
        result = await generate(templateRequest);
      } catch (err) {
        return validationError(err instanceof Error ? err.message : "Unknown template error");
      }
    } else {
      // Cap records at 100 for playground (structured schema mode)
      if (Array.isArray(raw.tables)) {
        for (const table of raw.tables as Array<Record<string, unknown>>) {
          if (typeof table.count === "number" && table.count > 100) {
            table.count = 100;
          }
        }
      }

      // Strip Pro features from playground requests
      delete raw.seed;
      delete raw.sql_dialect;
      raw.format = "json";

      // Generate from structured schema
      result = await generateFromRaw(body);
    }

    if (!result.success) {
      if ("errors" in result) {
        return schemaError("Schema validation failed", result.errors);
      }
      if ("cycle" in result) {
        return dependencyCycleError(result.cycle);
      }
      return internalError("Data generation failed");
    }

    // Format output — playground is JSON-only (CSV/SQL are Pro features)
    // Use validated tables from template mode, or fall back to empty array
    // (JSON formatter doesn't use tables; only SQL formatter does)
    const formatted = formatOutput(
      result.result,
      validatedTables ?? [],
      "json",
      undefined
    );

    return NextResponse.json(formatted.body);
  } catch (err) {
    console.error("Playground error:", err);
    return internalError();
  }
}
