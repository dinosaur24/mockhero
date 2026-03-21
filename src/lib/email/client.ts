const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY!
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "mg.mockhero.dev"
const MAILGUN_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`

const FROM = "MockHero <noreply@mg.mockhero.dev>"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!MAILGUN_API_KEY) {
    console.warn("[email] MAILGUN_API_KEY not set, skipping email:", subject)
    return
  }

  const form = new FormData()
  form.append("from", FROM)
  form.append("to", to)
  form.append("subject", subject)
  form.append("html", html)

  const response = await fetch(MAILGUN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
    },
    body: form,
  })

  if (!response.ok) {
    const body = await response.text()
    console.error("[email] Mailgun error:", response.status, body)
    throw new Error(`Mailgun error: ${response.status}`)
  }

  return response.json()
}
