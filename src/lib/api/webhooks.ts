/**
 * Webhook delivery utility.
 * Delivers event payloads to user-registered webhook URLs (Scale tier only).
 * Uses HMAC-SHA256 signatures for verification.
 */

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Create an HMAC-SHA256 signature of the payload using the webhook secret.
 * Returns the hex-encoded signature prefixed with "sha256=".
 */
export async function createWebhookSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `sha256=${hex}`;
}

/** Attempt a single webhook delivery with timeout. Returns the HTTP status or null on network error. */
async function attemptDelivery(
  url: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs: number
): Promise<{ status: number } | { error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { status: response.status };
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}

/** Whether a delivery result is retryable (5xx or network error). */
function isRetryable(result: { status: number } | { error: string }): boolean {
  if ("error" in result) return true; // network error / timeout
  return result.status >= 500; // server error
}

/**
 * Deliver a webhook event to all active webhooks for a user.
 * Fire-and-forget with a 5-second timeout per attempt.
 * Retries once after 1 second for transient failures (5xx, timeout).
 */
export async function deliverWebhook(
  userId: string,
  event: string,
  payload: unknown
): Promise<void> {
  const supabase = createAdminClient();

  // Look up active webhooks for this user that subscribe to this event
  const { data: webhooks, error } = await supabase
    .from("webhooks")
    .select("id, url, secret, events")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error || !webhooks || webhooks.length === 0) {
    return;
  }

  // Filter to webhooks that subscribe to this event
  const matching = webhooks.filter(
    (wh: { events: string[] }) =>
      wh.events && wh.events.includes(event)
  );

  if (matching.length === 0) {
    return;
  }

  const body = JSON.stringify(payload);

  // Deliver to each webhook in parallel (fire-and-forget)
  const deliveries = matching.map(
    async (wh: { id: string; url: string; secret: string }) => {
      const deliveryId = crypto.randomUUID();
      const signature = await createWebhookSignature(body, wh.secret);
      const headers = {
        "X-MockHero-Event": event,
        "X-MockHero-Signature": signature,
        "X-MockHero-Delivery": deliveryId,
      };

      // First attempt
      let result = await attemptDelivery(wh.url, body, headers, 5000);

      // Retry once for transient failures (5xx or network error)
      if (isRetryable(result)) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await attemptDelivery(wh.url, body, headers, 5000);
      }

      // Log at appropriate level
      if ("error" in result) {
        console.error(
          `Webhook delivery ${deliveryId} to ${wh.url} failed: ${result.error}`
        );
      } else if (result.status >= 400) {
        console.warn(
          `Webhook delivery ${deliveryId} to ${wh.url} rejected: ${result.status}`
        );
      } else {
        console.log(
          `Webhook delivery ${deliveryId} to ${wh.url}: ${result.status}`
        );
      }
    }
  );

  await Promise.allSettled(deliveries);
}
