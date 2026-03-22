/**
 * Polar API client for subscription billing.
 *
 * Required env vars:
 *   POLAR_ACCESS_TOKEN       — Polar API access token
 *   POLAR_PRO_PRODUCT_ID     — Product ID for Pro plan ($19/mo)
 *   POLAR_SCALE_PRODUCT_ID   — Product ID for Scale plan ($59/mo)
 *   POLAR_WEBHOOK_SECRET     — Webhook signing secret (Svix)
 *   NEXT_PUBLIC_APP_URL      — Base URL for redirects (e.g. https://mockhero.dev)
 *   POLAR_SANDBOX            — Set to "true" to use sandbox API
 */

import type { Tier } from "@/lib/utils/constants"

const POLAR_API = process.env.POLAR_SANDBOX === "true"
  ? "https://sandbox-api.polar.sh/v1"
  : "https://api.polar.sh/v1"

function getToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set")
  return token
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

/** Map tier → Polar product ID */
export function getProductId(tier: Tier): string {
  const map: Partial<Record<Tier, string | undefined>> = {
    pro: process.env.POLAR_PRO_PRODUCT_ID ?? process.env.POLAR_PRO_PRICE_ID,
    scale: process.env.POLAR_SCALE_PRODUCT_ID ?? process.env.POLAR_SCALE_PRICE_ID,
  }
  const id = map[tier]
  if (!id) throw new Error(`No Polar product ID configured for tier: ${tier}`)
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
  datafastVisitorId?: string
  datafastSessionId?: string
}): Promise<{ id: string; url: string }> {
  const productId = getProductId(params.tier)
  const appUrl = getAppUrl()

  const metadata: Record<string, string> = {
    user_id: params.userId,
    tier: params.tier,
  }
  if (params.datafastVisitorId) metadata.datafast_visitor_id = params.datafastVisitorId
  if (params.datafastSessionId) metadata.datafast_session_id = params.datafastSessionId

  const res = await fetch(`${POLAR_API}/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [productId],
      success_url: `${appUrl}/dashboard/billing?success=true`,
      customer_email: params.customerEmail,
      metadata,
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
