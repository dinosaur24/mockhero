/**
 * POST /api/dashboard/checkout
 * Creates a Polar checkout session for upgrading to a paid tier.
 * Body: { tier: "pro" | "scale" }
 * Returns: { url: string } — redirect the user here
 */

import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { createCheckoutSession } from "@/lib/polar/client"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"
import type { Tier } from "@/lib/utils/constants"

const ALLOWED_TIERS: Tier[] = ["pro", "scale"]

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorizedError()

  try {
    const body = await request.json()
    const tier = body?.tier as Tier

    if (!tier || !ALLOWED_TIERS.includes(tier)) {
      return validationError('tier must be "pro" or "scale"')
    }

    // Get user email from Clerk for the checkout
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress ?? ""

    if (!email) {
      return validationError("No email address found on account")
    }

    const { url } = await createCheckoutSession({
      tier,
      customerEmail: email,
      userId,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Checkout error:", err)
    return internalError("Failed to create checkout session")
  }
}
