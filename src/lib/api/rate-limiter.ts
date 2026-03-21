/**
 * Rate limiting for API requests.
 * Checks per-request record limits, daily record limits, and per-minute request limits.
 *
 * Daily limits use atomic reservation: records are reserved BEFORE generation
 * via a Supabase RPC to prevent TOCTOU race conditions under concurrent requests.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_LIMITS, EARLY_ADOPTER_DAILY_RECORDS, type Tier } from "@/lib/utils/constants";

// In-memory fixed window for per-minute rate limiting
// Resets on cold start (acceptable for serverless)
const minuteWindows = new Map<string, { count: number; windowStart: number }>();
let lastMinuteCleanup = Date.now();

/** Purge expired minute windows to prevent memory growth in long-lived containers */
function cleanupMinuteWindows() {
  const now = Date.now();
  // Run cleanup at most once every 2 minutes
  if (now - lastMinuteCleanup < 120_000) return;
  lastMinuteCleanup = now;
  for (const [key, window] of minuteWindows) {
    if (now - window.windowStart > 120_000) {
      minuteWindows.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: true;
  remaining: number;
  dailyLimit: number;
  dailyUsed: number;
  reset: string; // ISO date string for end of day
}

export interface RateLimitDenied {
  allowed: false;
  reason: string;
  retryAfter?: number; // seconds
}

export async function checkRateLimit(
  userId: string,
  tier: Tier,
  requestedRecords: number,
  isEarlyAdopter: boolean
): Promise<RateLimitResult | RateLimitDenied> {
  // Lazy cleanup of expired minute windows
  cleanupMinuteWindows();

  const limits = TIER_LIMITS[tier];
  const dailyRecordLimit = isEarlyAdopter && tier === "free"
    ? EARLY_ADOPTER_DAILY_RECORDS
    : limits.dailyRecords;

  // 1. Check per-request record limit
  if (requestedRecords > limits.perRequest) {
    return {
      allowed: false,
      reason: `Per-request limit exceeded. Maximum ${limits.perRequest.toLocaleString()} records per request for ${tier} tier.`,
    };
  }

  // 2. Check per-minute request limit (in-memory fixed window)
  const now = Date.now();
  const windowKey = userId;
  const window = minuteWindows.get(windowKey);

  if (window) {
    const elapsed = now - window.windowStart;
    if (elapsed < 60_000) {
      if (window.count >= limits.perMinute) {
        return {
          allowed: false,
          reason: `Rate limit exceeded. Maximum ${limits.perMinute} requests per minute for ${tier} tier.`,
          retryAfter: Math.ceil((60_000 - elapsed) / 1000),
        };
      }
      // Note: per-minute counter is incremented AFTER daily check succeeds (see below)
    } else {
      minuteWindows.set(windowKey, { count: 0, windowStart: now });
    }
  } else {
    minuteWindows.set(windowKey, { count: 0, windowStart: now });
  }

  // 3. Atomically reserve daily records to prevent TOCTOU race condition.
  //    Uses upsert + increment so two concurrent requests can't both see
  //    the old count and both pass.
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: reserved, error: rpcError } = await supabase.rpc("reserve_daily_usage", {
    p_user_id: userId,
    p_date: today,
    p_records: requestedRecords,
    p_limit: dailyRecordLimit,
  });

  // Fallback: if RPC doesn't exist yet, use non-atomic check (graceful degradation)
  if (rpcError) {
    const { data: dailyUsage } = await supabase
      .from("daily_usage")
      .select("records_used")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    const dailyUsed = dailyUsage?.records_used ?? 0;

    if (dailyUsed + requestedRecords > dailyRecordLimit) {
      const remaining = Math.max(0, dailyRecordLimit - dailyUsed);
      return {
        allowed: false,
        reason: `Daily record limit exceeded. Used ${dailyUsed.toLocaleString("en-US")}/${dailyRecordLimit.toLocaleString("en-US")} records today. ${remaining.toLocaleString("en-US")} remaining.`,
      };
    }

    // Increment daily_usage in fallback path (non-atomic, best effort)
    await supabase.from("daily_usage").upsert(
      { user_id: userId, date: today, records_used: dailyUsed + requestedRecords },
      { onConflict: "user_id,date" }
    );

    // Increment per-minute counter only after daily check passes
    const currentWindow = minuteWindows.get(windowKey);
    if (currentWindow) currentWindow.count++;

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return {
      allowed: true,
      remaining: dailyRecordLimit - dailyUsed - requestedRecords,
      dailyLimit: dailyRecordLimit,
      dailyUsed: dailyUsed + requestedRecords,
      reset: tomorrow.toISOString(),
    };
  }

  // RPC returns: { allowed: boolean, records_used: number }
  const result = reserved as { allowed: boolean; records_used: number } | null;

  if (!result || !result.allowed) {
    const dailyUsed = result?.records_used ?? 0;
    const remaining = Math.max(0, dailyRecordLimit - dailyUsed);
    return {
      allowed: false,
      reason: `Daily record limit exceeded. Used ${dailyUsed.toLocaleString()}/${dailyRecordLimit.toLocaleString()} records today. ${remaining.toLocaleString()} remaining.`,
    };
  }

  // Increment per-minute counter only after daily check passes
  const currentWindow = minuteWindows.get(windowKey);
  if (currentWindow) currentWindow.count++;

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    allowed: true,
    remaining: dailyRecordLimit - result.records_used,
    dailyLimit: dailyRecordLimit,
    dailyUsed: result.records_used,
    reset: tomorrow.toISOString(),
  };
}

/**
 * Release reserved records if generation fails.
 * This avoids penalizing users for failed requests.
 * Also decrements the per-minute request counter so failed requests
 * don't eat into the user's per-minute quota.
 */
export async function releaseReservedRecords(
  userId: string,
  records: number
): Promise<void> {
  // Decrement per-minute counter so failed requests don't consume quota
  const window = minuteWindows.get(userId);
  if (window && window.count > 0) {
    window.count--;
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    await supabase.rpc("release_daily_usage", {
      p_user_id: userId,
      p_date: today,
      p_records: records,
    });
  } catch {
    // Best-effort release — don't crash if it fails
  }
}

/**
 * Release a single per-minute slot for a user.
 * Call this when generation fails after the rate limit check passed,
 * so the failed request doesn't consume the user's per-minute quota.
 */
export function releaseMinuteSlot(key: string): void {
  const window = minuteWindows.get(key);
  if (window && window.count > 0) {
    window.count--;
  }
}

/**
 * Build rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.dailyLimit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.reset,
  };
}
