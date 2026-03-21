/**
 * API key validation for /api/v1/* routes.
 * Extracts the x-api-key header, hashes it, and looks it up in Supabase.
 * User IDs are Clerk user IDs (strings like "user_2x...").
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { Tier } from "@/lib/utils/constants";

export interface ApiKeyUser {
  user_id: string;
  api_key_id: string;
  tier: Tier;
  is_early_adopter: boolean;
}

/**
 * Hash an API key with SHA-256 using Web Crypto API.
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validate an API key from the request.
 * Checks both x-api-key header and Authorization: Bearer header.
 */
export async function validateApiKey(
  request: Request
): Promise<ApiKeyUser | null> {
  // Support both header styles
  const apiKey =
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  // Reject missing or absurdly long keys before doing any crypto work.
  // MockHero keys are ~67 chars (mh_ + 64 hex). 256 is generous.
  if (!apiKey || apiKey.length > 256) return null;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  const keyHash = await hashApiKey(apiKey);

  // Look up the key
  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (keyError || !keyData) return null;

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyData.id)
    .then(() => {});

  // Get user profile for tier
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, is_early_adopter")
    .eq("id", keyData.user_id)
    .single();

  if (profileError || !profile) return null;

  // Check for active subscription that might upgrade the tier
  let tier: Tier = (profile.tier as Tier) ?? "free";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("product_name, status")
    .eq("user_id", keyData.user_id)
    .eq("status", "active")
    .single();

  if (subscription) {
    const validTiers = ["free", "pro", "scale"] as const;
    const subTier = subscription.product_name?.toLowerCase();
    if (validTiers.includes(subTier as any)) {
      tier = subTier as Tier;
    }
  }

  return {
    user_id: keyData.user_id,
    api_key_id: keyData.id,
    tier,
    is_early_adopter: profile.is_early_adopter ?? false,
  };
}
