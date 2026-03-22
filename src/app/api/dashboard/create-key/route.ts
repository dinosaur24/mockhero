/**
 * POST /api/dashboard/create-key
 * Creates a new API key for the authenticated user.
 * Returns the raw key (shown once) and key prefix (for display).
 */

import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { generateApiKey } from "@/lib/api/keys"
import { unauthorizedError, internalError } from "@/lib/api/errors"
import { sendEmail, apiKeyCreatedEmail } from "@/lib/email"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return unauthorizedError()

  try {
    const { rawKey, keyPrefix } = await generateApiKey(userId)

    // Send notification email — must await before returning or Vercel kills the function
    try {
      const clerk = await clerkClient()
      const user = await clerk.users.getUser(userId)
      const email = user.emailAddresses?.[0]?.emailAddress
      if (email) {
        console.log("[create-key] Sending API key email to:", email)
        await sendEmail({ to: email, subject: "New API Key Created", html: apiKeyCreatedEmail(keyPrefix) })
        console.log("[create-key] Email sent successfully")
      }
    } catch (emailErr) {
      console.error("[create-key] Email failed:", emailErr)
      // Don't block key creation if email fails
    }

    return NextResponse.json({ rawKey, keyPrefix })
  } catch (err) {
    console.error("Key creation error:", err)
    return internalError("Failed to create API key")
  }
}
