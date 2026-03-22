/**
 * PATCH /api/admin/users/[id]/tier
 * Updates a user's tier. Admin only.
 * Body: { tier: 'free' | 'pro' | 'scale' }
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"

const VALID_TIERS = ["free", "pro", "scale"]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (userId !== process.env.ADMIN_USER_ID) return unauthorizedError()

  try {
    const { id } = await params
    const body = await request.json()
    const tier = body?.tier

    if (!tier || !VALID_TIERS.includes(tier)) {
      return validationError("tier must be one of: free, pro, scale")
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("profiles")
      .update({ tier })
      .eq("id", id)

    if (error) {
      console.error("Tier update error:", error)
      return internalError("Failed to update tier")
    }

    return NextResponse.json({ success: true, tier })
  } catch (err) {
    console.error("Tier update error:", err)
    return internalError("Failed to update tier")
  }
}
