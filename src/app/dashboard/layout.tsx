import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ensureProfile } from "@/lib/api/ensure-profile"
import DashboardShell from "./dashboard-shell"

/**
 * Server-side dashboard layout.
 * Ensures the user is authenticated and has a Supabase profile row
 * before rendering the client-side dashboard shell.
 *
 * ensureProfile is a safety net — if the Clerk webhook missed creating
 * the profile (network blip, late webhook config, etc.), this creates it
 * on the user's first dashboard visit. It's a no-op if the profile exists.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Ensure Supabase profile exists (no-op if it already does)
  await ensureProfile(userId)

  return <DashboardShell>{children}</DashboardShell>
}
