/**
 * DELETE /api/dashboard/delete-account
 * Permanently deletes the user's account:
 * 1. Deletes Supabase profile row (cascade handles api_keys, usage_logs, webhooks, etc.)
 * 2. Deletes the Clerk user
 */

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unauthorizedError, internalError } from "@/lib/api/errors";

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedError();
  }

  try {
    const admin = createAdminClient();

    // 1. Delete profile from Supabase — ON DELETE CASCADE handles all related tables
    const { error: dbError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Delete account (Supabase) error:", dbError);
      return internalError("Failed to delete account data");
    }

    // 2. Delete the Clerk user
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(userId);
    } catch (clerkErr) {
      // Log but don't fail — Supabase data is already gone.
      // Orphaned Clerk users can be cleaned up manually or via Clerk dashboard.
      console.error("Delete account (Clerk) error:", clerkErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return internalError("Failed to delete account");
  }
}
