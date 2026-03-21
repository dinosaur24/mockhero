import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — bypasses Row Level Security.
 * ONLY use in API route handlers (src/app/api/**) for operations
 * that need to write across users (e.g., API key validation, usage logging).
 *
 * NEVER import this in client components or pages.
 *
 * Singleton: reuses one client instance per process to avoid creating
 * a new connection on every request in long-lived serverless containers.
 */

let adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "API routes requiring database access need Supabase configured."
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
