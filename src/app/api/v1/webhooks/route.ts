/**
 * GET  /api/v1/webhooks — List user's webhooks (Scale tier only)
 * POST /api/v1/webhooks — Create a new webhook (Scale tier only)
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import {
  unauthorizedError,
  validationError,
  forbiddenFeatureError,
  internalError,
} from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/v1/webhooks
 * Returns all webhooks for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    if (user.tier !== "scale") {
      return forbiddenFeatureError("Webhooks", "Scale");
    }

    const supabase = createAdminClient();

    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("id, url, events, is_active, created_at, updated_at")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to list webhooks:", error);
      return internalError();
    }

    return NextResponse.json({ webhooks: webhooks ?? [] });
  } catch (err) {
    console.error("Webhooks GET error:", err);
    return internalError();
  }
}

/**
 * POST /api/v1/webhooks
 * Create a new webhook. Returns the secret once (cannot be retrieved later).
 */
export async function POST(request: Request) {
  try {
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    if (user.tier !== "scale") {
      return forbiddenFeatureError("Webhooks", "Scale");
    }

    let body: { url?: string; events?: string[] };
    try {
      body = await request.json();
    } catch {
      return validationError("Invalid JSON in request body");
    }

    // Validate URL
    if (!body.url || typeof body.url !== "string") {
      return validationError("url is required and must be a string");
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      return validationError("url must be a valid URL");
    }

    if (parsedUrl.protocol !== "https:") {
      return validationError("url must use HTTPS");
    }

    // Validate events against known allowlist
    const KNOWN_EVENTS = ["generation.completed"];
    const events = body.events ?? ["generation.completed"];
    if (!Array.isArray(events) || events.length === 0) {
      return validationError("events must be a non-empty array of strings");
    }
    const unknownEvents = events.filter((e) => typeof e !== "string" || !KNOWN_EVENTS.includes(e));
    if (unknownEvents.length > 0) {
      return validationError(`Unknown event(s): ${unknownEvents.join(", ")}. Supported: ${KNOWN_EVENTS.join(", ")}`);
    }

    // Generate a random 32-byte hex secret
    const secretBytes = new Uint8Array(32);
    crypto.getRandomValues(secretBytes);
    const secret = Array.from(secretBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const supabase = createAdminClient();

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .insert({
        user_id: user.user_id,
        url: body.url,
        secret,
        events,
      })
      .select("id, url, events, is_active, created_at")
      .single();

    if (error) {
      console.error("Failed to create webhook:", error);
      return internalError();
    }

    return NextResponse.json(
      {
        ...webhook,
        secret,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Webhooks POST error:", err);
    return internalError();
  }
}
