const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mockhero.dev"

/**
 * Base email layout with MockHero branding.
 * Uses inline CSS for maximum email client compatibility.
 */
export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MockHero</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <a href="${APP_URL}" style="text-decoration:none;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:-0.02em;">
                <img src="${APP_URL}/logo.png" alt="" width="24" height="24" style="vertical-align:middle;margin-right:8px;border-radius:4px;" />MockHero
              </a>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;padding:40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                <a href="${APP_URL}" style="color:#a1a1aa;text-decoration:none;">MockHero</a> &middot; Synthetic Test Data API
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#d4d4d8;">
                You're receiving this because you have a MockHero account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Branded CTA button */
export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td style="background-color:#4338CA;border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

/** Section heading */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;line-height:1.3;">${text}</h1>`
}

/** Paragraph text */
export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">${text}</p>`
}

/** Muted/small text */
export function muted(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:13px;color:#71717a;line-height:1.6;">${text}</p>`
}

/** Code block */
export function codeBlock(text: string): string {
  return `<div style="background-color:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
  <code style="font-family:'SF Mono','Fira Code',monospace;font-size:13px;color:#0f172a;word-break:break-all;">${text}</code>
</div>`
}

/** Divider */
export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />`
}

/** Stat/info row */
export function infoRow(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
  <tr>
    <td style="font-size:14px;color:#71717a;padding:6px 0;">${label}</td>
    <td style="font-size:14px;color:#0f172a;font-weight:600;text-align:right;padding:6px 0;">${value}</td>
  </tr>
</table>`
}

export { APP_URL }
