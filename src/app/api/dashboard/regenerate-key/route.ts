/**
 * POST /api/dashboard/regenerate-key
 * Regenerates the current user's API key. Requires Clerk session auth.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { regenerateApiKey } from "@/lib/api/keys";
import { unauthorizedError, internalError } from "@/lib/api/errors";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedError();
  }

  try {
    const { rawKey, keyPrefix } = await regenerateApiKey(userId);
    return NextResponse.json({ rawKey, keyPrefix });
  } catch (err) {
    console.error("Key regeneration error:", err);
    return internalError("Failed to regenerate API key");
  }
}
