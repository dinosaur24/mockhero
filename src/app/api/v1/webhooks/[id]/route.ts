/**
 * DELETE /api/v1/webhooks/:id — Delete a webhook (Scale tier only, must own it)
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import {
  unauthorizedError,
  validationError,
  forbiddenFeatureError,
  internalError,
} from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateApiKey(request);
    if (!user) {
      return unauthorizedError();
    }

    if (user.tier !== "scale") {
      return forbiddenFeatureError("Webhooks", "Scale");
    }

    const { id } = await params;

    if (!id) {
      return validationError("Webhook id is required");
    }

    const supabase = createAdminClient();

    // Verify the webhook exists and belongs to this user
    const { data: webhook, error: fetchError } = await supabase
      .from("webhooks")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !webhook) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Webhook not found",
          },
        },
        { status: 404 }
      );
    }

    if (webhook.user_id !== user.user_id) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Webhook not found",
          },
        },
        { status: 404 }
      );
    }

    // Delete the webhook (include user_id for atomic ownership check)
    const { error: deleteError } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user_id);

    if (deleteError) {
      console.error("Failed to delete webhook:", deleteError);
      return internalError();
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Webhook DELETE error:", err);
    return internalError();
  }
}
