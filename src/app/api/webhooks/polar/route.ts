/**
 * POST /api/webhooks/polar
 * Handles Polar subscription lifecycle webhooks.
 * Verifies signature via Svix, then syncs subscription state to Supabase.
 *
 * Events handled:
 *   subscription.created  — new subscription activated
 *   subscription.updated  — plan changed, renewed, etc.
 *   subscription.canceled — canceled at period end
 *   subscription.revoked  — access fully removed
 */

import { Webhook } from "svix"
import { headers } from "next/headers"
import { clerkClient } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TIER_LIMITS } from "@/lib/utils/constants"
import type { Tier } from "@/lib/utils/constants"
import { sendEmail, upgradeConfirmationEmail, downgradeConfirmationEmail } from "@/lib/email"

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user.emailAddresses?.[0]?.emailAddress ?? null
  } catch {
    return null
  }
}

interface PolarSubscription {
  id: string
  status: string
  customer_id: string
  product: {
    id: string
    name: string
  }
  current_period_end: string | null
  cancel_at_period_end: boolean
  metadata: {
    user_id?: string
    tier?: string
  }
}

interface PolarWebhookEvent {
  type: string
  data: PolarSubscription
}

/** Map Polar product name → our tier. Adjust names to match your Polar products. */
function resolveTier(event: PolarSubscription): Tier {
  // First check metadata (set during checkout)
  if (event.metadata?.tier === "pro" || event.metadata?.tier === "scale") {
    return event.metadata.tier as Tier
  }

  // Fallback: match by product name (case-insensitive)
  const name = event.product?.name?.toLowerCase() ?? ""
  if (name.includes("scale")) return "scale"
  if (name.includes("pro")) return "pro"

  return "free"
}

export async function POST(req: Request) {
  // 1. Verify webhook signature
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    console.error("POLAR_WEBHOOK_SECRET not configured")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(secret)
  let event: PolarWebhookEvent

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as PolarWebhookEvent
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  // 2. Extract subscription data
  const sub = event.data
  const userId = sub.metadata?.user_id

  if (!userId) {
    console.error("Polar webhook missing user_id in metadata:", event.type)
    return new Response("Missing user_id metadata", { status: 400 })
  }

  const supabase = createAdminClient()
  const tier = resolveTier(sub)

  // 3. Handle events
  switch (event.type) {
    case "subscription.created":
    case "subscription.updated": {
      // Upsert subscription record
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            polar_subscription_id: sub.id,
            polar_customer_id: sub.customer_id,
            product_name: sub.product?.name ?? tier,
            status: "active",
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          },
          { onConflict: "polar_subscription_id" }
        )

      if (subError) {
        console.error("Failed to upsert subscription:", subError)
        return new Response("DB error", { status: 500 })
      }

      // Upgrade profile tier
      await supabase
        .from("profiles")
        .update({ tier })
        .eq("id", userId)

      // Send upgrade email (fire-and-forget)
      if (tier !== "free") {
        getUserEmail(userId).then((email) => {
          if (email) {
            const dailyLimit = TIER_LIMITS[tier].dailyRecords
            sendEmail({ to: email, subject: `Upgraded to MockHero ${tier.charAt(0).toUpperCase() + tier.slice(1)}`, html: upgradeConfirmationEmail(tier, dailyLimit) }).catch(() => {})
          }
        }).catch(() => {})
      }

      break
    }

    case "subscription.canceled": {
      // Mark as canceling (still active until period end)
      await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          current_period_end: sub.current_period_end,
        })
        .eq("polar_subscription_id", sub.id)

      break
    }

    case "subscription.revoked": {
      // Get previous tier before downgrading
      const { data: prevProfile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", userId)
        .maybeSingle()
      const previousTier = prevProfile?.tier ?? "pro"

      // Subscription fully ended — revert to free
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("polar_subscription_id", sub.id)

      await supabase
        .from("profiles")
        .update({ tier: "free" })
        .eq("id", userId)

      // Send downgrade email (fire-and-forget)
      getUserEmail(userId).then((email) => {
        if (email) {
          sendEmail({ to: email, subject: "Your MockHero plan has changed", html: downgradeConfirmationEmail(previousTier) }).catch(() => {})
        }
      }).catch(() => {})

      break
    }

    default:
      // Unknown event — acknowledge but ignore
      console.warn("Unhandled Polar event:", event.type)
  }

  return new Response("OK", { status: 200 })
}
