const BREVO_API_KEY = process.env.BREVO_API_KEY!
const BREVO_URL = "https://api.brevo.com/v3/smtp/email"

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@mockhero.dev"
const FROM_NAME = "MockHero"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!BREVO_API_KEY) {
    console.warn("[email] BREVO_API_KEY not set, skipping email:", subject)
    return
  }

  const response = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error("[email] Brevo error:", response.status, body)
    throw new Error(`Brevo error: ${response.status}`)
  }

  return response.json()
}
