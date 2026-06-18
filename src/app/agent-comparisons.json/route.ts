import { NextResponse } from "next/server";
import { getAgentComparisonSummary } from "@/lib/competitors/comparisons";

export function GET() {
  return NextResponse.json(getAgentComparisonSummary(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
