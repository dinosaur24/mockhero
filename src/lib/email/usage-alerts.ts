/**
 * Usage alert emails — sends at most one warning and one limit-reached email per user per day.
 * Uses in-memory tracking (resets on cold start, which is fine for serverless).
 */

import { clerkClient } from "@clerk/nextjs/server"
import { sendEmail, usageWarningEmail, usageLimitReachedEmail } from "@/lib/email"

// Track which users have been alerted today to avoid spam
const alertedToday = new Map<string, { warning: boolean; limit: boolean }>()
let lastCleanup = new Date().toISOString().split("T")[0]

function getAlertState(userId: string) {
  // Reset on new day
  const today = new Date().toISOString().split("T")[0]
  if (today !== lastCleanup) {
    alertedToday.clear()
    lastCleanup = today
  }

  if (!alertedToday.has(userId)) {
    alertedToday.set(userId, { warning: false, limit: false })
  }
  return alertedToday.get(userId)!
}

async function getUserEmailFromClerk(userId: string): Promise<string | null> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user.emailAddresses?.[0]?.emailAddress ?? null
  } catch {
    return null
  }
}

/**
 * Check usage thresholds and send alerts if needed.
 * Call this after a successful generation.
 */
export async function checkUsageAlerts(
  userId: string,
  used: number,
  limit: number,
  tier: string
) {
  const percent = used / limit
  const state = getAlertState(userId)

  // 80% warning
  if (percent >= 0.8 && percent < 1 && !state.warning) {
    state.warning = true
    const email = await getUserEmailFromClerk(userId)
    if (email) {
      sendEmail({
        to: email,
        subject: `You've used ${Math.round(percent * 100)}% of your daily limit`,
        html: usageWarningEmail(used, limit, tier),
      }).catch(() => {})
    }
  }

  // 100% limit reached
  if (percent >= 1 && !state.limit) {
    state.limit = true
    const email = await getUserEmailFromClerk(userId)
    if (email) {
      sendEmail({
        to: email,
        subject: "Daily limit reached",
        html: usageLimitReachedEmail(limit, tier),
      }).catch(() => {})
    }
  }
}
