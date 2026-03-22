/**
 * POST /api/admin/system/maintenance
 * Toggles maintenance mode. Admin only.
 * Body: { enabled: boolean }
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (userId !== process.env.ADMIN_USER_ID) return unauthorizedError()

  try {
    const body = await request.json()
    const enabled = body?.enabled

    if (typeof enabled !== "boolean") {
      return validationError("enabled must be a boolean")
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("system_settings")
      .upsert(
        { key: "maintenance_mode", value: enabled.toString() },
        { onConflict: "key" }
      )

    if (error) {
      console.error("Maintenance toggle error:", error)
      return internalError("Failed to update maintenance mode")
    }

    return NextResponse.json({ success: true, maintenanceMode: enabled })
  } catch (err) {
    console.error("Maintenance toggle error:", err)
    return internalError("Failed to update maintenance mode")
  }
}
