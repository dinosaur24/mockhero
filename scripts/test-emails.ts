/**
 * Send all 7 email templates via SMTP.
 * Usage: npx tsx scripts/test-emails.ts
 */

import { config } from "dotenv"
config({ path: ".env.local" })
import { createTransport } from "nodemailer"

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "notifications@mockhero.dev"
const TO_EMAIL = "sakomandino@gmail.com"

const transport = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN!,
    pass: process.env.BREVO_SMTP_KEY!,
  },
})

const APP_URL = "https://mockhero.dev"

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 0 32px 0;">
          <a href="${APP_URL}" style="text-decoration:none;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:-0.02em;"><img src="${APP_URL}/logo.png" alt="" width="24" height="24" style="vertical-align:middle;margin-right:8px;border-radius:4px;"/>MockHero</a>
        </td></tr>
        <tr><td style="background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;padding:40px 32px;">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 0 0 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
            <a href="${APP_URL}" style="color:#a1a1aa;text-decoration:none;">MockHero</a> &middot; Synthetic Test Data API
          </p>
          <p style="margin:8px 0 0 0;font-size:11px;color:#d4d4d8;">You're receiving this because you have a MockHero account.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr>
    <td style="background-color:#4338CA;border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${text}</a>
    </td></tr></table>`
}

function h(text: string) { return `<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">${text}</h1>` }
function p(text: string) { return `<p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">${text}</p>` }
function muted(text: string) { return `<p style="margin:0 0 16px 0;font-size:13px;color:#71717a;line-height:1.6;">${text}</p>` }
function hr() { return `<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;"/>` }
function row(label: string, value: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;"><tr>
    <td style="font-size:14px;color:#71717a;padding:6px 0;">${label}</td>
    <td style="font-size:14px;color:#0f172a;font-weight:600;text-align:right;padding:6px 0;">${value}</td>
  </tr></table>`
}
function code(text: string) {
  return `<div style="background-color:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
  <code style="font-family:monospace;font-size:13px;color:#0f172a;word-break:break-all;">${text}</code></div>`
}

const templates = [
  {
    subject: "[Test] Welcome to MockHero",
    html: emailLayout(`
      ${h("Welcome to MockHero")}
      ${p("Hey Dino, thanks for signing up.")}
      ${p("MockHero lets you generate realistic test data with a single API call. No seeding scripts, no CSV files, no lorem ipsum.")}
      ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
      ${hr()}
      ${muted("Quick start:")}
      ${code(`curl -X POST ${APP_URL}/api/v1/generate -H "Authorization: Bearer mh_abc123..."  -d '{"tables":[{"name":"users","count":10}]}'`)}
      ${muted(`Need help? Check the <a href="${APP_URL}/docs" style="color:#4338CA;text-decoration:none;">docs</a> or reply to this email.`)}
    `),
  },
  {
    subject: "[Test] New API Key Created",
    html: emailLayout(`
      ${h("New API Key Created")}
      ${p("A new API key was just created on your MockHero account.")}
      ${row("Key prefix", "mh_7a1c3b...")}
      ${hr()}
      ${p("If you didn't create this key, revoke it immediately from your dashboard.")}
      ${ctaButton("Manage API Keys", `${APP_URL}/dashboard/api-keys`)}
      ${muted("For security, we only show the full key once at creation time.")}
    `),
  },
  {
    subject: "[Test] You've used 82% of your daily limit",
    html: emailLayout(`
      ${h("You've used 82% of your daily limit")}
      ${p("You've generated <strong>820</strong> of your <strong>1,000</strong> daily records on the <strong>Free</strong> plan.")}
      ${row("Records used", "820")}
      ${row("Daily limit", "1,000")}
      ${row("Plan", "Free")}
      ${hr()}
      ${p("Need more? Upgrade your plan for higher limits.")}
      ${ctaButton("View Plans", `${APP_URL}/dashboard/billing`)}
    `),
  },
  {
    subject: "[Test] Daily limit reached",
    html: emailLayout(`
      ${h("Daily limit reached")}
      ${p("You've hit your daily limit of <strong>1,000</strong> records on the <strong>Free</strong> plan. Requests will return 429 until the limit resets at midnight UTC.")}
      ${row("Daily limit", "1,000")}
      ${row("Plan", "Free")}
      ${row("Resets at", "Midnight UTC")}
      ${hr()}
      ${p("Upgrade now to keep generating without interruption.")}
      ${ctaButton("Upgrade Plan", `${APP_URL}/dashboard/billing`)}
    `),
  },
  {
    subject: "[Test] Upgraded to MockHero Pro",
    html: emailLayout(`
      ${h("Welcome to MockHero Pro")}
      ${p("Your account has been upgraded to the <strong>Pro</strong> plan. Your new limits are now active.")}
      ${row("Plan", "Pro")}
      ${row("Daily records", "100,000")}
      ${row("Status", "Active")}
      ${hr()}
      ${p("Thank you for supporting MockHero. If you have any questions, just reply to this email.")}
      ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
    `),
  },
  {
    subject: "[Test] Your MockHero plan has changed",
    html: emailLayout(`
      ${h("Plan Changed")}
      ${p("Your <strong>Pro</strong> subscription has been canceled. You'll keep Pro access until the end of your current billing period.")}
      ${p("After that, your account will switch to the Free plan with reduced limits.")}
      ${row("Previous plan", "Pro")}
      ${row("New plan", "Free (after billing period)")}
      ${hr()}
      ${p("Changed your mind? You can resubscribe anytime.")}
      ${ctaButton("View Plans", `${APP_URL}/dashboard/billing`)}
      ${muted("We'd love to know why you canceled. Just reply to this email.")}
    `),
  },
  {
    subject: "[Test] Payment failed",
    html: emailLayout(`
      ${h("Payment failed")}
      ${p("We couldn't process the payment for your <strong>Pro</strong> plan. Please update your payment method to keep your subscription active.")}
      ${ctaButton("Update Payment", `${APP_URL}/dashboard/billing`)}
      ${hr()}
      ${muted("If your payment method isn't updated within 7 days, your account will be downgraded to the Free plan.")}
    `),
  },
]

async function main() {
  // Send only first email if --one flag, otherwise all
  const sendOne = process.argv.includes("--one")
  const list = sendOne ? [templates[0]] : templates
  console.log(`Sending ${list.length} test email(s) to ${TO_EMAIL} via SMTP...\n`)

  let sent = 0
  for (const t of list) {
    try {
      await transport.sendMail({
        from: `MockHero <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        subject: t.subject,
        html: t.html,
      })
      console.log(`  ✓ ${t.subject}`)
      sent++
    } catch (err: any) {
      console.error(`  ✗ ${t.subject}: ${err.message}`)
    }
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log(`\nDone: ${sent}/${templates.length} sent.`)
  process.exit(0)
}

main().catch(console.error)
