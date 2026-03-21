/**
 * POST /api/dashboard/revoke-key
 * Revokes (deactivates) a specific API key owned by the authenticated user.
 * Body: { keyId: string }
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorizedError()

  try {
    const body = await request.json()
    const keyId = body?.keyId
    if (!keyId || typeof keyId !== "string") {
      return validationError("keyId is required")
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", keyId)
      .eq("user_id", userId) // ownership check
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
