/**
 * Polar API client for subscription billing.
 *
 * Required env vars:
 *   POLAR_ACCESS_TOKEN       — Polar API access token
 *   POLAR_PRO_PRODUCT_ID     — Product ID for Pro plan ($29/mo)
 *   POLAR_SCALE_PRODUCT_ID   — Product ID for Scale plan ($79/mo)
 *   POLAR_AGENT_METERED_PRODUCT_ID — Product ID for agent metered usage
 *   POLAR_AGENT_RECORDS_EVENT_NAME — Optional Polar event name for record usage
 *   POLAR_WEBHOOK_SECRET     — Webhook signing secret (Svix)
 *   NEXT_PUBLIC_APP_URL      — Base URL for redirects (e.g. https://mockhero.dev)
 *   POLAR_SANDBOX            — Set to "true" to use sandbox API
 */

import type { Tier } from "@/lib/utils/constants"
import { AGENT_USAGE_PRICING } from "@/lib/utils/constants"

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

function getAgentProductId(): string {
  const id =
    process.env.POLAR_AGENT_METERED_PRODUCT_ID ??
    process.env.POLAR_AGENT_PRODUCT_ID
  if (!id) throw new Error("No Polar product ID configured for agent metered usage")
  return id
}

function getAgentRecordsEventName(): string {
  return process.env.POLAR_AGENT_RECORDS_EVENT_NAME ?? "mockhero.records.generated"
}

/** Map tier → Polar product ID */
export function getProductId(tier: Tier): string {
  const map: Partial<Record<Tier, string | undefined>> = {
    agent: process.env.POLAR_AGENT_METERED_PRODUCT_ID ?? process.env.POLAR_AGENT_PRODUCT_ID,
    pro: process.env.POLAR_PRO_PRODUCT_ID ?? process.env.POLAR_PRO_PRICE_ID,
    scale: process.env.POLAR_SCALE_PRODUCT_ID ?? process.env.POLAR_SCALE_PRICE_ID,
  }
  const id = map[tier]
  if (!id) throw new Error(`No Polar product ID configured for tier: ${tier}`)
  return id
}

/**
 * Create a Polar checkout session for an agent metered subscription.
 * This is loginless from MockHero's perspective; Polar remains Merchant of Record.
 */
export async function createAgentCheckoutSession(params: {
  email: string
  agentCheckoutId: string
  agentUserId: string
  claimUrl: string
}): Promise<{ id: string; url: string }> {
  const appUrl = getAppUrl()

  const metadata: Record<string, string> = {
    user_id: params.agentUserId,
    agent_user_id: params.agentUserId,
    agent_checkout_id: params.agentCheckoutId,
    checkout_source: "agent",
    tier: "agent",
    billing_model: "metered_records",
    price_usd_per_100_records: AGENT_USAGE_PRICING.priceUsdPer100Records,
    free_records_per_day: String(AGENT_USAGE_PRICING.freeRecordsPerDay),
  }

  const res = await fetch(`${POLAR_API}/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [getAgentProductId()],
      success_url: `${params.claimUrl}?checkout_id=${params.agentCheckoutId}`,
      return_url: `${appUrl}/agent-checkout.json`,
      customer_email: params.email,
      external_customer_id: params.agentUserId,
      customer_metadata: metadata,
      metadata,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Polar agent checkout failed (${res.status}): ${body}`)
  }

  return res.json()
}

export function isAgentUsageBillingConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
      (process.env.POLAR_AGENT_METERED_PRODUCT_ID || process.env.POLAR_AGENT_PRODUCT_ID)
  )
}

/**
 * Ingest billable agent usage into Polar. Configure the Polar meter to sum
 * metadata.record_units_100 for the event name returned by getAgentRecordsEventName().
 */
export async function ingestAgentUsageEvent(params: {
  externalCustomerId: string
  billableRecords: number
  totalRecords: number
  externalId: string
}): Promise<{ inserted: number; duplicates: number }> {
  const units100 = Math.ceil(params.billableRecords / 100)

  const res = await fetch(`${POLAR_API}/events/ingest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events: [
        {
          name: getAgentRecordsEventName(),
          external_id: params.externalId,
          external_customer_id: params.externalCustomerId,
          metadata: {
            billable_records: params.billableRecords,
            total_records: params.totalRecords,
            record_units_100: units100,
            free_records_per_day: AGENT_USAGE_PRICING.freeRecordsPerDay,
          },
        },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Polar usage event ingest failed (${res.status}): ${body}`)
  }

  return res.json()
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
  checkoutSource?: "agent"
}): Promise<{ id: string; url: string }> {
  const productId = getProductId(params.tier)
  const appUrl = getAppUrl()

  const metadata: Record<string, string> = {
    user_id: params.userId,
    tier: params.tier,
  }
  if (params.datafastVisitorId) metadata.datafast_visitor_id = params.datafastVisitorId
  if (params.datafastSessionId) metadata.datafast_session_id = params.datafastSessionId
  if (params.checkoutSource) metadata.checkout_source = params.checkoutSource

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
