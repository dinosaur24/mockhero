/**
 * POST /api/dashboard/create-key
 * Creates a new API key for the authenticated user.
 * Returns the raw key (shown once) and key prefix (for display).
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateApiKey } from "@/lib/api/keys"
import { unauthorizedError, internalError } from "@/lib/api/errors"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return unauthorizedError()

  try {
    const { rawKey, keyPrefix } = await generateApiKey(userId)
    return NextResponse.json({ rawKey, keyPrefix })
  } catch (err) {
    console.error("Key creation error:", err)
    return internalError("Failed to create API key")
  }
}
