import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, welcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  // 1. Verify webhook signature using Svix
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // 2. Handle user.created event
  if (evt.type === "user.created") {
    const { id, first_name, last_name, image_url, email_addresses } = evt.data;
    const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address;

    const supabase = createAdminClient();

    // Create profile
    const { error } = await supabase.from("profiles").insert({
      id: id,
      display_name:
        [first_name, last_name].filter(Boolean).join(" ") || null,
      avatar_url: image_url ?? null,
      tier: "free",
    });

    if (error) {
      console.error("Failed to create profile:", error);
      return new Response("Failed to create profile", { status: 500 });
    }

    // Send welcome email (fire-and-forget — don't block webhook response)
    if (primaryEmail) {
      const displayName = [first_name, last_name].filter(Boolean).join(" ");
      sendEmail({ to: primaryEmail, subject: "Welcome to MockHero", html: welcomeEmail(displayName) }).catch(() => {});
    }
  }

  // 3. Handle user.deleted event
  if (evt.type === "user.deleted") {
    const deletedUserId = evt.data.id;
    if (deletedUserId) {
      const supabase = createAdminClient();

      // Deactivate all API keys first (belt-and-suspenders before cascade)
      await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("user_id", deletedUserId);

      // Delete profile — ON DELETE CASCADE handles api_keys, usage_logs, webhooks, etc.
      await supabase
        .from("profiles")
        .delete()
        .eq("id", deletedUserId);
    }
  }

  return new Response("OK", { status: 200 });
}
