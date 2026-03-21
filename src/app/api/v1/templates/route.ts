/**
 * GET /api/v1/templates
 * Public endpoint — no auth required.
 * Returns a lightweight list of all available schema templates.
 */

import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/engine/templates";

export async function GET() {
  const templates = listTemplates();

  return NextResponse.json(
    { templates },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
