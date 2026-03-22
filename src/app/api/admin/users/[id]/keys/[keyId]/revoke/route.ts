/**
 * POST /api/admin/users/[id]/keys/[keyId]/revoke
 * Revokes a specific API key. Admin only.
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  const { userId } = await auth()
  if (userId !== process.env.ADMIN_USER_ID) return unauthorizedError()

  try {
    const { id, keyId } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", keyId)
      .eq("user_id", id)
      .select("id")
      .single()

    if (error || !data) {
      return validationError("Key not found or already revoked")
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Key revocation error:", err)
    return internalError("Failed to revoke API key")
  }
}
