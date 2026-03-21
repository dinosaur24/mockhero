/**
 * Ensure a profile row exists in Supabase for the given Clerk user ID.
 * Called on every dashboard visit. Creates the profile on first visit
 * (replaces the old Supabase auth trigger).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureProfile(clerkUserId: string): Promise<void> {
  const supabase = createAdminClient();

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", clerkUserId)
    .single();

  if (existing) return; // already exists

  // Create profile
  await supabase.from("profiles").insert({
    id: clerkUserId,
    tier: "free",
  });
}
