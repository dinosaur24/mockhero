/**
 * Polar API client for subscription billing.
 *
 * Required env vars:
 *   POLAR_ACCESS_TOKEN       — Polar API access token
 *   POLAR_PRO_PRICE_ID       — Price ID for Pro plan ($29/mo)
 *   POLAR_SCALE_PRICE_ID     — Price ID for Scale plan ($79/mo)
 *   POLAR_WEBHOOK_SECRET     — Webhook signing secret (Svix)
 *   NEXT_PUBLIC_APP_URL      — Base URL for redirects (e.g. https://mockhero.dev)
 */

import type { Tier } from "@/lib/utils/constants"

const POLAR_API = "https://api.polar.sh/v1"

function getToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set")
  return token
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

/** Map tier → Polar price ID */
export function getPriceId(tier: Tier): string {
  const map: Partial<Record<Tier, string | undefined>> = {
    pro: process.env.POLAR_PRO_PRICE_ID,
    scale: process.env.POLAR_SCALE_PRICE_ID,
  }
  const id = map[tier]
  if (!id) throw new Error(`No Polar price ID configured for tier: ${tier}`)
  return id
}

/**
 * Create a Polar checkout session.
 * Returns the checkout URL for redirect.
 */
export async function createCheckoutSession(params: {
  tier: Tier
  customerEmail: string
  userId: string
}): Promise<{ id: string; url: string }> {
  const priceId = getPriceId(params.tier)
  const appUrl = getAppUrl()

  const res = await fetch(`${POLAR_API}/checkouts/custom`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_price_id: priceId,
      success_url: `${appUrl}/dashboard/billing?success=true`,
      customer_email: params.customerEmail,
      metadata: {
        user_id: params.userId,
        tier: params.tier,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Polar checkout failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Cancel a Polar subscription at period end.
 */
export async function cancelSubscription(
  polarSubscriptionId: string
): Promise<void> {
  const res = await fetch(
    `${POLAR_API}/subscriptions/${polarSubscriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Polar cancel failed (${res.status}): ${body}`)
  }
}
