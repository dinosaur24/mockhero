/**
 * POST /api/v1/schema/detect
 * Converts SQL CREATE TABLE statements or sample JSON into MockHero schema format.
 * Pro+ tier only.
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import {
  unauthorizedError,
  validationError,
  forbiddenFeatureError,
  internalError,
} from "@/lib/api/errors";
import { detectFromSql, detectFromJson } from "@/lib/engine/schema-detector";

export async function POST(request: Request) {
  try {
    // 1. Validate API key
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    // 2. Feature gate — Pro+ only
    if (user.tier === "free") {
      return forbiddenFeatureError("Schema detection", "Pro");
    }

    // 3. Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return validationError("Invalid JSON in request body");
    }

    const { sql, sample_json } = body;

    if (!sql && !sample_json) {
      return validationError("Provide either 'sql' (CREATE TABLE statement) or 'sample_json' (example JSON record)");
    }

    // 4. Detect schema
    if (typeof sql === "string") {
      if (sql.length > 50_000) {
        return validationError("SQL input must be 50,000 characters or fewer");
      }
      const schema = detectFromSql(sql);
      return NextResponse.json({ schema });
    }

    if (sample_json && typeof sample_json === "object") {
      // Reject arrays — sample_json must be a plain object (single record)
      if (Array.isArray(sample_json)) {
        return validationError("'sample_json' must be a single JSON object (not an array). Pass one example record.");
      }
      const schema = detectFromJson(sample_json as Record<string, unknown>);
      return NextResponse.json({ schema });
    }

    return validationError("'sql' must be a string, 'sample_json' must be an object");
  } catch (err) {
    console.error("Schema detect error:", err);
    return internalError();
  }
}
