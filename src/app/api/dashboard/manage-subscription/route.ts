/**
 * POST /api/dashboard/manage-subscription
 * Manage the user's Polar subscription.
 * Body: { action: "cancel" }
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cancelSubscription } from "@/lib/polar/client"
import { unauthorizedError, validationError, internalError } from "@/lib/api/errors"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorizedError()

  try {
    const body = await request.json()
    const action = body?.action

    if (action !== "cancel") {
      return validationError('action must be "cancel"')
    }

    // Find the user's active subscription
    const supabase = createAdminClient()
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("polar_subscription_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub?.polar_subscription_id) {
      return validationError("No active subscription found")
    }

    // Cancel via Polar API
    await cancelSubscription(sub.polar_subscription_id)

    // Mark as canceling in our DB
    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("polar_subscription_id", sub.polar_subscription_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Subscription management error:", err)
    return internalError("Failed to manage subscription")
  }
}
