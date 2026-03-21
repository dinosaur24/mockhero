import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — use in client components ("use client").
 * Reads/writes auth cookies automatically via the browser's cookie API.
 * Safe to use with anon key (RLS is enforced).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars");
  }

  return createBrowserClient(url, anonKey);
}
