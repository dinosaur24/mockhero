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

    // Send notification email (fire-and-forget)
    clerkClient().then(async (clerk) => {
      const user = await clerk.users.getUser(userId)
      const email = user.emailAddresses?.[0]?.emailAddress
      if (email) {
        console.log("[create-key] Sending API key email to:", email)
        await sendEmail({ to: email, subject: "New API Key Created", html: apiKeyCreatedEmail(keyPrefix) })
        console.log("[create-key] Email sent successfully")
      } else {
        console.warn("[create-key] No email found for user:", userId)
      }
    }).catch((err) => {
      console.error("[create-key] Failed to send email:", err)
    })

    return NextResponse.json({ rawKey, keyPrefix })
  } catch (err) {
    console.error("Key creation error:", err)
    return internalError("Failed to create API key")
  }
}
