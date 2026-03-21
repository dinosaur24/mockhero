/**
 * GET /api/v1/types
 * Public endpoint — no auth required.
 * Returns the complete field types catalog for agent discovery.
 * AI agents call this to understand what MockHero can generate.
 */

import { NextResponse } from "next/server";
import { FIELD_TYPE_CATALOG } from "@/lib/engine/field-type-catalog";

export async function GET() {
  return NextResponse.json(FIELD_TYPE_CATALOG, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
