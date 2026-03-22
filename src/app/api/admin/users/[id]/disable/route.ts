/**
 * POST /api/admin/users/[id]/disable
 * Revokes all active API keys for a user. Admin only.
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unauthorizedError, internalError } from "@/lib/api/errors"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (userId !== process.env.ADMIN_USER_ID) return unauthorizedError()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Count active keys before revoking
    const { count } = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("is_active", true)

    // Revoke all active keys
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("user_id", id)
      .eq("is_active", true)

    if (error) {
      console.error("Disable user error:", error)
      return internalError("Failed to disable user")
    }

    return NextResponse.json({ success: true, keysRevoked: count ?? 0 })
  } catch (err) {
    console.error("Disable user error:", err)
    return internalError("Failed to disable user")
  }
}
