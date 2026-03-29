/**
 * POST /api/webhooks/polar
 * Handles Polar subscription lifecycle webhooks.
 * CRITICAL: Always returns 200 to prevent Polar from disabling the endpoint.
 */

import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks"
import { headers } from "next/headers"
import { clerkClient } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TIER_LIMITS, CREDIT_PACKS } from "@/lib/utils/constants"
import type { Tier, CreditPack } from "@/lib/utils/constants"
import { sendEmail, upgradeConfirmationEmail, downgradeConfirmationEmail } from "@/lib/email"

function ok(msg = "OK") {
  return new Response(msg, { status: 200 })
}

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user.emailAddresses?.[0]?.emailAddress ?? null
  } catch {
    return null
  }
}

/** Map Polar product name/metadata → credit pack */
function resolveCreditPack(data: Record<string, unknown>): CreditPack | null {
  const metadata = (data.metadata ?? {}) as Record<string, string>
  if (metadata.credit_pack && metadata.credit_pack in CREDIT_PACKS) {
    return metadata.credit_pack as CreditPack
  }
  const product = data.product as Record<string, unknown> | undefined
  const name = (product?.name as string ?? "").toLowerCase()
  if (name.includes("scale") && name.includes("credit")) return "scale"
  if (name.includes("builder")) return "builder"
  if (name.includes("starter") && name.includes("credit")) return "starter"
  return null
}

/** Map Polar product name → our tier */
function resolveTier(data: Record<string, unknown>): Tier {
  // Check metadata.tier (set during checkout)
  const metadata = (data.metadata ?? {}) as Record<string, string>
  if (metadata.tier === "pro" || metadata.tier === "scale") {
    return metadata.tier as Tier
  }

  // Fallback: match by product name
  const product = data.product as Record<string, unknown> | undefined
  const name = (product?.name as string ?? "").toLowerCase()
  if (name.includes("scale")) return "scale"
  if (name.includes("pro")) return "pro"

  return "free"
}

export async function POST(req: Request) {
  try {
    // 1. Read raw body
    const rawBody = await req.text()
    console.log("[Polar webhook] Raw body received, length:", rawBody.length)

    // 2. Verify signature
    const secret = process.env.POLAR_WEBHOOK_SECRET
    if (!secret) {
      console.error("[Polar webhook] POLAR_WEBHOOK_SECRET not configured")
      return ok("missing secret")
    }

    // Verify using Polar's official SDK
    const headerPayload = await headers()
    const headersObj: Record<string, string> = {}
    headerPayload.forEach((value, key) => { headersObj[key] = value })

    let event: { type: string; data: Record<string, unknown> }
    try {
      event = validateEvent(rawBody, headersObj, secret) as { type: string; data: Record<string, unknown> }
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        console.error("[Polar webhook] Signature verification failed:", err.message)
      } else {
        console.error("[Polar webhook] Verification error:", err)
      }
      return ok("signature verification failed")
    }

    // 3. Log the full event for debugging
    console.log("[Polar webhook] Event:", event.type)
    console.log("[Polar webhook] Data:", JSON.stringify(event.data, null, 2))

    const sub = event.data

    // 4. Find user_id — try multiple locations
    const metadata = (sub.metadata ?? {}) as Record<string, string>
    const customerMetadata = (sub.customer_metadata ?? {}) as Record<string, string>
    const checkoutMeta = ((sub.checkout as Record<string, unknown>)?.metadata ?? {}) as Record<string, string>

    const userId: string | null =
      metadata.user_id ??
      customerMetadata.user_id ??
      checkoutMeta.user_id ??
      null

    if (!userId) {
      console.error("[Polar webhook] No user_id found in any metadata location")
      return ok("no user_id")
    }

    console.log("[Polar webhook] Resolved userId:", userId)

    const supabase = createAdminClient()
    const tier = resolveTier(sub)
    console.log("[Polar webhook] Resolved tier:", tier)

    // 5. Handle events
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated": {
        const product = sub.product as Record<string, unknown> | undefined

        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              polar_subscription_id: sub.id as string,
              polar_customer_id: (sub.customer_id as string) ?? (sub.customer as Record<string, unknown>)?.id ?? "",
              product_name: (product?.name as string) ?? tier,
              status: "active",
              current_period_end: (sub.current_period_end as string) ?? null,
              cancel_at_period_end: (sub.cancel_at_period_end as boolean) ?? false,
            },
            { onConflict: "polar_subscription_id" }
          )

        if (subError) {
          console.error("[Polar webhook] Subscription upsert failed:", subError)
        }

        // Upgrade profile tier
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ tier })
          .eq("id", userId)

        if (profileError) {
          console.error("[Polar webhook] Profile tier update failed:", profileError)
        } else {
          console.log("[Polar webhook] Profile updated to tier:", tier)
        }

        // Only send upgrade email on subscription.created (not .updated to avoid duplicates)
        if (tier !== "free" && event.type === "subscription.created") {
          getUserEmail(userId).then((email) => {
            if (email) {
              const dailyLimit = TIER_LIMITS[tier].dailyRecords
              sendEmail({
                to: email,
                subject: `Welcome to MockHero ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
                html: upgradeConfirmationEmail(tier, dailyLimit),
              }).catch(() => {})
            }
          }).catch(() => {})
        }

        break
      }

      case "subscription.canceled": {
        await supabase
          .from("subscriptions")
          .update({
            cancel_at_period_end: true,
            current_period_end: (sub.current_period_end as string) ?? null,
          })
          .eq("polar_subscription_id", sub.id as string)

        console.log("[Polar webhook] Subscription marked as canceling")
        break
      }

      case "subscription.revoked": {
        const { data: prevProfile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", userId)
          .maybeSingle()
        const previousTier = prevProfile?.tier ?? "pro"

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("polar_subscription_id", sub.id as string)

        await supabase
          .from("profiles")
          .update({ tier: "free" })
          .eq("id", userId)

        console.log("[Polar webhook] Subscription revoked, tier set to free")

        getUserEmail(userId).then((email) => {
          if (email) {
            sendEmail({
              to: email,
              subject: "Your MockHero plan has changed",
              html: downgradeConfirmationEmail(previousTier),
            }).catch(() => {})
          }
        }).catch(() => {})

        break
      }

      case "order.paid": {
        const creditPack = resolveCreditPack(sub)
        if (!creditPack) {
          console.log("[Polar webhook] order.paid but not a credit pack — ignoring")
          break
        }

        const credits = CREDIT_PACKS[creditPack].credits
        const { data: newBalance, error: creditError } = await supabase.rpc("add_credits", {
          p_user_id: userId,
          p_amount: credits,
        })

        if (creditError) {
          console.error("[Polar webhook] Credit addition failed:", creditError)
        } else {
          console.log(`[Polar webhook] Added ${credits} credits (${creditPack} pack). New balance: ${newBalance}`)
        }

        getUserEmail(userId).then((email) => {
          if (email) {
            sendEmail({
              to: email,
              subject: `${credits.toLocaleString()} credits added to your MockHero account`,
              html: `<p>Your <strong>${CREDIT_PACKS[creditPack].label}</strong> credit pack (${credits.toLocaleString()} credits) has been added to your account.</p><p>Credits never expire and are used automatically when you generate data.</p>`,
            }).catch(() => {})
          }
        }).catch(() => {})

        break
      }

      default:
        console.warn("[Polar webhook] Unhandled event:", event.type)
    }

    return ok()
  } catch (err) {
    console.error("[Polar webhook] Unhandled error:", err)
    return ok("error logged")
  }
}
