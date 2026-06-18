import { NextResponse } from "next/server";
import { buildAgentRecommendation } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildAgentRecommendation(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
