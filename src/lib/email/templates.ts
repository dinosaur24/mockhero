import {
  emailLayout,
  heading,
  paragraph,
  muted,
  ctaButton,
  codeBlock,
  divider,
  infoRow,
  APP_URL,
} from "./layout"

// ─── 1. Welcome ─────────────────────────────────────────────
export function welcomeEmail(name: string): string {
  return emailLayout(`
    ${heading("Welcome to MockHero")}
    ${paragraph(`Hey${name ? ` ${name}` : ""}, thanks for signing up.`)}
    ${paragraph("MockHero lets you generate realistic test data with a single API call. No seeding scripts, no CSV files, no lorem ipsum.")}
    ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
    ${divider()}
    ${muted("Quick start:")}
    ${codeBlock(`curl -X POST ${APP_URL}/api/v1/generate \\<br/>&nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \\<br/>&nbsp;&nbsp;-H "Content-Type: application/json" \\<br/>&nbsp;&nbsp;-d '{"tables":[{"name":"users","count":10,"fields":[{"name":"email","type":"email"}]}]}'`)}
    ${muted("Need help? Check the <a href=\"" + APP_URL + "/docs\" style=\"color:#4338CA;text-decoration:none;\">docs</a> or reply to this email.")}
  `)
}

// ─── 2. API Key Created ─────────────────────────────────────
export function apiKeyCreatedEmail(keyPrefix: string): string {
  return emailLayout(`
    ${heading("New API Key Created")}
    ${paragraph("A new API key was just created on your MockHero account.")}
    ${infoRow("Key prefix", `${keyPrefix}...`)}
    ${divider()}
    ${paragraph("If you didn't create this key, revoke it immediately from your dashboard.")}
    ${ctaButton("Manage API Keys", `${APP_URL}/dashboard/api-keys`)}
    ${muted("For security, we only show the full key once at creation time.")}
  `)
}

// ─── 3. Usage Warning (80%) ─────────────────────────────────
export function usageWarningEmail(used: number, limit: number, tier: string): string {
  const percent = Math.round((used / limit) * 100)
  return emailLayout(`
    ${heading("You've used " + percent + "% of your daily limit")}
    ${paragraph(`You've generated <strong>${used.toLocaleString()}</strong> of your <strong>${limit.toLocaleString()}</strong> daily records on the <strong>${tier}</strong> plan.`)}
    ${infoRow("Records used", used.toLocaleString())}
    ${infoRow("Daily limit", limit.toLocaleString())}
    ${infoRow("Plan", tier.charAt(0).toUpperCase() + tier.slice(1))}
    ${divider()}
    ${paragraph("Need more? Upgrade your plan for higher limits.")}
    ${ctaButton("View Plans", `${APP_URL}/dashboard/billing`)}
  `)
}

// ─── 4. Usage Limit Reached (100%) ──────────────────────────
export function usageLimitReachedEmail(limit: number, tier: string): string {
  return emailLayout(`
    ${heading("Daily limit reached")}
    ${paragraph(`You've hit your daily limit of <strong>${limit.toLocaleString()}</strong> records on the <strong>${tier}</strong> plan. Requests will return 429 until the limit resets at midnight UTC.`)}
    ${infoRow("Daily limit", limit.toLocaleString())}
    ${infoRow("Plan", tier.charAt(0).toUpperCase() + tier.slice(1))}
    ${infoRow("Resets at", "Midnight UTC")}
    ${divider()}
    ${paragraph("Upgrade now to keep generating without interruption.")}
    ${ctaButton("Upgrade Plan", `${APP_URL}/dashboard/billing`)}
  `)
}

// ─── 5. Upgrade Confirmation ────────────────────────────────
export function upgradeConfirmationEmail(newTier: string, dailyLimit: number): string {
  const tierName = newTier.charAt(0).toUpperCase() + newTier.slice(1)
  return emailLayout(`
    ${heading("Welcome to MockHero " + tierName)}
    ${paragraph(`Your account has been upgraded to the <strong>${tierName}</strong> plan. Your new limits are now active.`)}
    ${infoRow("Plan", tierName)}
    ${infoRow("Daily records", dailyLimit.toLocaleString())}
    ${infoRow("Status", "Active")}
    ${divider()}
    ${paragraph("Thank you for supporting MockHero. If you have any questions, just reply to this email.")}
    ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
  `)
}

// ─── 6. Downgrade / Cancellation ────────────────────────────
export function downgradeConfirmationEmail(previousTier: string): string {
  const prevName = previousTier.charAt(0).toUpperCase() + previousTier.slice(1)
  return emailLayout(`
    ${heading("Plan Changed")}
    ${paragraph(`Your <strong>${prevName}</strong> subscription has been canceled. You'll keep ${prevName} access until the end of your current billing period.`)}
    ${paragraph("After that, your account will switch to the Free plan with reduced limits.")}
    ${infoRow("Previous plan", prevName)}
    ${infoRow("New plan", "Free (after billing period)")}
    ${divider()}
    ${paragraph("Changed your mind? You can resubscribe anytime.")}
    ${ctaButton("View Plans", `${APP_URL}/dashboard/billing`)}
    ${muted("We'd love to know why you canceled. Just reply to this email.")}
  `)
}

// ─── 7. Payment Failed ──────────────────────────────────────
export function paymentFailedEmail(tier: string): string {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
  return emailLayout(`
    ${heading("Payment failed")}
    ${paragraph(`We couldn't process the payment for your <strong>${tierName}</strong> plan. Please update your payment method to keep your subscription active.`)}
    ${ctaButton("Update Payment", `${APP_URL}/dashboard/billing`)}
    ${divider()}
    ${muted("If your payment method isn't updated within 7 days, your account will be downgraded to the Free plan.")}
  `)
}

// ─── 8. Early Adopter ───────────────────────────────────────
export function earlyAdopterEmail(name: string, signupNumber: number): string {
  return emailLayout(`
    ${heading("You're Early Adopter #" + signupNumber)}
    ${paragraph(`Hey${name ? ` ${name}` : ""}, you're one of the first ${signupNumber <= 100 ? 100 : signupNumber} people to join MockHero. That means something to us.`)}
    ${paragraph("As a thank you, your Free plan gets <strong>10x the daily record limit</strong> — forever. No upgrade required.")}
    ${infoRow("Your number", `#${signupNumber}`)}
    ${infoRow("Daily records (Free)", "10,000 (normally 1,000)")}
    ${infoRow("Status", "Early Adopter")}
    ${divider()}
    ${paragraph("We're building MockHero for developers like you. If you have ideas, feedback, or just want to say hi — reply to this email.")}
    ${ctaButton("Start Building", `${APP_URL}/dashboard`)}
  `)
}
