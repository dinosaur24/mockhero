/**
 * API key generation and management.
 * Keys are stored hashed (SHA-256). The raw key is shown once to the user.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { API_KEY_PREFIX } from "@/lib/utils/constants";

/**
 * Generate a cryptographically random hex string.
 */
function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a string with SHA-256, return hex.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a new API key for a user.
 * Returns the raw key (show once to user) and the prefix (for display).
 */
export async function generateApiKey(
  userId: string
): Promise<{ rawKey: string; keyPrefix: string }> {
  const rawKey = `${API_KEY_PREFIX}${randomHex(32)}`;
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);

  const supabase = createAdminClient();

  const { error } = await supabase.from("api_keys").insert({
    user_id: userId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    is_active: true,
  });

  if (error) throw new Error(`Failed to create API key: ${error.message}`);

  return { rawKey, keyPrefix };
}

/**
 * Regenerate API key: revoke old, create new.
 */
export async function regenerateApiKey(
  userId: string
): Promise<{ rawKey: string; keyPrefix: string }> {
  const supabase = createAdminClient();

  // Revoke all existing active keys
  await supabase
    .from("api_keys")
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_active", true);

  // Generate new key
  return generateApiKey(userId);
}

/**
 * Get the active key prefix for display (e.g., "mh_a1b2c3d4").
 */
export async function getActiveKeyPrefix(
  userId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("api_keys")
    .select("key_prefix")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  return data?.key_prefix ?? null;
}
